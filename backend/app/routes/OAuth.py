from flask import Blueprint, request, jsonify, make_response
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token, get_jwt,decode_token,set_refresh_cookies
from utilities.database_action import db_add_user
import datetime
import os

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

    # Generate JWT token and Refresh Token
    access_token = create_access_token(identity=user_info["id"])
    refresh_token = create_refresh_token(identity=user_info["id"])

    # Set refresh token in HTTP-only cookie
    response = make_response(jsonify({
        "user": user_info, 
        "token": access_token
    }))


    # Store refresh token in HTTP-only cookie
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        path="/",
        domain="localhost",
        max_age=60*60*24*7  # 7 days
    )

    return response

@OAuth_bp.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    # Gives user_id
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

@OAuth_bp.route('/api/refresh', methods=['POST'])
def refresh():

    print("Refresh token:", )  

    # Get the old refresh token
    refresh_token = request.cookies.get("refresh_token")

    print("Refresh token:", refresh_token)  

    # if not refresh_token:
    #     return {"error": "Missing refresh token"}, 401
    
    # try:
    #     decoded = decode_token(refresh_token)
    #     # if decoded["type"] != "refresh":
    #     #     return {"error": "Invalid token type"}, 401

    #     original_exp = decode_token(refresh_token)["exp"]
    #     user_id = decoded["sub"]

    # except Exception as e:
    #     pass
    #     # return {"error": "Invalid token"}, 401

    # # Calculate remaining time:
    # remaining_time = original_exp - datetime.utcnow().timestamp()

    # # Create new access token and refresh token
    # new_access_token = create_access_token(identity=user_id)
    # new_refresh_token = create_refresh_token(
    #     identity=user_id,
    #     expires_delta=datetime.timedelta(seconds=remaining_time)  # Inherit remaining time
    # )
    
    # response = jsonify({"token": new_access_token})

    # # Set refresh token in HTTP-only cookie
    # response.set_cookie(
    #     "refresh_token",
    #     new_refresh_token,
    #     httponly=True,
    #     secure=True,
    #     samesite="Lax",
    #     max_age=60*60*24*7
    # )
    
    return jsonify({"error": "Not implemented"}), 200

@OAuth_bp.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({"msg": "Logout successful"})
    response.delete_cookie("refresh_token")
    return response

@OAuth_bp.route('/api/validate', methods=['GET'])
@jwt_required()
def validate_session():
    try:
        refresh_token = request.cookies.get("refresh_token")
        print("Refresh token:", refresh_token)  

        # Manual verification gives us more control
        jwt = get_jwt()
        current_user_id = get_jwt_identity()
        
        return jsonify({
            "valid": True,
            "user": {
                "id": current_user_id,
                # Add other user fields from JWT if needed
            }
        }), 200
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"valid": False}), 401
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 500