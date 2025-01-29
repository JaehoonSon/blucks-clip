from flask import Blueprint, request, jsonify, send_file
from utilities.cloud_action import model

SendPrompt_bp = Blueprint('SendPrompt', __name__)

@SendPrompt_bp.route('/send-prompt', methods=['POST'])
def send_prompt():
    data = request.json
    file_ids = data.get('file_ids')
    print(file_ids)
    prompt = data.get('prompt')
    if not file_ids or not prompt or not isinstance(file_ids, list):
        return jsonify({'error': 'List of File IDs and prompt are required'}), 400
    
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
    # print(chat_session.history)
    return jsonify({'response': response.text})
