#!/usr/bin/env python

# Imports needed for library code
import cv2 as cv
import numpy as np
# Imports needed for unit test
import sys
from matplotlib import pyplot as plt
import depth_inference as di
import time


def overlap(left, l_amt, right, r_amt):
    """Horizontally concatenates two overlapping images.

    left  -- left image
    l_amt -- amount to chop off of right side of left
    right -- right image
    l_amt -- amount to chop off of left side of right
    """
    # Horizontally stack the two images after truncation
    return np.hstack((left[:, :-l_amt], right[:, r_amt:]))


def seam(left, l_offset, right, r_offset, vtrim=1/4, cols=32):
    """Calculates each pixel difference in values along a vertical line.
    Same argument semantics as overlap.

    left  -- left image
    l_amt -- index of slice from right side of left
    right -- right image
    r_amt -- index of slice from left side of right
    vtrim -- fraction of image height to ignore from vertical edges
             ^ Useful to counter lens distortion at edges
    cols  -- number of columns to compare on each side
    """
    # Decide how many pixels to ignore from vertical edges
    height = min(np.shape(left)[0], np.shape(right)[0])
    vtrim = int(height * vtrim)
    # Collect differences between x-positions in depth maps
    return right[vtrim:-vtrim, r_offset:r_offset+cols] - left[vtrim:-vtrim, -l_offset:-l_offset+cols]


def seam_heuristic(seam):
    return np.std(seam)


def merge2(left, right):
    """Merge two disparity maps."""
    # Correct for maps of different height by padding the shorter one
    # Collect heights
    heightL = np.shape(left)[0]
    heightR = np.shape(right)[0]
    # Decide which map needs padding and pad with zeroes.
    if heightL > heightR:
        right = np.pad(right, [(0, heightL-heightR), (0, 0)], mode='constant')
    elif heightR > heightL:
        left = np.pad(left, [(0, heightR-heightL), (0, 0)], mode='constant')
    # Collect width as min of either. No need for padding on this axis.
    width = min(np.shape(left)[1], np.shape(right)[1])
    # Decide a minimum and maximum offset for stitching
    min_offset = width//4
    max_offset = width//2
    # Stage 1: Find a rough overlap by cutting equal sides of left and right
    seams = list(map(lambda n: seam(left, n, right, n),
                     range(min_offset, max_offset)))
    seam_vals = list(map(seam_heuristic, seams))
    r_offset = seam_vals.index(min(seam_vals)) + min_offset
    # Stage 2: Refine the overlap to account for limitations of stage 1
    seams = list(map(lambda n: seam(left, n, right, r_offset),
                     range(min_offset, max_offset)))
    seam_vals = list(map(seam_heuristic, seams))
    l_offset = seam_vals.index(min(seam_vals)) + min_offset
    print('Chosen seam is at', np.shape(left)[1]-l_offset)
    # Return the final result with a crude average error correction
    mean_diff = np.mean(seams[l_offset - min_offset])
    right = right - mean_diff
    return overlap(left, l_offset, right, r_offset)


def merge_row(disps):
    """Merge several disparity maps together.
    Returns a single disparity map.

    disps -- Array of maps to merge. Should be ordered left to right
    """
    # Perform a reduction of merge2 along disps
    v = disps[0]
    for d in disps[1:]:
        v = merge2(v, d)
    return v

def merge_depths(disps): 
    """Merge a grid of disparity maps together.
    Returns a single disparity map.

    disps -- Matrix of maps to merge.
    """
    # Apply merge_row on each row, then transpose and merge again
    rows = list(map(merge_row, disps))
    rows = list(map(np.transpose, rows))
    merged = merge_row(rows)
    merged = np.transpose(merged)
    return merged



#
#       End of library code. Unit testing begins below.
#

#
#           O B S O L E T E   B E L O W
#
## TODO: Better testing, esp. using a 2D-capable merge function
#def row_test(row, downscale, min_disp, sigma):
#    letters = []
#    pairs = {}
#    for i in range(ord('a'), ord('z')):
#        c = chr(i)
#        imgL = cv.imread(c + row + ' (1).png')
#        if (imgL is None):
#            break
#        imgR = cv.imread(c + row + ' (2).png')
#        pairs[c] = (imgL, imgR)
#        letters.append(c)
#    if len(letters) == 0:
#        return None
#    maps = []
#    for c in letters:
#        imgL = pairs[c][0]
#        imgR = pairs[c][1]
#        print('Calculating depth map for pair {}{}'.format(c.upper(), row))
#        elapsed = time.time()
#        disp = di.depth_inference(imgL, imgR, downscale, min_disp, sigma)
#        elapsed = time.time() - elapsed
#        imgLsize = np.shape(imgL)[0] * np.shape(imgL)[1]
#        imgRsize = np.shape(imgR)[0] * np.shape(imgR)[1]
#        print('Speed:',
#              (imgLsize+imgRsize) / 2 / elapsed / (2**20),
#              'MP/s (x2)')
#        print("Map contains", np.count_nonzero(disp < 0), "invalid values")
#        maps.append(disp)
#    print('Merging depth maps segments in row', row.upper())
#    merged = merge_depths(maps)
#    return merged
#
#
#if __name__ == '__main__':
#    downscale = 3
#    min_disp = 0
#    sigma = 2.0
#    if len(sys.argv) > 3:
#        downscale = int(sys.argv[1])
#        min_disp = int(sys.argv[2])
#        sigma = float(sys.argv[3])
#    rows = []
#    for i in range(1, 26):
#        row = row_test(str(i), downscale, min_disp, sigma)
#        if row is None:
#            break
#        else:
#            rows.append(row)
#    if (len(rows) > 1):
#        print('Merging all rows')
#        merged = np.transpose(merge_depths(list(map(np.transpose, rows))))
#    else:
#        merged = rows[0]
#    plt.imshow(merged)#, vmin=500, vmax=900)
#    plt.show()
