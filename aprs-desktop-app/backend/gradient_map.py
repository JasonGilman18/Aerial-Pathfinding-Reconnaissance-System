#!/usr/bin/env python

# Imports needed for library code
import numpy as np
# Imports needed for unit test
import sys
import cv2 as cv
from matplotlib import pyplot as plt
from depth_inference import depth_inference as img2dep


def gradient_map(dispmap):
    """Depth to gradient. Implements a simple Sobel filter.
    For simplicity, edges are rolled over as on a torus.

    dispmap -- Disparity map to derive a gradient from
    """
    # Collect vertical and horizontal differences
    dx = np.roll(dispmap, 1, axis=1) - dispmap
    dy = np.roll(dispmap, -1, axis=0) - dispmap
    # Return Euclidean differences by sqrt(dx^2 + dy^2)
    return np.sqrt(np.clip(np.square(dx) + np.square(dy), 0, None))


def mark_obstacles(grad, height):
    """Mark obstacles.
    For each element, set to 1 if less than threshold, 0 otherwise.
    """
    # Consider any slope too steep an obstacle boundary.
    return grad < height


#
#       End of library code. Unit testing begins below.
#


def unit_test(leftfile, rightfile, downscale, min_disp, sigma):
    left_image = cv.imread(leftfile)
    right_image = cv.imread(rightfile)
    if left_image is None or right_image is None:
        raise Exception("One or more images not found")
    disparity = img2dep(left_image, right_image, downscale, min_disp, sigma)
    plt.imshow(disparity, 'binary')
    plt.show()
    grad = gradient_map(disparity)
    plt.imshow(grad)
    plt.show()
    obs = mark_obstacles(grad, 10)
    plt.imshow(obs, 'binary')
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
