import os
import time
import google.generativeai as genai
from flask_cors import CORS

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

def wait_for_files_active(files):
  """Waits for the given files to be active.

  Some files uploaded to the Gemini API need to be processed before they can be
  used as prompt inputs. The status can be seen by querying the file's "state"
  field.

  This implementation uses a simple blocking polling loop. Production code
  should probably employ a more sophisticated approach.
  """
  print("Waiting for file processing...")
  for name in (file.name for file in files):
    file = genai.get_file(name)
    while file.state.name == "PROCESSING":
      print(".", end="", flush=True)
      time.sleep(10)
      file = genai.get_file(name)
    if file.state.name != "ACTIVE":
      raise Exception(f"File {file.name} failed to process")
  print("...all files ready")
  print()

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-2.0-flash-exp",
  generation_config=generation_config,
)

# TODO Make these files available on the local file system
# You may need to update the file paths
files = [
  upload_to_gemini("videoplayback (1).mp4", mime_type="video/mp4"),
]

# Some files have a processing delay. Wait for them to be ready.
wait_for_files_active(files)

print(files[0])

chat_session = model.start_chat(
  history=[
    {
      "role": "user",
      "parts": [
        files[0],
      ],
    },
    {
      "role": "user",
      "parts": [
        "Find timestamp(s) of all the homeruns.\nIt should be a list of pairs with start and end. ",
      ],
    },
    {
      "role": "model",
      "parts": [
        "[00:00:00-00:00:17]\n[00:00:36-00:00:52]\n[00:01:59-00:02:16]\n[00:02:58-00:03:04]",
      ],
    },
    {
      "role": "user",
      "parts": [
        "Find timestamp(s) of all the close up fan cams.\nIt should be a list of pairs with start and end.",
      ],
    },
    {
      "role": "model",
      "parts": [
        "[00:00:46-00:00:49]\n[00:00:52-00:00:55]\n[00:01:39-00:01:43]\n[00:02:15-00:02:18]\n[00:02:20-00:02:21]\n[00:02:26-00:02:28]\n[00:02:29-00:02:34]\n[00:02:36-00:02:38]\n[00:02:44-00:02:52]",
      ],
    },
  ]
)

response = chat_session.send_message("Find 1 timestamp of start and end of most exciting moments. Should be in JSON format")

print(response.text)