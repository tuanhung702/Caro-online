# File: backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from utils.supabase_service import authenticate_user, register_new_user, update_user_profile

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    result = authenticate_user(email, password)
    return jsonify(result)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")

    if not username:
        return jsonify({"success": False, "message": "Tên người dùng (username) là bắt buộc."})

    result = register_new_user(email, password, username)
    return jsonify(result)


@auth_bp.route("/update-profile", methods=["POST"])
def update_profile():
    """Update user profile: username, password"""
    data = request.get_json()
    user_id = data.get("user_id")
    username = data.get("username")
    password = data.get("password")  # optional
    email = data.get("email")

    if not user_id:
        return jsonify({"success": False, "message": "user_id là bắt buộc."})

    result = update_user_profile(user_id, username, password, email)
    return jsonify(result)