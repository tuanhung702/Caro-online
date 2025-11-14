# File: backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from utils.supabase_service import authenticate_user, register_new_user

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
    # username = data.get("username") # <--- BỎ DÒNG NÀY

    # Thay đổi: Chỉ truyền email và password
    result = register_new_user(email, password) 
    return jsonify(result)