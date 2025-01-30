from flask import Blueprint, request, jsonify, send_file
import json
from utilities.database_action import db_create_chat
import io

CreateChat_bp = Blueprint('CreateChat', __name__)

@CreateChat_bp.route('/create-chat', methods=['POST'])
def create_chat():
    data = request.json
    user_id = data.get("user_id")
    db_create_chat(
        user_id=user_id
    )

    return jsonify({"status": "ok"}), 200