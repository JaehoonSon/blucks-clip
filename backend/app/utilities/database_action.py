from google.cloud import firestore
from google.oauth2 import service_account

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