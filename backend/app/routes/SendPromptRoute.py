from flask import Blueprint, request, jsonify, send_file
from utilities.cloud_action import model, upload_to_gemini, get_video_from_bucket, check_file_exists_genai, check_file_blob_exists_gcs
from utilities.database_action import db_add_message, db_add_clip_to_message
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

SendPrompt_bp = Blueprint('SendPrompt', __name__)

@SendPrompt_bp.route('/send-prompt', methods=['POST'])
@jwt_required()
def send_prompt():
    user_id = get_jwt_identity()
    data = request.json
    file_ids = data.get('file_ids')
    print(file_ids)
    prompt = data.get('prompt')
    chat_id = data.get("chat_id")
    db_add_message(
        user_id=user_id,
        chat_id=chat_id,
        role="user",
        main_message=prompt
        )
    if not file_ids or not prompt or not isinstance(file_ids, list):
        chat_session = model.start_chat()
        response = chat_session.send_message("""
            You are an expert MLB sports analyzer.
            The user did not provide a video to respond, so your job is to kindly tell user to request for the video and answer any questions.
            If the user does not attach a valid MLB video, respond *only* in the format `{"message": "[friendly request to share the file]}"
            - Use exciting, friendly, spartan-tone language
        """)
        # return jsonify({'response': response.text})
        dict = json.loads(response.text)
        response_data = {
            "message": dict["message"],
            "response": []
        }
        message_id = db_add_message(
            user_id=user_id,
            chat_id=chat_id,
            role="assistant",
            main_message=dict["message"]
        )
        return jsonify(response_data)
    
    # if not check_file_exists_genai(file_ids[0].get("file_id")): 
    #     if not check_file_blob_exists_gcs(bucket_name="theblucks-clipper-bucket", blob_name=file_ids[0].get("file_id")):
    #         return jsonify({"error": "This file does not exist"})
    #     file_data, blob = get_video_from_bucket(file_id=file_ids[0].get("file_id"))
    #     print("This is blob", flush=True)
    #     print(type(blob), flush=True)

    #     file = upload_to_gemini(
    #         file_data=file_data.getvalue(),
    #         mime_type=file_ids[0].get("mime_type"),
    #         file_name=file_ids[0].get("file_id"),
    #         display_name=file_ids[0].get("file_id")
    #         )
    #     print(file, flush=True)


    file_data_parts = [
        {
            "file_data": {
                "mime_type": file.get("mime_type"),
                "file_uri": file.get("file_uri"),
            }
        }
        for file in file_ids if file.get("file_uri")
    ]

    # Create chat with multiple files
    chat_parts = [
        {
        "role": "user",
        "parts": [
            {"text": """Analyze the provided Major League Basebell video and identify full moments that match the given prompt. Use the following JSON structure for your response:

            Your response MUST be formatted as a valid JSON object with the following structure:

            { "message": "Either it's an analysis of the MLB video based on the given prompt or when irrelevant, that it is", "content": [ { "commentary": "A textual description of the play, using exciting language and mentioning relevant players involved.", "timestamp": { "start": "HH:MM:SS", "end": "HH:MM:SS" } } ] }             
            
            - Only in HH:MM:SS format
            - Limit content to 1 or 2, unless requested by the user
            - Ensure timestamps cover full events, not just start points—include the entire action (e.g., over 10-40 seconds).
            - Only include moments that directly match the given prompt.
            - If no relevant moments are found, return an empty "content" array with timestamps set to an empty string.
            - Use exciting, friendly, spartan-tone language
            """},
            *file_data_parts
        ]
        }
    ]

    prompt_with_format = f"{prompt}\n\nReturn ONLY the JSON as described above."

    chat_session = model.start_chat(history=chat_parts)
    response = chat_session.send_message(prompt_with_format)
    print(response.text, flush=True)
    dict = json.loads(response.text)
    response_data = {
        "message": dict["message"],
        "response": [
            {
                "commentary": item["commentary"],
                "timestamp": item["timestamp"]
            }
            for item in dict["content"]
        ]
    }
    message_id = db_add_message(
        user_id=user_id,
        chat_id=chat_id,
        role="assistant",
        main_message=dict["message"]
        )
    
    for clip in response_data["response"]:
        db_add_clip_to_message(user_id=user_id,
                               chat_id=chat_id,
                               message_id=message_id,
                               clip_id=file_ids[0].get("file_id"),
                               commentary=clip["commentary"],
                               video_url=f"https://generativelanguage.googleapis.com/v1beta/{file_ids[0].get('file_id')}",
                               start_time=clip["timestamp"]["start"],
                               end_time=clip["timestamp"]["end"],
                               filename=file_ids[0].get("file_name")
                               )

    return jsonify(response_data)