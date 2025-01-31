from flask import Blueprint, request, jsonify, send_file
import uuid
from utilities.cloud_action import upload_to_gemini, wait_for_files_active, upload_bytes_to_gcs
from utilities.database_action import db_add_video_to_chat
from flask_jwt_extended import jwt_required, get_jwt_identity

UploadVideo_bp = Blueprint('UploadVideo', __name__)

@UploadVideo_bp.route('/upload-video', methods=['POST'])
@jwt_required()
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        user_id = get_jwt_identity()
        chat_id = request.form.get('chat_id')

        filename = file.filename
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'mp4'
        unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
        
        # Reading the file in memory
        file_data = file.read()
        
        # Upload directly without saving to OS
        mime_type = f"video/{file_ext}"
        uploaded_file = upload_to_gemini(file_data, mime_type=mime_type, file_name=unique_filename)
        wait_for_files_active([uploaded_file])
        upload_bytes_to_gcs(bucket_name="theblucks-clipper-bucket", destination_blob_name=uploaded_file.name, file_data=file_data)

        db_add_video_to_chat(
            user_id,
            chat_id,
            uploaded_file.name,
            file.filename,
            gcs_url=f"https://generativelanguage.googleapis.com/v1beta/{uploaded_file.name}",
            mime_type=mime_type    
        )

        return jsonify({'message': 'File uploaded successfully', 'file_id': uploaded_file.name, 'file_uri': uploaded_file.uri, "file_name": filename, "mime_type": mime_type})
