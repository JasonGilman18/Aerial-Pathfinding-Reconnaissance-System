import cv2 as cv
import numpy as np

MAX_FEATURES = 500
GOOD_MATCH_PERCENT = 0.10
HOMOGRAPHY_THRESHOLD = 20000

def align(base, img):
    """Aligns one image to another.
    Returns img feature-aligned to base

    base -- The image to detect features in and align img to
    img  -- The image to align and return
    
    Taken from: https://learnopencv.com/feature-based-image-alignment-using-opencv-c-python/
    Modified to return None when enountering extreme homography
    """

    # Convert images to grayscale
    baseGray = cv.cvtColor(base, cv.COLOR_BGR2GRAY)
    imgGray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

    # Detect ORB features and compute descriptors.
    orb = cv.ORB_create(MAX_FEATURES)
    keypoints_base, descriptors_base = orb.detectAndCompute(baseGray, None)
    keypoints_img, descriptors_img = orb.detectAndCompute(imgGray, None)

    # Match features.
    matcher = cv.DescriptorMatcher_create(cv.DESCRIPTOR_MATCHER_BRUTEFORCE_HAMMING)
    matches = matcher.match(descriptors_base, descriptors_img, None)

    # Sort matches by score
    matches.sort(key=lambda x: x.distance, reverse=False)

    # Remove not so good matches
    numGoodMatches = int(len(matches) * GOOD_MATCH_PERCENT)
    matches = matches[:numGoodMatches]

    # Draw top matches
    #imMatches = cv.drawMatches(base, keypoints_base, img, keypoints_img, matches, None)
    #cv.imwrite("matches.jpg", imMatches)

    # Extract location of good matches
    points_base = np.zeros((len(matches), 2), dtype=np.float32)
    points_img = np.zeros((len(matches), 2), dtype=np.float32)

    # Return None if homography is too extreme
    for i, match in enumerate(matches):
        points_base[i, :] = keypoints_base[match.queryIdx].pt
        points_img[i, :] = keypoints_img[match.trainIdx].pt

    # Find homography
    h, mask = cv.findHomography(points_base, points_img, cv.RANSAC)
    
    # Discard result if homography is too extreme
    if np.sum(h*h) > HOMOGRAPHY_THRESHOLD:
        return None

    # Use homography
    height, width, channels = img.shape
    baseReg = cv.warpPerspective(base, h, (width, height))

    return baseReg


def align_all(imgs):
    """Stabilizes an array of images to the perspective in the first image.
    Returns an array of images

    imgs -- Array of images to align
    """
    # Return unmodified first image
    arr = []
    for img in imgs:
        # Calculate the aligned image, ignoring bad results
        aligned = align(img, imgs[0])
        if aligned is None:
            continue
        # Append the aligned image
        arr.append(aligned)
    return arr


def remove_motion(imgs):
    """Removes motion in the scene represented by an array of images
    Returns one image

    imgs -- Array of images representing the scene

    The perspective in the output will be that of the first image in the array
    """
    # Turn black pixels into NaN and take median (ignoring NaN) for each pixel
    stab = np.asarray(align_all(imgs), float).astype(float)
    stab[stab == 0] = np.nan
    return np.nanmedian(stab, axis=0).astype(dtype=np.uint8)