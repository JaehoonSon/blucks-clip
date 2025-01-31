from flask import Blueprint, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
from utilities.database_action import db_add_user

OAuth_bp = Blueprint('oauth', __name__)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

def verify_google_token(token):
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        return id_info
    except ValueError as e:
        print(f"Token verification failed: {e}")
        return None

@OAuth_bp.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.get_json()
    credential = data.get("credential")
    
    if not credential:
        return jsonify({"error": "No credential provided"}), 400

    google_data = verify_google_token(credential)
    if not google_data:
        return jsonify({"error": "Invalid token"}), 401

    user_info = {
        "id": google_data["sub"],
        "name": google_data.get("name"),
        "email": google_data.get("email"),
        "picture": google_data.get("picture")
    }

    # Add user to the database
    db_add_user(
        user_id=google_data["sub"],
        name=google_data.get("name"),
        email=google_data.get("email"),
        pfp_url=google_data.get("picture")
    )

    # Generate JWT token
    access_token = create_access_token(identity=user_info["id"])
    return jsonify({"user": user_info, "token": access_token})

@OAuth_bp.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    # Gives user_id
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200