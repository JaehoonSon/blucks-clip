from flask import Blueprint, redirect, url_for, session, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import jwt
from datetime import datetime, timedelta
from utilities.database_action import db_add_user

OAuth_bp = Blueprint('oauth', __name__)


GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
JWT_SECRET = os.getenv('JWT_SECRET')  # Ensure this is set and kept secret
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600  # Token valid for 1 hour

def verify_google_token(token):
    """Verify Google ID token locally."""
    try:
        id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        # Additional checks
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return id_info
    except ValueError as e:
        # Invalid token
        print(f"Token verification failed: {e}")
        return None


def generate_jwt(user_info):
    """Generate a custom JWT token."""
    payload = {
        'user_id': user_info['id'],
        'email': user_info['email'],
        'exp': datetime.now() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


@OAuth_bp.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.get_json()
    credential = data.get("credential")
    
    if not credential:
        return jsonify({"error": "No credential provided"}), 400

    google_data = verify_google_token(credential)
    
    if not google_data:
        return jsonify({"error": "Invalid token"}), 401

    # Extract user details
    user_info = {
        "id": google_data["sub"],
        "name": google_data.get("name"),
        "email": google_data.get("email"),
        "picture": google_data.get("picture")
    }

    # Generate custom JWT token
    custom_token = generate_jwt(user_info)
    db_add_user(
        user_id=google_data["sub"],
        name=google_data.get("name"),
        email=google_data.get("email"),
        pfp_url=google_data.get("picture")
        )

    return jsonify({"user": user_info, "token": custom_token})