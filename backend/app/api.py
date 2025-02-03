from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from routes.test import test_bp
from routes.GetVideoRoute import GetVideo_bp
from routes.UploadVideoRoute import UploadVideo_bp
from routes.SendPromptRoute import SendPrompt_bp
from routes.DeleteVideo import DeleteVideo_bp
from routes.OAuth import OAuth_bp
from routes.CreateChatRoute import CreateChat_bp
from routes.ChatActions import ChatActions_bp
import os
from flask_jwt_extended import JWTManager
from datetime import timedelta

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")  # Ensure this is set and kept secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Token valid for 1 hour
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)  # Original expiration
jwt = JWTManager(app)
app.secret_key = os.urandom(24)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

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

# POST /create-chat
app.register_blueprint(CreateChat_bp)

# POST multiple routes
app.register_blueprint(ChatActions_bp)


if __name__ == '__main__':
    app.run(debug=True)