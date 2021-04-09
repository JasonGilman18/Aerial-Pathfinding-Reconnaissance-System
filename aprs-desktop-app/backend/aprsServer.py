#import server specific depend.
from flask import Flask, jsonify
from flask.helpers import send_file
from flask_restful import Resource, Api
from flask_cors import CORS
from PIL import Image
import os
import base64
import dill

#import cmp vision depend.
import sys
import multiprocessing
from time import time
import cv2 as cv
import matplotlib
import numpy as np
matplotlib.use("agg")
import matplotlib.pyplot as plt
import stabilization as st
import depth_inference as di
import gradient_map as gm
import merge_depths as md
import stitch_segments as ss
import resize as rs
import AStar as az


app = Flask(__name__)
CORS(app)
api = Api(app)


class cvopen(Resource):
    def get(self):
        pairs = []
        #print('Loading videos and converting to backgrounds...')
        row = 0
        col = 0
        while True: # For each row
            pairs.append([])
            done = 0
            while True: # For each column
                # Open the image files
                namebase = f'{row}_{col}' # NOTE: Row-major ordering
                filename = os.path.join(app.static_folder, "images", namebase)
                imgsL = load_image_array(filename + '_l')
                imgsR = load_image_array(filename + '_r')
                # If either could not open, we must be done loading videos
                if len(imgsL) == 0 or len(imgsR) == 0:
                    if col == 0:
                        done = 1
                    break
                #print(f'Images loaded for ({col}, {row})')
                # Remove motion and append
                #print('Processing left eye')
                imgL = st.remove_motion(imgsL)
                #plt.imshow(cv.cvtColor(imgL, cv.COLOR_BGR2RGB))
                #plt.show()
                #print('Processing right eye')
                imgR = st.remove_motion(imgsR)
                #plt.imshow(cv.cvtColor(imgR, cv.COLOR_BGR2RGB))
                #plt.show()
                pair = (imgL, imgR)
                pairs[-1].append(pair)
                col = col + 1
            row = row + 1
            col = 0
            if done:
                break
        del pairs[-1] # Remove last row, which will be empty

        savePairDataFilename = os.path.join(app.static_folder, 'cv_data', 'pairs.pickle')
        pairDataFile = open(savePairDataFilename, "wb")
        dill.dump(pairs, pairDataFile)
        pairDataFile.close()
        
        return "cv step 1 complete"

        
class cvdepth(Resource):
    def get(self, downscale, min_disp, sigma):

        #open data from prev phase
        savePairDataFilename = os.path.join(app.static_folder, 'cv_data', 'pairs.pickle')
        pairDataFile = open(savePairDataFilename, "rb")
        pairs = dill.load(pairDataFile)
        pairDataFile.close()

        disp = di.depth_inference(pairs[0][0][0], pairs[0][0][1], downscale, min_disp, sigma)
        
        plt.imshow(disp, 'binary')
        saveImgFilename = os.path.join(app.static_folder, 'cv_data', 'depthMap.png')
        plt.savefig(saveImgFilename)

        return send_file(saveImgFilename)


class cvdepth2(Resource):
    def get(self, downscale, min_disp, sigma):
        savePairDataFilename = os.path.join(app.static_folder, 'cv_data', 'pairs.pickle')
        pairDataFile = open(savePairDataFilename, "rb")
        pairs = dill.load(pairDataFile)
        pairDataFile.close()

        infer = lambda tup: di.depth_inference(tup[0], tup[1], downscale, min_disp, sigma)
        infer_row = lambda row: list(map(infer, row))
        maps = list(map(infer_row, pairs))

        saveMapDataFilename = os.path.join(app.static_folder, 'cv_data', 'maps.pickle')
        mapDataFile = open(saveMapDataFilename, "wb")
        dill.dump(maps, mapDataFile)
        mapDataFile.close()

        return "cv step 2 done"


class cvpath(Resource):
    def get(self):

        obs_thresh = 6
        resize_x = 5
        resize_y = 5

        saveMapDataFilename = os.path.join(app.static_folder, 'cv_data', 'maps.pickle')
        mapDataFile = open(saveMapDataFilename, "rb")
        maps = dill.load(mapDataFile)
        mapDataFile.close()

        merged = md.merge_depths(maps)
        grad = gm.gradient_map(merged)
        obs = gm.mark_obstacles(grad, obs_thresh)
        res = rs.resize(obs, resize_x, resize_y)

        navInstructions = az.path_finding(res, [17,40], [45,110])
        for i in navInstructions:
            res[i[1]][i[0]] = -1

        plt.imshow(res, cmap="RdGy")
        saveNavImgFilename = os.path.join(app.static_folder, 'cv_data', 'navMap.png')
        plt.savefig(saveNavImgFilename)

        imgFile = open(saveNavImgFilename, 'rb')
        img = base64.b64encode(imgFile.read())
        img = str(img)[2:-1]
        imgFile.close()

        return jsonify({'img': img, 'nav': navInstructions})
        

class mapAssets(Resource):
    def get(self, z, x, y):

        filename = y + '.png'

        #app.static_folder may be overwritten in the electron directory
        dir = os.path.join(app.static_folder, 'mapImages', '4uMaps', z, x, filename)
        return send_file(dir)


def load_image_array(rootname, fmt='jpg'):
    arr = []
    i = 1
    while True:
        name = rootname + str(i) + '.' + fmt
        img = cv.imread(name, cv.IMREAD_COLOR)
        if img is None:
            break
        arr.append(img)
        i = i + 1
    return arr


api.add_resource(cvopen, '/cvopen')
api.add_resource(cvdepth, '/cvdepth/<int:downscale>/<int:min_disp>/<float:sigma>')
api.add_resource(cvdepth2, '/cvdepth2/<int:downscale>/<int:min_disp>/<float:sigma>')
api.add_resource(cvpath, '/cvpath')
api.add_resource(mapAssets, '/map/<string:z>/<string:x>/<string:y>')


if __name__=="__main__":
    app.run(host='127.0.0.1', port=5000)

# after changes have been made, run pyinstaller -F aprsServer.py
# the 'static' directory needs to be copied into directory 'dist'