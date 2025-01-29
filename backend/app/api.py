from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from routes.test import test_bp
from routes.GetVideoRoute import GetVideo_bp
from routes.UploadVideoRoute import UploadVideo_bp
from routes.SendPromptRoute import SendPrompt_bp
from routes.DeleteVideo import DeleteVideo_bp
from routes.OAuth import OAuth_bp
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

CORS(app, resources={r"/*": {"origins": "*"}})
# GET /test
app.register_blueprint(test_bp)

# GET /get-video
app.register_blueprint(GetVideo_bp)

# POST /upload-video
app.register_blueprint(UploadVideo_bp)

# POST /send-prompt
app.register_blueprint(SendPrompt_bp)

# POST /delete-video
app.register_blueprint(DeleteVideo_bp)

# POST /login
app.register_blueprint(OAuth_bp)


if __name__ == '__main__':
    app.run(debug=True)