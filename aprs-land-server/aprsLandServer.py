# import neccisary FLASK dependancies
from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
import dill

# import os.path for defining application absolute path
import os.path

#import moveRover
import moveRover


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
        filename = os.path.join(app.root_path, 'static', 'coordinates.pickle')
        file = open(filename, "wb")
        dill.dump(data_json['nav'], file)
        file.close()

        filename2 = os.path.join(app.root_path, 'static', 'direction.pickle')
        file2 = open(filename2, "wb")
        dill.dump(data_json["direction"], file2)
        file2.close()

        print(type(data_json['nav']))
        print(type(data_json["direction"]))

        return "file recieved"


class launch(Resource):
    def get(self):

        filename = os.path.join(app.root_path, 'static', 'coordinates.pickle')
        file = open(filename, "rb")
        navInstructions = dill.load(file)
        file.close()

        filename2 = os.path.join(app.root_path, 'static', 'direction.pickle')
        file2 = open(filename2, "rb")
        direction = dill.load(file2)
        file2.close()

        direction = direction[:1]

        moveRover.move_rover(navInstructions, direction)

        return "drone launched"


# create url routes for above methods
api.add_resource(aprs, '/')
api.add_resource(uploadInstructions, '/uploadInstructions')
api.add_resource(launch, '/launch')


# define main process
if __name__=="__main__":
    app.run(host='0.0.0.0', port=5302)
