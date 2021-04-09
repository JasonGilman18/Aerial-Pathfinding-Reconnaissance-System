#!/usr/bin/python

# Imports needed for library code
import cv2 as cv
# Imports needed for unit test
import sys
import time
import numpy as np
from matplotlib import pyplot as plt

num_disparities = 64


def depth_inference(
        left_image,
        right_image,
        downscale_factor=3,
        min_disparity=4,
        sigma=2.0):
    """Produces a depth map from two stereoscopic images.
    Returns a filtered disparity map

    left_image       -- Left "eye" view (image, e.g. from cv.imread)
    right_image      -- Right "eye" view (image, e.g. from cv.imread)
    downscale_factor -- The factor by which to downsize image inputs.
                        This helps with parameter generality, so values
                        closer to 1 will make tweaking others more important.
    min_disparity    -- The minimum local disparity between views.
                        This is the most important parameter to tweak if a
                        depth map contains erroneous values or lacks features.
    sigma            -- The "sigma" value for post-process filtering.
                        This value is important to tweak if the output map
                        contains "speckles" or is too noisy or smooth.

    If the output appears to be completely "blank", i.e. mostly one depth,
    both min_disparity and sigma may need to be adjusted.
    These values are set to "sensible defaults" though they will almost
    certainly not be adequate in all (or even most) cases.
    """
    # Downscale source images according to the argument
    h, w = left_image.shape[:2]
    dim = (w//downscale_factor, h//downscale_factor)
    left_image = cv.resize(left_image, dim)
    right_image = cv.resize(right_image, dim)
    # Generate the two depthmaps (left->right and right->left)
    left_matcher = cv.StereoSGBM_create(
        minDisparity=min_disparity,
        numDisparities=num_disparities,
        blockSize=15)
    right_matcher = cv.ximgproc.createRightMatcher(left_matcher)
    # Calculate disparities
    left_disparity = left_matcher.compute(left_image,  right_image)
    right_disparity = right_matcher.compute(right_image, left_image)
    # Filter out inconsistencies and extremities
    wls_filter = cv.ximgproc.createDisparityWLSFilter(left_matcher)
    wls_filter.setLambda(8000.0)
    wls_filter.setSigmaColor(sigma)
    filtered_disparity = wls_filter.filter(left_disparity, left_image,
                                           disparity_map_right=right_disparity)
    # Return the output object, minus dead section on LHS
    return filtered_disparity[:, min_disparity+num_disparities:]


#
#       End of library code. Unit testing begins below.
#


def unit_test(leftfile, rightfile, downscale, min_disp, sigma):
    left_image = cv.imread(leftfile)
    right_image = cv.imread(rightfile)
    if left_image is None or right_image is None:
        raise Exception("One or more images not found")
    start = time.time()
    disparity = depth_inference(left_image, right_image,
                                downscale, min_disp, sigma)
    end = time.time()
    elapsed = end - start
    print("Depth inference took", elapsed, "seconds")
    imgLsize = np.shape(left_image)[0] * np.shape(left_image)[1]
    imgRsize = np.shape(right_image)[0] * np.shape(right_image)[1]
    mp = (imgLsize+imgRsize) / 2 / elapsed / (2**20)
    print("Processing speed:", mp, "MP/s (x2)")
    print("Map contains", np.count_nonzero(disparity < 0), "invalid values")
    plt.imshow(disparity, 'binary')
    plt.show()


if __name__ == '__main__':
    downscale = 3
    min_disp = 0
    sigma = 2.0
    if len(sys.argv) > 5:
        downscale = int(sys.argv[3])
        min_disp = int(sys.argv[4])
        sigma = float(sys.argv[5])
    unit_test(sys.argv[1], sys.argv[2], downscale, min_disp, sigma)
