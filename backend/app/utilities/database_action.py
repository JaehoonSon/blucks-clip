from google.cloud import firestore
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file("./theblucks-mail-c819d4641679.json")
project_id = "the-blucks-database"
db = firestore.Client(project=project_id, credentials=credentials)

def test_user():
    doc_ref = db.collection("users").document("user_123")
    doc_ref.set({
        "name": "Alice",
        "age": 25,
        "email": "alice@example.com"
    })
    print("Document added successfully!")