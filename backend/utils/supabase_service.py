# File: backend/utils/supabase_service.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Nạp file .env ---
load_dotenv()

# --- LẤY BIẾN MÔI TRƯỜNG ---
# ĐÚNG
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")


# --- KIỂM TRA ĐÃ NẠP ĐÚNG CHƯA ---
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("❌ Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong file .env")

# --- KẾT NỐI SUPABASE ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# --- 1. HÀM ĐĂNG NHẬP (SỬA ĐỔI) ---
# BỎ TRUY VẤN BẢNG PROFILES
def authenticate_user(email: str, password: str):
    """Xác thực người dùng bằng Supabase Auth."""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response.user and response.session:
            # XÓA: Lấy username từ bảng Profiles
            # profile_res = supabase.table('Profiles').select('username').eq('user_id', response.user.id).execute()
            # username = profile_res.data[0]['username'] if profile_res.data else "Player"
            
            return {
                "success": True, 
                "access_token": response.session.access_token,
                "user_id": response.user.id,
                # XÓA: username
            }
        else:
            return {"success": False, "message": "Thông tin đăng nhập không hợp lệ."}

    except Exception as e:
        print("❌ Lỗi đăng nhập:", e)
        return {"success": False, "message": "Email hoặc mật khẩu không chính xác."}


# --- 2. HÀM ĐĂNG KÝ (SỬA ĐỔI) ---
# BỎ THAM SỐ username VÀ LOGIC TẠO BẢNG PROFILES
def register_new_user(email: str, password: str): # <--- BỎ username: str
    """Đăng ký người dùng mới."""
    try:
        auth_response = supabase.auth.sign_up({
            "email": email, 
            "password": password
        })

        if auth_response.user:
            # XÓA: Logic tạo profile
            # user_id = auth_response.user.id
            # profile_data = {
            #     "user_id": user_id,
            #     "username": username,
            #     "elo_score": 1000,
            #     "total_wins": 0,
            #     "total_losses": 0
            # }
            # supabase.table('Profiles').insert(profile_data).execute()
            
            return {"success": True, "message": "Đăng ký thành công! Vui lòng kiểm tra email xác thực."}
        
        raise Exception(auth_response.error.message if auth_response.error else "Lỗi đăng ký không xác định")

    except Exception as e:
        error_message = str(e)
        if "User already registered" in error_message:
            return {"success": False, "message": "Email đã được sử dụng."}
        # XÓA: Điều kiện kiểm tra tên người dùng
        # if "duplicate key value violates unique constraint" in error_message:
        #     return {"success": False, "message": "Tên người dùng đã tồn tại."}
        return {"success": False, "message": f"Lỗi đăng ký: {error_message}"}