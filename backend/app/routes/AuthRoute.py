from flask import Blueprint, request, jsonify, send_file
import json
from utilities.cloud_action import delete_to_gemini, delete_to_gcs
import io

Auth_bp = Blueprint('Auth', __name__)

@Auth_bp.route('/auth/google/callback', methods=['POST'])
def callback():
    data = request.json
    print(data)
    return data