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
            'pfp_url': pfp_url
        })
    else:
        print(f"User {user_id} already exists. Skipping document creation.")

def db_create_chat(user_id):
    chats_ref = db.collection('User').document(user_id).collection('Chats')
    new_chat_ref = chats_ref.document(str(uuid.uuid4()))  # UUID as document ID
    new_chat_ref.set({
        'chatName': "New Chat",
        # 'messages': [],
        'uploadedVideos': []
    })
    return new_chat_ref.id

def db_add_message(user_id, chat_id, role, main_message):
    # Reference the Messages subcollection under the chat
    messages_ref = (
        db.collection('User')
        .document(user_id)
        .collection('Chats')
        .document(chat_id)
        .collection('Messages')
    )
    
    # Create a new message document
    new_message_ref = messages_ref.document(str(uuid.uuid4()))  # Use UUID as document ID
    new_message_ref.set({
        'id': new_message_ref.id,
        'timestamp': firestore.SERVER_TIMESTAMP,  # Auto-set server timestamp
        'role': role,
        'MainMessage': main_message,
        'Clips': []  # Initialize empty clips array
    })

    return new_message_ref.id

def db_add_clip_to_message(
    user_id, chat_id, message_id, clip_id, commentary, video_url, start_time, end_time, filename
):
    # Reference the specific message document
    message_ref = (
        db.collection('User')
        .document(user_id)
        .collection('Chats')
        .document(chat_id)
        .collection('Messages')
        .document(message_id)
    )
    
    # Append the clip to the Clips array
    message_ref.update({
        'Clips': firestore.ArrayUnion([{
            'id': clip_id,
            'commentary': commentary,
            'videoUrl': video_url,
            'start': start_time,
            'end': end_time,
            'filename': filename
        }])
    })
    
def db_add_video_to_chat(user_id, chat_id, video_id, file_name, gcs_url, mime_type):
    chat_ref = db.collection('User').document(user_id).collection('Chats').document(chat_id)
    chat_ref.update({
        'uploadedVideos': firestore.ArrayUnion([{
            'id': video_id,
            'file_name': file_name,
            'gcs_url': gcs_url,
            'mime_type': mime_type
        }])
    })

def db_get_chats(user_id):
    chats_ref = db.collection('User').document(user_id).collection('Chats')
    
    # Return list of chat data with document IDs
    return [{
        "id": chat.id,
        **{k: v for k, v in chat.to_dict().items() if k != 'messages'}
    } for chat in chats_ref.stream()]

def db_get_messages(user_id, chat_id):
    messages_ref = (
        db.collection('User')
        .document(user_id)
        .collection('Chats')
        .document(chat_id)
        .collection('Messages')
    )    

    try:
        # Stream messages ordered by timestamp (oldest to newest)
        message_stream = messages_ref.order_by('timestamp').stream()
        
        messages = []
        for doc in message_stream:
            doc_data = doc.to_dict()  # Extract the document data as a dictionary
            clips = doc_data.get('Clips', [])  # Safely get 'Clips' with default
            
            # Convert Firestore Timestamp to ISO format
            timestamp = doc_data.get('timestamp')
            if timestamp:
                timestamp = timestamp.isoformat()  # Works if timestamp is a Firestore Timestamp object
            
            messages.append({
                'id': doc.id,
                'timestamp': timestamp,
                'role': doc_data.get('role'),
                'MainMessage': doc_data.get('MainMessage'),
                'Clips': clips
            })
        
        return messages
        
    except Exception as e:
        print(f"Error retrieving messages: {str(e)}", flush=True)
        return []
    
def db_get_video_in_chat(user_id, chat_id):
    chat_ref = db.collection('User').document(user_id).collection('Chats').document(chat_id)
    doc = chat_ref.get()
    
    if doc.exists:
        video_data = doc.to_dict()
        return video_data
    else:
        return None
    
def db_get_profile(user_id):
    user_ref = db.collection('User').document(user_id)
    user_doc = user_ref.get()
    print(user_doc, flush=True)
    if user_doc.exists:
        return user_doc.to_dict()
    else:
        return {}
    
def db_delete_chat(user_id, chat_id):
    try:
        chat_ref = db.collection('User').document(user_id).collection('Chats').document(chat_id)        
        chat_ref.delete()
        return True
    except Exception as e:
        return False