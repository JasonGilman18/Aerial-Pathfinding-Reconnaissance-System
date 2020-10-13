from os import path
from flask import Flask, jsonify
from flask.helpers import send_file
from flask_restful import Resource, Api, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
api = Api(app)


class test(Resource):
    def get(self):
        return jsonify({0: "the change has been made 2"})

class map(Resource):
    def get(self, z, x, y):
        #z = request.args.get('z')
        #x = request.args.get('x')
        #y = request.args.get('y')
        filename = y + '.png'

        #app.static_folder may be overwritten in the electron directory
        dir = os.path.join(app.static_folder, 'mapImages', '4uMaps', z, x, filename)
        return send_file(dir)

api.add_resource(test, '/test')
api.add_resource(map, '/map/<string:z>/<string:x>/<string:y>')

if __name__=="__main__":
    app.run(host='127.0.0.1', port=5000)

# after changes have been made, run pyinstaller -F aprsServer.py
# the 'static' directory needs to be copied into directory 'dist'