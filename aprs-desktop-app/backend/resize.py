import numpy as np

def is_obstacle(chunk):
    # Return 0 if the chunk should be reduced to an obstacle.
    threshold = 1 # Could try np.average(np.shape(chunk))
    if np.count_nonzero(chunk==0) > threshold:
        return 0
    else:
        return 1

def resize(mat, rov_w, rov_h):
    # Gather dimensions
    height = np.shape(mat)[0]
    width = np.shape(mat)[1]
    # Gather chunks
    chunks = []
    for y in range(0, height-rov_h, rov_h):
        chunks.append([]) # Appending a new row
        for x in range(0, width-rov_w, rov_w):
            # Appending chunk to the last row
            chunks[-1].append(mat[y:y+rov_w, x:x+rov_w])
    # Apply chunk reduction to each chunk and return
    chunks = list(map(lambda a: list(map(is_obstacle, a)), chunks))
    return np.array(chunks)
