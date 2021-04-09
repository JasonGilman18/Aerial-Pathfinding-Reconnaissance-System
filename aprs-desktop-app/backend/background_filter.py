#!/usr/bin/env python

# Imports needed for library code
import cv2 as cv
import numpy as np
# Imports needed for unit test
import sys
from matplotlib import pyplot as plt


def background_filter(video, points=5):
    """Uses a median-of-frames algorithm to determine a static background.

    video   -- video input (e.g. from cv.VideoCapture)
    points  -- number of video frames to use for median.
    """
    # Find frames distributed throughout the video
    frameIds = video.get(cv.CAP_PROP_FRAME_COUNT) \
        * np.linspace(0, 1, points)
    if points < 2:
        raise ValueError("Number of points must be at least 2.")
    frameIds[-1] = frameIds[-1] - 1;  # Nth frame is out of bounds; use N-1
    frames = []
    # Gather those frames
    for fid in frameIds:
        video.set(cv.CAP_PROP_POS_FRAMES, fid)
        success, frame = video.read()
        # Error check -- append only on success.
        if success:
            frames.append(frame)
    # If there are not enough frames, we can not calculate a median.
    if len(frames) < 2:
        print("Warning: Not enough frames to calculate a median.")
        #raise RuntimeError("Not enough frames to calculate a median.")
    # Calculate a median frame among those sampled and return it.
    medianFrame = np.median(frames, axis=0).astype(dtype=np.uint8)
    return medianFrame


#
#       End of library code. Unit testing begins below.
#


def unit_test(videofile, points=5):
    vid = cv.VideoCapture(videofile)
    bg = background_filter(vid, points)
    vid.release()
    plt.imshow(cv.cvtColor(bg, cv.COLOR_BGR2RGB))
    plt.show()


if __name__ == '__main__':
    if (len(sys.argv) > 2):
        unit_test(sys.argv[1], int(sys.argv[2]))
    else:
        unit_test(sys.argv[1])
