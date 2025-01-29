from flask import Blueprint, request, jsonify, send_file
import json
from utilities.video_manipulation import segment_video
from utilities.cloud_action import get_video_from_bucket
import io

GetVideo_bp = Blueprint('GetVideo', __name__)

@GetVideo_bp.route('/get-video', methods=['GET'])
def get_video():
    """API endpoint to download video from GenAI URI"""

    # Get the video URI from the request query parameter (or replace with your URI)
    file_id = request.args.get('file_id')
    # timestamps
    start = request.args.get("start")
    end = request.args.get("end")
    mimeType = request.args.get("mimetype")

    # bucket = storage_client.bucket("theblucks-clipper-bucket")

    # blob = bucket.blob(file_id)
    # file_contents = blob.download_as_bytes()
    # byte_stream = io.BytesIO(file_contents)
    byte_stream, blob = get_video_from_bucket(file_id=file_id)
    segmented_video = segment_video(byte_stream=byte_stream, start_time=start, end_time=end, mimeType=mimeType)

    return send_file(
        segmented_video,
        mimetype=mimeType,
        as_attachment=True,
        download_name=blob.name.split('/')[-1]
    )