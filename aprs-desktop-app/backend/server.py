from flask import Flask, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

@api.resource('/')
class test(Resource):
    def get(self):
        return jsonify({0: "the change has been made"})

if __name__=="__main__":
    app.run(host='127.0.0.1', port=5000)

# after changes have been made, run pyinstaller server.py