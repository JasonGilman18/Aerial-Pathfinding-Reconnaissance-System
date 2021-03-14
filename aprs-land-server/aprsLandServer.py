# import neccisary FLASK dependancies
from flask import Flask, request, jsonify
from flask.helpers import send_file
from flask_restful import Resource, Api
from flask_cors import CORS

# import os.path for defining application absolute path
import os.path

# import base64 for video encoding
import base64


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

        return "file recieved"


class launch(Resource):
    def get(self):

        #run the py launch script
        #dronekit_test_01.launchDrone()

        return "drone launched"


# create url routes for above methods
api.add_resource(aprs, '/')
api.add_resource(uploadInstructions, '/uploadInstructions')
api.add_resource(launch, '/launch')


# define main process
if __name__=="__main__":
    app.run(host='0.0.0.0', port=5302)
