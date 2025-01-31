from flask import Blueprint, request, jsonify, send_file
import json
from utilities.database_action import db_create_chat
from flask_jwt_extended import jwt_required, get_jwt_identity

import io

CreateChat_bp = Blueprint('CreateChat', __name__)

@CreateChat_bp.route('/create-chat', methods=['POST'])
@jwt_required()
def create_chat():
    user_id = get_jwt_identity()
    id = db_create_chat(
        user_id=user_id
    )

    return jsonify({"chat_id": id}), 200