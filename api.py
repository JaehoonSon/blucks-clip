import os
import time
import uuid
from flask import Flask, request, jsonify, Response, send_file, stream_with_context
from werkzeug.utils import secure_filename
import google.generativeai as genai
from flask_cors import CORS
import json
import requests
import io
from io import BytesIO
from google.cloud import storage
import ffmpeg
import time
import tempfile
from dotenv import load_dotenv

# genai.configure(api_key=os.environ["GEMINI_API_KEY"])
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
storage_client = storage.Client()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# def segment_video(byte_stream, start_time, end_time, mimeType):
#     # Read input from pipe
#     format = mimeType.split("/")[1] # mp4
#     input_stream = ffmpeg.input('pipe:', format=format)

#     # Split audio and video streams
#     audio = input_stream.audio
#     video = input_stream.video

#     # Trim video
#     video = video.trim(start=start_time, end=end_time).setpts('PTS-STARTPTS')

#     # Trim audio
#     audio = audio.filter('atrim', start=start_time, end=end_time).filter('asetpts', 'PTS-STARTPTS')

#     # Combine and output
#     output_stream = (
#         ffmpeg.output(video, audio, 'pipe:', format='matroska', vcodec='libx264', acodec='aac')
#         .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
#     )

#     out, err = output_stream.communicate(input=byte_stream.getvalue())

#     if output_stream.returncode != 0:
#         raise Exception(f"FFmpeg error: {err.decode()}")

#     return io.BytesIO(out)

# def segment_video(byte_stream, start_time, end_time, mimeType):
#     # Extract the format from the mimeType (e.g., 'video/mp4' -> 'mp4')
#     format = mimeType.split("/")[1]  # e.g., 'mp4'

#     # Write the byte_stream to a temporary file for probing
#     with tempfile.NamedTemporaryFile(suffix='.' + format) as tempf:
#         tempf.write(byte_stream.getvalue())
#         tempf.flush()

#         # Probe the temporary file to check for an audio stream
#         probe = ffmpeg.probe(tempf.name)
#         audio_streams = [
#             stream for stream in probe['streams'] if stream['codec_type'] == 'audio'
#         ]
#         has_audio = len(audio_streams) > 0

#     # Read input from pipe
#     input_stream = ffmpeg.input('pipe:', format=format)

#     # Trim video stream
#     video = (
#         input_stream.video
#         .trim(start=start_time, end=end_time)
#         .setpts('PTS-STARTPTS')
#     )

#     if has_audio:
#         # Trim audio stream
#         audio = (
#             input_stream.audio
#             .filter('atrim', start=start_time, end=end_time)
#             .filter('asetpts', 'PTS-STARTPTS')
#         )
#         # Combine video and audio
#         output = ffmpeg.output(
#             video,
#             audio,
#             'pipe:',
#             format='matroska',  # Changed output format to 'matroska'
#             vcodec='libx264',
#             acodec='aac',
#         )
#     else:
#         # No audio stream, output video only
#         output = ffmpeg.output(
#             video,
#             'pipe:',
#             format='matroska',  # Changed output format to 'matroska'
#             vcodec='libx264',
#             # Specify '-an' to disable audio in the output
#             **{'an': None}
#         )

#     # Run ffmpeg process
#     process = output.run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)

#     # Communicate with the process using the byte_stream
#     out, err = process.communicate(input=byte_stream.getvalue())

#     # Check for errors
#     if process.returncode != 0:
#         raise Exception(f"FFmpeg error: {err.decode()}")

#     # Return the output as a BytesIO object
#     return io.BytesIO(out)

def segment_video(byte_stream, start_time, end_time, mimeType):
    # Extract the format from the mimeType (e.g., 'video/mp4' -> 'mp4')
    format = mimeType.split("/")[1]  # e.g., 'mp4'

    # Write the byte_stream to a temporary input file
    with tempfile.NamedTemporaryFile(suffix='.' + format) as temp_input:
        temp_input.write(byte_stream.getvalue())
        temp_input.flush()

        # Probe the temporary input file to check for an audio stream
        probe = ffmpeg.probe(temp_input.name)
        audio_streams = [
            stream for stream in probe['streams'] if stream['codec_type'] == 'audio'
        ]
        has_audio = len(audio_streams) > 0

        # Prepare the output as a temporary output file
        with tempfile.NamedTemporaryFile(suffix='.mkv') as temp_output:

            # Build FFmpeg command
            input_stream = ffmpeg.input(temp_input.name)

            # Trim video stream
            video = (
                input_stream.video
                .trim(start=start_time, end=end_time)
                .setpts('PTS-STARTPTS')
            )

            if has_audio:
                # Trim audio stream
                audio = (
                    input_stream.audio
                    .filter('atrim', start=start_time, end=end_time)
                    .filter('asetpts', 'PTS-STARTPTS')
                )
                # Combine video and audio
                output = ffmpeg.output(
                    video,
                    audio,
                    temp_output.name,
                    format='matroska',  # Output format as 'matroska'
                    vcodec='libx264',
                    acodec='aac',
                )
            else:
                # No audio stream, output video only
                output = ffmpeg.output(
                    video,
                    temp_output.name,
                    format='matroska',  # Output format as 'matroska'
                    vcodec='libx264',
                    # Specify '-an' to disable audio in the output
                    an=None,
                )

            # Run ffmpeg process synchronously
            output.run(overwrite_output=True)

            # Read the output from the temporary output file
            temp_output.seek(0)
            result = temp_output.read()

            # Return the output as a BytesIO object
            return io.BytesIO(result)

