from flask import Blueprint, request, jsonify
import json
from utilities import video_manipulation

test_bp = Blueprint('test', __name__)

@test_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "Test ok"}), 200