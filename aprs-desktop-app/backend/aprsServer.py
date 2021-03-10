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
import cv2 as cv
import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt
import background_filter as bf
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
        for r in range(1, 26): # For each row
            pairs.append([])
            done = 0
            for c in range(ord('a'), ord('z')): # For each column
                # Open the video files

                filename1 = os.path.join(app.static_folder, 'decodedVideos', chr(c) + str(r) + ' (1).mp4')
                filename2 = os.path.join(app.static_folder, 'decodedVideos', chr(c) + str(r) + ' (2).mp4')

                vidL = cv.VideoCapture(filename1)
                vidR = cv.VideoCapture(filename2)
                if not vidL.isOpened() or not vidR.isOpened():
                    if c == ord('a'):
                        done = 1
                    break
                # Convert to backgrounds and append
                imgL = bf.background_filter(vidL)
                imgR = bf.background_filter(vidR)
                pair = (imgL, imgR)
                pairs[-1].append(pair)
            if done:
                break
        del pairs[-1]

        #save data for next phase
        savePairDataFilename = os.path.join(app.static_folder, 'cv_data', 'pairs.pickle')
        pairDataFile = open(savePairDataFilename, "wb")
        dill.dump(pairs, pairDataFile)
        pairDataFile.close()
        saveImgLDataFilename = os.path.join(app.static_folder, 'cv_data', 'imgL.pickle')
        imgLDataFile = open(saveImgLDataFilename, "wb")
        dill.dump(imgL, imgLDataFile)
        imgLDataFile.close()
        saveImgRDataFilename = os.path.join(app.static_folder, 'cv_data', 'imgR.pickle')
        imgRDataFile = open(saveImgRDataFilename, "wb")
        dill.dump(imgR, imgRDataFile)
        imgRDataFile.close()

        return "cv step 1 complete"
        

class cvdepth(Resource):
    def get(self, downscale, min_disp, sigma):

        #open data from prev phase
        savePairDataFilename = os.path.join(app.static_folder, 'cv_data', 'pairs.pickle')
        pairDataFile = open(savePairDataFilename, "rb")
        pairs = dill.load(pairDataFile)
        pairDataFile.close()
        saveImgLDataFilename = os.path.join(app.static_folder, 'cv_data', 'imgL.pickle')
        imgLDataFile = open(saveImgLDataFilename, "rb")
        imgL = dill.load(imgLDataFile)
        imgLDataFile.close()
        saveImgRDataFilename = os.path.join(app.static_folder, 'cv_data', 'imgR.pickle')
        imgRDataFile = open(saveImgRDataFilename, "rb")
        imgR = dill.load(imgRDataFile)
        imgRDataFile.close()

        disp = di.depth_inference(imgL, imgR, downscale, min_disp, sigma)

        #save disp map as img
        plt.imshow(disp, 'binary')
        saveImgFilename = os.path.join(app.static_folder, 'cv_data', 'depthMap.png')
        plt.savefig(saveImgFilename)

        inference = lambda tup: di.depth_inference(tup[0], tup[1], downscale, min_disp, sigma)
        maps = list(map(lambda r: list(map(inference, r)), pairs))
        
        #save maps to file
        saveMapDataFilename = os.path.join(app.static_folder, 'cv_data', 'maps.pickle')
        mapDataFile = open(saveMapDataFilename, "wb")
        dill.dump(maps, mapDataFile)

        return send_file(saveImgFilename)


class cvpath(Resource):
    def get(self):

        saveMapDataFilename = os.path.join(app.static_folder, 'cv_data', 'maps.pickle')
        mapDataFile = open(saveMapDataFilename, "rb")
        maps = dill.load(mapDataFile)

        merged = md.merge_depths(maps)
        grad = gm.gradient_map(merged)
        
        obs = gm.mark_obstacles(grad, 6)
        plt.imshow(obs, 'binary')
        saveObsImgFilename = os.path.join(app.static_folder, 'cv_data', 'obsMap.png')
        plt.savefig(saveObsImgFilename)

        res = rs.resize(obs, 5, 5)
        plt.imshow(res, 'binary')
        saveResImgFilename = os.path.join(app.static_folder, 'cv_data', 'resMap.png')
        plt.savefig(saveResImgFilename)

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

        #return send_file(saveNavImgFilename)
        return jsonify({'img': img, 'nav': navInstructions})


class mapAssets(Resource):
    def get(self, z, x, y):

        filename = y + '.png'

        #app.static_folder may be overwritten in the electron directory
        dir = os.path.join(app.static_folder, 'mapImages', '4uMaps', z, x, filename)
        return send_file(dir)


api.add_resource(cvopen, '/cvopen')
api.add_resource(cvdepth, '/cvdepth/<int:downscale>/<int:min_disp>/<float:sigma>')
api.add_resource(cvpath, '/cvpath')
api.add_resource(mapAssets, '/map/<string:z>/<string:x>/<string:y>')


if __name__=="__main__":
    app.run(host='127.0.0.1', port=5000)

# after changes have been made, run pyinstaller -F aprsServer.py
# the 'static' directory needs to be copied into directory 'dist'