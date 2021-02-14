from flask import Flask, jsonify
from flask.helpers import send_file
from flask_restful import Resource, Api, request
from flask_cors import CORS
import os
import time
import base64


app = Flask(__name__)
CORS(app)
api = Api(app)


class analyze(Resource):
    def get(self):

        try:
            #open encoded video file and prepare to read
            #open decoded video file and prepare to write
            encodedFilename = os.path.join(app.static_folder, 'encodedVideos', 'videoFromServer.txt')
            decodedFilename = os.path.join(app.static_folder, 'decodedVideos', 'videoFromServer.mp4')
            encodedVideoFile = open(encodedFilename, 'rb')
            decodedVideoFile = open(decodedFilename, 'wb')

            #read encoded text from file and decode
            #needed to edit string to get pure encoding
            encodedText = encodedVideoFile.read()
            encodedText = encodedText[2:-1]
            decodedVideoFile.write(base64.b64decode(encodedText))

            #close files
            encodedVideoFile.close()
            decodedVideoFile.close()
        
        except AssertionError as error:
            
            return error

        else:

            return "all good"


class map(Resource):
    def get(self, z, x, y):

        filename = y + '.png'

        #app.static_folder may be overwritten in the electron directory
        dir = os.path.join(app.static_folder, 'mapImages', '4uMaps', z, x, filename)
        return send_file(dir)


api.add_resource(analyze, '/analyze')
api.add_resource(map, '/map/<string:z>/<string:x>/<string:y>')


if __name__=="__main__":
    app.run(host='127.0.0.1', port=5000)

# after changes have been made, run pyinstaller -F aprsServer.py
# the 'static' directory needs to be copied into directory 'dist'