from google.cloud import firestore
from google.oauth2 import service_account
import uuid

creds_path = "./theblucks-mail-c819d4641679.json"
credentials = service_account.Credentials.from_service_account_file(creds_path)
project_id = "theblucks-mail"
db = firestore.Client(project=project_id, credentials=credentials)

def test_user():
    doc_ref = db.collection("users").document("user_123")
    doc_ref.set({
        "name": "Alice",
        "age": 25,
        "email": "alice@example.com"
    })
    print("Document added successfully!")

# When user first creates their account
def db_add_user(user_id, name, email, pfp_url):
    user_ref = db.collection('User').document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        user_ref.set({
            'name': name,
            'email': email,
            'pfp_url': pfp_url,
            'Chats': []
        })
    else:
        print(f"User {user_id} already exists. Skipping document creation.")

# Creates empty chat to a user
def db_create_chat(user_id):
    user_ref = db.collection('User').document(user_id)
    user_ref.update({
        'Chats': firestore.ArrayUnion([{
            'id': str(uuid.uuid4()),
            'chatName': "New Chat",
            'messages': [],
            'uploadedVideos': []
        }])
    })

def db_add_message(user_id, chat_id):
    chat_ref = db.collection('User').document(user_id).collection('Chats').document(chat_id)
    chat_ref.update({
        'messages': firestore.ArrayUnion([{
            'id': 'message_id',
            'timestamp': '2023-10-01T12:00:00Z',
            'role': 'user',
            'MainMessage': 'Hello, world!',
            'Clips': []
        }])
    })

def db_add_clip_to_message(user_id, chat_id, message_id, clip_id, commentary, videoUrl, start, end):
    message_ref = db.collection('User').document(user_id).collection('Chats').document(chat_id).collection('Messages').document(message_id)
    message_ref.update({
        'Clips': firestore.ArrayUnion([{
            'id': clip_id,
            'commentary': commentary,
            'videoUrl': videoUrl,
            'start': start,
            'end': end
        }])
    })

def db_add_video_to_chat(user_id, chat_id):
    chat_ref = db.collection('User').document(user_id).collection('Chats').document(chat_id)
    chat_ref.update({
        'id': 'video_id',
        'file_name': 'files/52432',
        'gcs_url': 'https://gcs.../files/123'
    })