from flask import Blueprint, request, jsonify, send_file
from utilities.database_action import db_get_video_in_chat, db_get_chats, db_delete_chat, db_get_messages, db_get_profile, db_update_chat_name
from flask_jwt_extended import jwt_required, get_jwt_identity
import io

ChatActions_bp = Blueprint('ChatActions', __name__)

@ChatActions_bp.route('/get-uploaded-video', methods=['GET'])
@jwt_required()
def GetUploadedVideo():
    user_id = get_jwt_identity()
    chat_id = request.args.get('chat_id')

    data = db_get_video_in_chat(
            user_id=user_id,
            chat_id=chat_id
        )

    if data is None:
        return [], 200
    
    transformed_videos = [
        {
            "file_id": video.get("id", ""),
            "file_name": video.get("file_name", ""),
            "file_uri": video.get("gcs_url", ""),
            "mime_type": video.get("mime_type", ""),
            "message": "Uploaded Successfully",
            "selected": False
        }
        for video in data.get("uploadedVideos", [])
    ]
    return transformed_videos, 200

@ChatActions_bp.route('/get-chats', methods=['GET'])
@jwt_required()
def GetChats():
    user_id = get_jwt_identity()
    res = db_get_chats(user_id=user_id)

    return res, 200

@ChatActions_bp.route('/get-messages', methods=['GET'])
@jwt_required()
def GetMessages():
    user_id = get_jwt_identity()
    chat_id = request.args.get('chat_id')

    res = db_get_messages(user_id=user_id, chat_id=chat_id)

    return res, 200

@ChatActions_bp.route('/get-profile', methods=["GET"])
@jwt_required()
def GetProfile():
    user_id = get_jwt_identity()
    data = db_get_profile(user_id=user_id)
    return data, 200

@ChatActions_bp.route('/delete-chat', methods=['DELETE'])
@jwt_required()
def DeleteChat():
    user_id = get_jwt_identity()
    data = request.json
    chat_id = data.get("chat_id")

    res = db_delete_chat(user_id=user_id, chat_id=chat_id)

    return jsonify({}), 200 

@ChatActions_bp.route('/rename-chat', methods=["POST"])
@jwt_required()
def RenameChat():
    user_id = get_jwt_identity()
    data = request.json
    chat_id = data.get("chat_id")
    editedChatName = data.get("editedChatName")
    res = db_update_chat_name(user_id, chat_id, editedChatName)
    if res:
        return jsonify({}), 200
    else:
        return jsonify({}), 500
    