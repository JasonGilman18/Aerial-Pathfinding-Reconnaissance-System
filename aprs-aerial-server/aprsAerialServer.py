from flask import Flask, request
from flask.helpers import send_file
from flask_restful import Resource, Api
from flask_cors import CORS
import os.path


app = Flask(__name__)
CORS(app)
api = Api(app)


class aprs(Resource):
    def get(self):
        return "hello communicating"

class uploadInstructions(Resource):
    def post(self):
        data_json = request.get_json()

        filename = os.path.join(app.root_path, 'static', 'coordinates.txt')
        file = open(filename, "w+")
        file.write(data_json['nav'])
        file.close()

        return "file recieved"

class download(Resource):
    def get(self):
        return send_file('static/data.mp4')




api.add_resource(aprs, '/')
api.add_resource(uploadInstructions, '/uploadInstructions')
api.add_resource(download, '/download')

if __name__=="__main__":
    app.run(host='0.0.0.0', port=5000)
