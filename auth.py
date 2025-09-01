# auth.py
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models import db, User
import datetime
import traceback

auth = Blueprint("auth", __name__)
bcrypt = Bcrypt()

def set_bcrypt_instance(bcrypt_instance):
    """Set the bcrypt instance for the auth blueprint"""
    global bcrypt
    bcrypt = bcrypt_instance

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Basic password validation"""
    return len(password) >= 6

@auth.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        print("Processing signup request")
        
        # Get and validate request data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract and validate fields
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Validation
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        if len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters"}), 400
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        if not validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400
        
        if not password:
            return jsonify({"error": "Password is required"}), 400
        
        if not validate_password(password):
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        # Check for existing users
        existing_user = User.query.filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing_user:
            if existing_user.email == email:
                return jsonify({"error": "Email already exists"}), 409
            else:
                return jsonify({"error": "Username already exists"}), 409
        
        # Create new user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(
            username=username,
            email=email,
            password=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"User created successfully: {username} ({email})")
        
        return jsonify({
            "message": "User created successfully",
            "user": {
                "username": username,
                "email": email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": "Failed to create user",
            "message": "An internal error occurred"
        }), 500

@auth.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        print("Processing login request")
        
        # Get and validate request data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Verify credentials
        if user and bcrypt.check_password_hash(user.password, password):
            # Create access token
            access_token = create_access_token(
                identity={
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                },
                expires_delta=datetime.timedelta(days=1)
            )
            
            print(f"Login successful: {user.username} ({user.email})")
            
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "created_at": user.created_at.isoformat()
                }
            }), 200
        else:
            print(f"Login failed for email: {email}")
            return jsonify({"error": "Invalid email or password"}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": "Login failed",
            "message": "An internal error occurred"
        }), 500

@auth.route('/verify', methods=['GET'])
def verify_token():
    """Verify JWT token endpoint"""
    try:
        from flask_jwt_extended import jwt_required, get_jwt_identity
        
        @jwt_required()
        def _verify():
            current_user = get_jwt_identity()
            return jsonify({
                "valid": True,
                "user": current_user
            }), 200
        
        return _verify()
        
    except Exception as e:
        return jsonify({
            "valid": False,
            "error": "Invalid token"
        }), 401

# Handle CORS preflight requests
@auth.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return '', 200