from flask import Blueprint, request, jsonify, send_file
import json
from utilities.cloud_action import delete_to_gemini, delete_to_gcs
import io

DeleteVideo_bp = Blueprint('DeleteVideo', __name__)

@DeleteVideo_bp.route('/delete-video', methods=['POST'])
def get_video():
    data = request.json
    file_id = data.get('file_id')

    delete_to_gemini(file_id)
    # delete_to_gcs(bucket_name="theblucks-clipper-bucket", blob_name=file_id)

    return jsonify({"status": True})