def segment_video_output(byte_stream, start_time, end_time, mimeType, output_file_path):
    input_stream = ffmpeg.input('pipe:', format='mp4')
    output_stream = (
        input_stream
        .trim(start=start_time, end=end_time)
        .setpts('PTS-STARTPTS')
        .output(output_file_path, format='mp4', vcodec='libx264', acodec='aac', movflags='+frag_keyframe+empty_moov')
        .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
    )

    out, err = output_stream.communicate(input=byte_stream.getvalue())

    if output_stream.returncode != 0:
        raise Exception(f"FFmpeg error: {err.decode()}")

    return output_file_path


def upload_bytes_to_gcs(bucket_name, destination_blob_name, file_data):
    # Reuse the pre-created storage client
    bucket = storage_client.bucket(bucket_name)
    
    # Create a blob (object) in the bucket
    blob = bucket.blob(destination_blob_name)
    blob.content_type = 'video/mp4'
    
    # Create a file-like object from bytes
    file_like_object = io.BytesIO(file_data)
    
    # Upload the file-like object
    blob.upload_from_file(file_like_object)
    
    print(f"File {destination_blob_name} uploaded to {bucket_name}.")

def upload_to_gemini(file_data, mime_type=None, file_name=None):
    """Uploads the given file to Gemini."""
    # file = genai.upload_file(path, mime_type=mime_type)
    # print(f"Uploaded file '{file.display_name}' as: {file.uri}")
    # return file
    file_like_object = io.BytesIO(file_data)  # Convert bytes to a file-like object
    file_like_object.name = file_name  # Set a name for the file
    file = genai.upload_file(file_like_object, mime_type=mime_type)
    # print(f"Uploaded file '{file.display_name}' as: {file.uri}")
    return file

def wait_for_files_active(files):
    """Waits for the given files to be active."""
    print("Waiting for file processing...")
    for name in (file.name for file in files):
        file = genai.get_file(name)
        while file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(1)
            file = genai.get_file(name)
        if file.state.name != "ACTIVE":
            raise Exception(f"File {file.name} failed to process")
    print("...all files ready")
    print()

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
)

@app.route('/get-video', methods=['GET'])
def download_video():
    """API endpoint to download video from GenAI URI"""

    # Get the video URI from the request query parameter (or replace with your URI)
    file_id = request.args.get('file_id')
    # timestamps
    start = request.args.get("start")
    end = request.args.get("end")
    mimeType = request.args.get("mimetype")

    bucket = storage_client.bucket("theblucks-clipper-bucket")

    blob = bucket.blob(file_id)
    file_contents = blob.download_as_bytes()
    byte_stream = io.BytesIO(file_contents)
    print("start")
    start_time = time.time()
    segmented_video = segment_video(byte_stream=byte_stream, start_time=start, end_time=end, mimeType=mimeType)
    # segment_video_output(byte_stream, start_time=start, end_time=end, mimeType="mp4", output_file_path="output_video.mp4")
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time: {execution_time:.6f} seconds")

    return send_file(
        segmented_video,
        mimetype=mimeType,
        as_attachment=True,
        download_name=blob.name.split('/')[-1]
    )

@app.route('/upload-video', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
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

        return jsonify({'message': 'File uploaded successfully', 'file_id': uploaded_file.name, 'file_uri': uploaded_file.uri, "file_name": filename, "mime_type": mime_type})

@app.route('/send-prompt', methods=['POST'])
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
    # chat_parts = [{"role": "user", "parts": [{"text": "You are an expert MLB video analyzer:"}] + file_data_parts}]
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
        },
        # {
        #     "role": "user",
        #     "parts": ["Give me the most exciting clips"]
        # },
        # {
        #     "role": "assistant",
        #     "parts": [
        #             json.dumps({
        #                 "commentary": "This moment captures a game-changing home run in the bottom of the ninth inning.",
        #                 "timestamp": [{"start": "00:00:12", "end": "00:00:35"}, {"start": "00:00:10", "end": "00:00:20"}]
        #             })

        #     ]
        # }
    ]

    prompt_with_format = f"{prompt}\n\nReturn ONLY the JSON as described above."

    chat_session = model.start_chat(history=chat_parts)
    response = chat_session.send_message(prompt_with_format)
    # print(chat_session.history)
    return jsonify({'response': response.text})

if __name__ == '__main__':
    app.run(debug=True)