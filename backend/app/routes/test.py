from flask import Blueprint, request, jsonify
import json
from utilities.cloud_action import genai, check_file_blob_exists_gcs, check_file_exists_genai
from utilities.database_action import test_user

test_bp = Blueprint('test', __name__)

@test_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "Test okay"}), 200

@test_bp.route('/list', methods=['GET'])
def tests():
    return jsonify({"status": str(genai.list_files)}), 200

@test_bp.route('/check-video', methods=['POST'])
def testss():
    data = request.json
    file_id = data.get("file_id")
    
    return jsonify({"GCS": check_file_blob_exists_gcs(bucket_name="theblucks-clipper-bucket", blob_name=file_id), "genai": check_file_exists_genai(file_id)})

@test_bp.route('/test-db', methods=["GET"])
def test4():
    test_user()
    return jsonify({"status": "ok"})