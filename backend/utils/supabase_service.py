# File: backend/utils/supabase_service.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

# --- Nạp file .env ---
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError(" Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong file .env")

# --- KẾT NỐI SUPABASE ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# --- 1. HÀM ĐĂNG NHẬP ---
def authenticate_user(email: str, password: str):
    """Authenticate against `Users` table.

    Returns a dict with either {success: True, user_id, username, email}
    or {success: False, message}.
    """
    try:
        resp = supabase.table('Users').select('user_id, password_hash').eq('email', email).execute()
        if not resp.data:
            return {"success": False, "message": "Email hoặc mật khẩu không chính xác."}

        user = resp.data[0]
        stored_hash = user.get('password_hash')
        if not stored_hash or not check_password_hash(stored_hash, password):
            return {"success": False, "message": "Email hoặc mật khẩu không chính xác."}

        user_id = user.get('user_id')

        # fetch username from Profiles
        try:
            profile = supabase.table('Profiles').select('username').eq('user_id', user_id).execute()
            username = profile.data[0]['username'] if profile.data else email.split('@')[0]
        except Exception:
            username = email.split('@')[0]

        return {"success": True, "user_id": user_id, "username": username, "email": email}

    except Exception as e:
        print(f"❌ authenticate_user error: {e}")
        return {"success": False, "message": "Lỗi khi xác thực người dùng."}


# --- 2. HÀM ĐĂNG KÝ ---
def register_new_user(email: str, password: str, username: str):
 
    try:
        # check existing email
        exists = supabase.table('Users').select('user_id').eq('email', email).execute()
        if exists.data:
            return {"success": False, "message": "Email đã được sử dụng."}

        # create hashed password
        pw_hash = generate_password_hash(password)

        # insert into Users
        user_res = supabase.table('Users').insert({
            'email': email,
            'password_hash': pw_hash
        }).execute()

        if not user_res.data:
            return {"success": False, "message": "Không thể tạo người dùng."}

        user_id = user_res.data[0].get('user_id')

        # create profile
        profile_data = {
            'user_id': user_id,
            'username': username,
            'elo_score': 1000,
            'total_wins': 0,
            'total_losses': 0
        }

        try:
            supabase.table('Profiles').insert(profile_data).execute()
        except Exception as profile_err:
            print(f" profile create warning: {profile_err}")
            # attempt to rollback user creation
            try:
                supabase.table('Users').delete().eq('user_id', user_id).execute()
            except Exception:
                pass
            return {"success": False, "message": "Lỗi khi tạo profile."}

        return {"success": True, "message": "Đăng ký thành công."}

    except Exception as e:
        err = str(e)
        print(f"❌ register_new_user error: {err}")
        if 'unique' in err.lower() or 'duplicate' in err.lower():
            return {"success": False, "message": "Tên người dùng hoặc email đã tồn tại."}
        return {"success": False, "message": f"Lỗi đăng ký: {err}"}


# --- 3. HÀM CẬP NHẬT PROFILE ---
def update_user_profile(user_id: int, username: str = None, password: str = None, email: str = None):
    """Update user profile (username, password in Users table, email).

    Returns {success: True, message} or {success: False, message}.
    """
    try:
        if username:
            supabase.table('Profiles').update({'username': username}).eq('user_id', user_id).execute()

        if password:
            pw_hash = generate_password_hash(password)
            supabase.table('Users').update({'password_hash': pw_hash}).eq('user_id', user_id).execute()

        return {"success": True, "message": "Cập nhật profile thành công."}

    except Exception as e:
        print(f"❌ update_user_profile error: {e}")
        return {"success": False, "message": f"Lỗi cập nhật profile: {str(e)}"}