from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from routes.test import test_bp
from routes.GetVideoRoute import GetVideo_bp
from routes.UploadVideoRoute import UploadVideo_bp
from routes.SendPromptRoute import SendPrompt_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# GET /test
app.register_blueprint(test_bp)

# GET /get-video
app.register_blueprint(GetVideo_bp)

# POST /upload-video
app.register_blueprint(UploadVideo_bp)

# POST /send-prompt
app.register_blueprint(SendPrompt_bp)

if __name__ == '__main__':
    app.run(debug=True)