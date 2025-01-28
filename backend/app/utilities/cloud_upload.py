import google.generativeai as genai
from google.oauth2 import service_account
from google.cloud import storage
import os
import time

import io

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

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
credentials = service_account.Credentials.from_service_account_file("./theblucks-mail-3cb66286c8da.json")
storage_client = storage.Client(credentials=credentials)

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

def get_video_from_bucket(file_id):
    bucket = storage_client.bucket("theblucks-clipper-bucket")

    blob = bucket.blob(file_id)
    file_contents = blob.download_as_bytes()
    byte_stream = io.BytesIO(file_contents)

    return byte_stream, blob.name.split('/')[-1]