from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
api = Api(app)


class test(Resource):
    def get(self):
        return "hello communicating"


api.add_resource(test, '/test')

if __name__=="__main__":
    app.run(host='0.0.0.0', port=5000)