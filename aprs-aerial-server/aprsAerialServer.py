from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
api = Api(app)


class aprs(Resource):
    def get(self):
        return "hello communicating"

class uploadInstructions(Resource):
    def post(self):
        coordinate_list = request.data

        file = open("coordinates.txt", "w+")
        file.write(str(coordinate_list))
        file.close()

        return "file recieved"




api.add_resource(aprs, '/')
api.add_resource(uploadInstructions, '/uploadInstructions')

if __name__=="__main__":
    app.run(host='0.0.0.0', port=5000)
