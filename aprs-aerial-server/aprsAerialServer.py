# import neccisary FLASK dependancies
from flask import Flask, json, request, jsonify
from flask.helpers import send_file
from flask_restful import Resource, Api
from flask_cors import CORS

# import os.path for defining application absolute path
import os.path
import os
import shutil
import time

# import base64 for video encoding
import base64

#import drone startup script
import ADRS_Pi


# create flask application and setup CORS, flask_restful
app = Flask(__name__)
CORS(app)
api = Api(app)


# define default route used for testing
class aprs(Resource):
    def get(self):        
        return "hello communicating"


# define upload instructions route for uploading the navigation instructions to the aerial drone
class uploadInstructions(Resource):
    def post(self):

        # translate http body to json/dict format
        data_json = request.get_json()

        # create filename/abs path and open, write to the file.
        filename = os.path.join(app.root_path, 'static', 'coordinates.txt')
        file = open(filename, "w+")
        file.write(data_json['nav'])
        file.close()

        imagesDir = os.path.join(app.static_folder, "images")
        last_run_cleanup_files = os.listdir(imagesDir)
        newDirname = time.strftime("%Y%m%d-%H%M%S")
        newPath = os.path.join(app.static_folder, "images", newDirname)
        os.mkdir(newPath)
        for file_name in last_run_cleanup_files:
            if os.path.isfile(os.path.join(imagesDir, file_name)):
                shutil.move(os.path.join(imagesDir, file_name), newPath)

        return "file recieved"


# define route for sending video data collected from flight 
class download(Resource):
    def get(self):

        #open video file, encode, and close
        #filename = os.path.join(app.root_path, 'static', '35_40_21_Nov.h264')
        #video_file = open(filename, "rb")
        #encoded_video = base64.b64encode(video_file.read())
        #video_file.close()

        resp_images = []

        imagesDir = os.path.join(app.static_folder, "images")
        imagesList = os.listdir(imagesDir)
        for image in imagesList:
            image_filename = os.path.join(imagesDir, image)
            if os.path.isfile(image_filename):
                image_file = open(image_filename, "rb")
                encoded_image = base64.b64encode(image_file.read())
                image_file.close()
                resp_images.append((image, str(encoded_image)))

        resp_arr = []
        for image_pair in resp_images:
            temp_dict = {}
            temp_dict["filename"] = image_pair[0]
            temp_dict["encoded_image"] = image_pair[1]
            resp_arr.append(temp_dict)

        #return jsonify({'encoded_video': str(encoded_video)})
        return jsonify({'images': resp_arr})


class launch(Resource):
    def get(self):

        #run the py launch script
        ADRS_Pi.execute_aerial_drone()

        return "drone launched"


# create url routes for above methods
api.add_resource(aprs, '/')
api.add_resource(uploadInstructions, '/uploadInstructions')
api.add_resource(download, '/download')
api.add_resource(launch, '/launch')


# define main process
if __name__=="__main__":
    app.run(host='0.0.0.0', port=5001)
