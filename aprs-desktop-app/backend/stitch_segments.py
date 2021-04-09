#!/usr/bin/env python

# Imports needed for library code
import cv2 as cv
# Imports needed for unit test
from matplotlib import pyplot as plt


def stitch_segments(images):
    """Stitches background (or other) images into one.

    images -- image objects (e.g. from cv.imread)
    """
    # Use OpenCV stitching in scan mode to collect overhead views into one.
    stitcher = cv.Stitcher_create(cv.Stitcher_SCANS)
    (status, stitched) = stitcher.stitch(images)
    if status != 0:
        raise Exception("Stitching failed with error {}".format(status))
    return stitched


#
#       End of library code. Unit testing begins below.
#


def unit_test(imagefiles):
    images = list(map(cv.imread, sys.argv[2:]))
    merged = stitch_segments(images)
    plt.imshow(cv.cvtColor(merged, cv.COLOR_BGR2RGB))
    plt.show()


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        raise Exception("Not enough inputs")
    unit_test(sys.argv[1:])
