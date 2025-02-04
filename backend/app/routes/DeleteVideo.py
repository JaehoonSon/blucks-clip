from flask import Blueprint, request, jsonify, send_file
import json
from utilities.database_action import db_delete_video_from_chat
from utilities.cloud_action import delete_to_gemini, delete_to_gcs
from flask_jwt_extended import jwt_required, get_jwt_identity
import io

DeleteVideo_bp = Blueprint('DeleteVideo', __name__)

@DeleteVideo_bp.route('/delete-video', methods=['POST'])
@jwt_required()
def delete_video():
    data = request.get_json()
    chat_id = data.get('chat_id')
    video_id = data.get('file_id')
    user_id = get_jwt_identity()  # Directly get the user ID as a string

    if not chat_id or not video_id:
        return jsonify({"error": "Missing chat_id or video_id"}), 400
    

    geminiSuccess = delete_to_gemini(video_id)
    success = db_delete_video_from_chat(user_id, chat_id, video_id)
    
    if success:
        return jsonify({"message": "Video deleted successfully"}), 200
    else:
        return jsonify({"error": "Video not found"}), 404