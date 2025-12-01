# 🎮 Caro Online - Game Cờ Caro Trực Tuyến

Ứng dụng chơi cờ Caro (Gomoku) trực tuyến với hệ thống xếp hạng Elo, lịch sử đấu và AI thông minh.

## 📋 Mục Lục
- [Tính Năng Chính](#-tính-năng-chính)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt và Chạy](#-cài-đặt-và-chạy)
- [Luồng Hoạt Động](#-luồng-hoạt-động)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)

---

## 🎯 Tính Năng Chính

### 1. **Hệ Thống Người Dùng**
- ✅ Đăng ký tài khoản với username, email, password
- ✅ Đăng nhập bảo mật với mã hóa password (bcrypt)
- ✅ Quản lý profile: xem và chỉnh sửa thông tin
- ✅ Hiển thị thống kê cá nhân: Elo, số trận thắng/thua, tỷ lệ thắng

### 2. **Game Offline**
- ✅ **Người vs Người (PvP)**: Chơi 2 người trên cùng một màn hình
- ✅ **Người vs Máy (PvC)**: Đấu với AI sử dụng thuật toán Minimax
  - AI độ sâu tìm kiếm 2 bước
  - Alpha-beta pruning để tối ưu hóa
  - Đánh giá dựa trên patterns (5-liên, 4-mở, 3-mở, v.v.)
- ✅ Bàn cờ 20x20
- ✅ Không lưu kết quả vào database

### 3. **Game Online** ⭐
Chơi cờ Caro trực tuyến với người chơi khác qua mạng LAN/Internet.

#### Tính năng:
- ✅ Tạo phòng chơi (có/không mật khẩu)
- ✅ Tham gia phòng có sẵn
- ✅ Hệ thống sẵn sàng (Ready) trước khi bắt đầu
- ✅ Giới hạn thời gian mỗi nước đi: 30 giây
- ✅ Hiển thị lượt chơi và đếm ngược thời gian
- ✅ Chat trong phòng chơi (sắp có)
- ✅ Lưu kết quả trận đấu tự động
- ✅ Cập nhật Elo sau mỗi trận:
  - Thắng: +50 Elo
  - Thua: -50 Elo

#### Các cách kết thúc trận:
- **Hoàn thành**: Người chơi xếp được 5 ô liên tiếp
- **Hết thời gian**: Đối thủ không đi nước trong 30 giây
- **Thoát phòng**: Đối thủ ngắt kết nối hoặc rời phòng

### 4. **Lịch Sử Đấu**
- ✅ Xem lịch sử 50 trận đấu gần nhất
- ✅ Thông tin chi tiết mỗi trận:
  - Thời gian đấu
  - Tên đối thủ
  - Kết quả (Thắng/Thua)
  - Thay đổi Elo
  - Lý do kết thúc
- ✅ Giao diện responsive (desktop & mobile)

### 5. **Bảng Xếp Hạng**
- ✅ Xếp hạng toàn server theo Elo
- ✅ Hiển thị top 3 với huy chương
- ✅ Highlight người chơi hiện tại
- ✅ Thống kê tổng quan: Tổng số người chơi, Elo trung bình

---

## 🛠 Công Nghệ Sử Dụng

### Backend
- **Python 3.x**
- **Flask**: Web framework
- **Flask-SocketIO**: WebSocket cho real-time communication
- **Supabase**: PostgreSQL database cloud
- **bcrypt**: Mã hóa password

### Frontend
- **React 18**: UI framework
- **React Router**: Navigation
- **Socket.IO Client**: Real-time communication
- **Tailwind CSS**: Styling
- **Vite**: Build tool

### Database
- **PostgreSQL** (Supabase)
- Tables:
  - `Users`: Thông tin đăng nhập
  - `Profiles`: Thông tin người chơi và Elo
  - `MatchHistory`: Lịch sử các trận đấu

---

## 🚀 Cài Đặt và Chạy

### 1. Clone Repository
```bash
git clone https://github.com/tuanhung702/Caro-online.git
cd Caro-online
```

### 2. Cài Đặt Backend
```bash
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# hoặc
venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy backend
python app.py
```
Backend sẽ chạy tại: `http://0.0.0.0:5001`

### 3. Cài Đặt Frontend
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy frontend
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

### 4. Cấu Hình Supabase
Tạo file `.env` trong thư mục `backend`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### 4.1. Kết Nối với Database (Chi Tiết)

#### **A. Tạo Supabase Project**

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng nhập/Đăng ký
3. Tạo project mới:
   - Organization: Chọn hoặc tạo
   - Project name: `caro-online`
   - Database password: Lưu giữ an toàn
   - Region: Chọn gần bạn nhất (ví dụ: Singapore)
4. Chờ project khởi tạo (2-3 phút)

#### **B. Lấy thông tin kết nối**

Sau khi project được tạo, vào **Settings → API**:
- **Project URL** (supabase_url): Copy từ "Project URL"
- **Anon Key** (supabase_key): Copy từ "anon public"

```env
# File: backend/.env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **C. Tạo bảng dữ liệu (Schema)**

Vào **SQL Editor** trong Supabase Console, chạy script sau:

```sql
-- 1. Bảng Users (Đăng nhập)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Bảng Profiles (Thông tin người chơi)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    elo_score INTEGER DEFAULT 1000,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Bảng MatchHistory (Lịch sử trận đấu)
CREATE TABLE match_history (
    match_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    opponent_username VARCHAR(100),
    result VARCHAR(50) DEFAULT 'win',
    elo_change INTEGER,
    end_reason VARCHAR(50),
    match_date TIMESTAMP DEFAULT NOW(),
    final_board_state JSONB,
    moves_history JSONB,
    FOREIGN KEY (profile_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- 4. Tạo Index để tăng tốc độ query
CREATE INDEX idx_match_history_profile_id ON match_history(profile_id);
CREATE INDEX idx_match_history_date ON match_history(match_date DESC);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_users_email ON users(email);
```

#### **D. Cấu hình Backend Python**

**File: `backend/utils/supabase_service.py`**

```python
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load biến môi trường từ .env
load_dotenv()

# Khởi tạo Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL và SUPABASE_KEY chưa được cấu hình trong .env")

# Tạo client kết nối
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ===== Các hàm kết nối =====

def get_user_by_email(email):
    """Lấy thông tin user theo email"""
    try:
        response = supabase.table("users") \
            .select("*") \
            .eq("email", email) \
            .single() \
            .execute()
        return response.data
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        return None

def create_user(email, password_hash):
    """Tạo user mới"""
    try:
        response = supabase.table("users").insert({
            "email": email,
            "password_hash": password_hash
        }).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None

def create_profile(user_id, username):
    """Tạo profile cho user"""
    try:
        response = supabase.table("profiles").insert({
            "user_id": user_id,
            "username": username,
            "elo_score": 1000,
            "total_wins": 0,
            "total_losses": 0
        }).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error creating profile: {e}")
        return None

def get_profile_by_username(username):
    """Lấy profile theo username"""
    try:
        response = supabase.table("profiles") \
            .select("*") \
            .eq("username", username) \
            .single() \
            .execute()
        return response.data
    except Exception as e:
        print(f"❌ Error getting profile: {e}")
        return None

def get_top_players(limit=50):
    """Lấy danh sách top player theo Elo"""
    try:
        response = supabase.table("profiles") \
            .select("user_id, username, elo_score, total_wins, total_losses") \
            .order("elo_score", desc=True) \
            .limit(limit) \
            .execute()
        return response.data
    except Exception as e:
        print(f"❌ Error getting top players: {e}")
        return []

def insert_match_result(match_data):
    """Lưu kết quả trận đấu"""
    try:
        response = supabase.table("match_history").insert(match_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error inserting match: {e}")
        return None

def test_connection():
    """Test kết nối Supabase"""
    try:
        response = supabase.table("profiles").select("*").limit(1).execute()
        print("✅ Kết nối Supabase thành công!")
        return True
    except Exception as e:
        print(f"❌ Lỗi kết nối Supabase: {e}")
        return False
```

#### **E. Sử dụng trong Backend (Routes/Events)**

**File: `backend/routes/auth_routes.py`**

```python
from flask import Blueprint, request, jsonify
from utils.supabase_service import (
    get_user_by_email, create_user, create_profile, 
    get_profile_by_username
)
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Đăng ký tài khoản"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        
        # Kiểm tra người dùng đã tồn tại
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "Email đã được đăng ký"}), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Tạo user
        user = create_user(email, password_hash)
        if not user:
            return jsonify({"error": "Tạo user thất bại"}), 500
        
        # Tạo profile
        profile = create_profile(user['user_id'], username)
        if not profile:
            return jsonify({"error": "Tạo profile thất bại"}), 500
        
        return jsonify({
            "success": True,
            "user_id": user['user_id'],
            "username": username,
            "email": email
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Đăng nhập"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Lấy user từ DB
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "Email hoặc password sai"}), 401
        
        # Kiểm tra password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"error": "Email hoặc password sai"}), 401
        
        # Lấy profile
        profile = get_profile_by_username(user['user_id'])
        
        return jsonify({
            "success": True,
            "user_id": user['user_id'],
            "username": profile['username'],
            "elo": profile['elo_score'],
            "email": email
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

#### **F. Test kết nối**

**File: `backend/test_connection.py`**

```python
from utils.supabase_service import test_connection

if __name__ == "__main__":
    print("Testing Supabase connection...")
    if test_connection():
        print("✅ Sẵn sàng sử dụng!")
    else:
        print("❌ Kiểm tra cấu hình lại")
```

Chạy test:
```bash
cd backend
python test_connection.py
```

#### **G. Troubleshooting**

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| `SUPABASE_URL not found` | Không load được .env | Kiểm tra file `.env` có tồn tại không |
| `Connection refused` | URL sai | Copy lại Project URL từ Supabase |
| `Invalid API key` | API Key sai | Kiểm tra lại Anon Key |
| `Table does not exist` | Chưa tạo schema | Chạy SQL script tạo bảng |
| `Foreign key constraint` | Xóa profile khi user còn | Xóa match_history trước |
Để chơi với người khác trong cùng mạng WiFi:

1. **Tìm IP máy host**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. **Frontend tự động phát hiện**: File `frontend/src/config/api.js` đã được cấu hình tự động
   - Truy cập `localhost:5173` → kết nối `localhost:5001`
   - Truy cập `192.168.x.x:5173` → kết nối `192.168.x.x:5001`

3. **Máy khác truy cập**: `http://[IP_máy_host]:5173`

---

## 🔄 Luồng Hoạt Động

### 📌 Luồng Chơi Cờ Online (2 Người Chơi)

#### **Bước 1: Khởi tạo và Kết nối**
```
┌─────────────┐                    ┌─────────────┐                    ┌──────────┐
│  Player 1   │                    │   Backend   │                    │ Player 2 │
│  (Client)   │                    │  (Server)   │                    │ (Client) │
└──────┬──────┘                    └──────┬──────┘                    └────┬─────┘
       │                                   │                                │
       │ 1. Socket.IO Connect              │                                │
       ├──────────────────────────────────>│                                │
       │                                   │                                │
       │ 2. Get Rooms List                 │                                │
       ├──────────────────────────────────>│                                │
       │<─────────────────────────────────┤│                                │
       │   rooms_list: []                  │                                │
       │                                   │ 3. Socket.IO Connect           │
       │                                   │<───────────────────────────────┤
```

#### **Bước 2: Tạo và Tham Gia Phòng**
```
       │                                   │                                │
       │ 4. create_room_request            │                                │
       │    - name: "Phòng 1"              │                                │
       │    - password: null               │                                │
       │    - player_name: "Player1"       │                                │
       │    - user_id: 1                   │                                │
       ├──────────────────────────────────>│                                │
       │                                   │                                │
       │                          ┌────────┴────────┐                       │
       │                          │ Create Room     │                       │
       │                          │ - Assign ID     │                       │
       │                          │ - Add Player 1  │                       │
       │                          │   (Symbol: X)   │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ 5. room_created_success           │                                │
       │    - room_id                      │                                │
       │    - player_symbol: "X"           │                                │
       │<─────────────────────────────────┤│                                │
       │                                   │                                │
       │                                   │ Broadcast: rooms_list_update   │
       │<──────────────────────────────────┤───────────────────────────────>│
       │   [Room "Phòng 1": 1/2 players]  │                                │
       │                                   │                                │
       │                                   │ 6. join_room_request           │
       │                                   │    - room_id                   │
       │                                   │    - player_name: "Player2"    │
       │                                   │    - user_id: 2                │
       │                                   │<───────────────────────────────┤
       │                          ┌────────┴────────┐                       │
       │                          │ Add Player 2    │                       │
       │                          │ - Symbol: O     │                       │
       │                          │ - Join room     │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ Broadcast: player_joined          │ 7. join_success                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │   players: [Player1(X), Player2(O)]│  - player_symbol: "O"         │
```

#### **Bước 3: Sẵn Sàng và Bắt Đầu Game**
```
       │                                   │                                │
       │ 8. ready_to_play                  │                                │
       ├──────────────────────────────────>│                                │
       │                          ┌────────┴────────┐                       │
       │                          │ Set Player1     │                       │
       │                          │ Ready = true    │                       │
       │                          └────────┬────────┘                       │
       │ Broadcast: player_ready           │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │                                   │                                │
       │                                   │ 9. ready_to_play               │
       │                                   │<───────────────────────────────┤
       │                          ┌────────┴────────┐                       │
       │                          │ Set Player2     │                       │
       │                          │ Ready = true    │                       │
       │                          │ Both ready!     │                       │
       │                          │ Start Game      │                       │
       │                          │ - Timer: 30s    │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ Broadcast: game_started           │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │   - current_player: "X"           │                                │
       │   - board: 20x20 empty            │                                │
```

#### **Bước 4: Chơi Game (Lượt Đi)**
```
       │                                   │                                │
       │ 10. make_move                     │                                │
       │     - row: 10, col: 10            │                                │
       ├──────────────────────────────────>│                                │
       │                          ┌────────┴────────┐                       │
       │                          │ Validate Move   │                       │
       │                          │ - Check turn    │                       │
       │                          │ - Check valid   │                       │
       │                          │ - Update board  │                       │
       │                          │ - Stop timer    │                       │
       │                          │ - Check winner  │                       │
       │                          │ - Start new     │                       │
       │                          │   timer (30s)   │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ Broadcast: move_made              │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │   - row: 10, col: 10              │                                │
       │   - player: "X"                   │                                │
       │   - current_player: "O"           │                                │
       │   - board: updated                │                                │
       │                                   │                                │
       │                                   │ 11. make_move                  │
       │                                   │     - row: 10, col: 11         │
       │                                   │<───────────────────────────────┤
       │                          [Repeat validation]                       │
       │                                   │                                │
       │ Broadcast: move_made              │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │   - current_player: "X"           │                                │
       │                                   │                                │
       │       [Players continue alternating moves...]                      │
```

#### **Bước 5: Kết Thúc Game**

**Trường hợp 1: Thắng bằng 5 ô liên tiếp**
```
       │                                   │                                │
       │ 12. make_move (winning move)      │                                │
       ├──────────────────────────────────>│                                │
       │                          ┌────────┴────────┐                       │
       │                          │ Check Winner    │                       │
       │                          │ Found 5 in row! │                       │
       │                          │ - Stop timer    │                       │
       │                          │ - Save match:   │                       │
       │                          │   * Winner +50  │                       │
       │                          │   * Loser -50   │                       │
       │                          │   * Reason:     │                       │
       │                          │     "normal"    │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ Broadcast: move_made              │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │                                   │                                │
       │ Broadcast: game_over              │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │   - winner: "X"                   │                                │
       │   - winner_name: "Player1"        │                                │
       │   - message: "Player1 đã thắng!"  │                                │
```

**Trường hợp 2: Hết thời gian**
```
       │                                   │                                │
       │        [Player không đi trong 30s]│                                │
       │                          ┌────────┴────────┐                       │
       │                          │ Timer Timeout   │                       │
       │                          │ - Save match:   │                       │
       │                          │   * Winner +50  │                       │
       │                          │   * Loser -50   │                       │
       │                          │   * Reason:     │                       │
       │                          │     "timeout"   │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ Broadcast: move_timeout           │                                │
       │<──────────────────────────────────┼───────────────────────────────>│
       │   - winner: "O"                   │                                │
       │   - message: "Player2 thắng!      │                                │
       │              Đối thủ hết giờ"     │                                │
```

**Trường hợp 3: Người chơi thoát**
```
       │                                   │                                │
       │                                   │ 13. disconnect                 │
       │                                   │<───────────────────────────────┤
       │                          ┌────────┴────────┐                       │
       │                          │ Handle Disconnect                       │
       │                          │ - Find room     │                       │
       │                          │ - Remaining     │                       │
       │                          │   player wins   │                       │
       │                          │ - Save match:   │                       │
       │                          │   * Winner +50  │                       │
       │                          │   * Loser -50   │                       │
       │                          │   * Reason:     │                       │
       │                          │   "disconnect"  │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │ opponent_left                     │                                │
       │<─────────────────────────────────┤│                                │
       │   - winner: "X"                   │                                │
       │   - message: "Bạn thắng!          │                                │
       │              Đối thủ rời phòng"   │                                │
```

#### **Bước 6: Sau Khi Kết Thúc**
```
       │                                   │                                │
       │                          ┌────────┴────────┐                       │
       │                          │ Update Database │                       │
       │                          │ ✅ MatchHistory │                       │
       │                          │   - Winner rec  │                       │
       │                          │   - Loser rec   │                       │
       │                          │ ✅ Profiles     │                       │
       │                          │   - Update Elo  │                       │
       │                          │   - Win/Loss    │                       │
       │                          │     count       │                       │
       │                          │ 🔄 Reset Room   │                       │
       │                          │   - Clear board │                       │
       │                          │   - Status:     │                       │
       │                          │     waiting     │                       │
       │                          └────────┬────────┘                       │
       │                                   │                                │
       │   [Players can ready up and play again, or leave room]            │
```

---

### 📊 Luồng Dữ Liệu Lưu Match

```
┌──────────────────┐
│  Game Finished   │
│  (5 in row /     │
│   timeout /      │
│   disconnect)    │
└────────┬─────────┘
         │
         v
┌────────────────────────────────────────────┐
│ Backend: save_match_result()               │
│                                            │
│ 1. Get Winner & Loser Profiles from DB    │
│    - username, current_elo, wins, losses  │
│                                            │
│ 2. Create Winner Match Record             │
│    ├─ profile_id: winner_user_id          │
│    ├─ opponent_username: loser_name       │
│    ├─ result: "win"                       │
│    ├─ elo_change: +50                     │
│    ├─ end_reason: "normal"/"timeout"/etc  │
│    └─ match_date, board_state             │
│                                            │
│ 3. Create Loser Match Record              │
│    ├─ profile_id: loser_user_id           │
│    ├─ opponent_username: winner_name      │
│    ├─ result: "win" (constraint DB)       │
│    ├─ elo_change: -50                     │
│    ├─ end_reason: same as winner          │
│    └─ match_date, board_state             │
│                                            │
│ 4. Insert Both Records to MatchHistory   │
│                                            │
│ 5. Update Winner Profile                  │
│    ├─ elo_score: +50                      │
│    └─ total_wins: +1                      │
│                                            │
│ 6. Update Loser Profile                   │
│    ├─ elo_score: -50                      │
│    └─ total_losses: +1                    │
│                                            │
│ 7. Return success response                │
└────────────────────────────────────────────┘
         │
         v
┌────────────────────────────────────────────┐
│ Database (Supabase PostgreSQL)             │
│                                            │
│ Tables Updated:                            │
│ ✅ MatchHistory (2 new rows)              │
│ ✅ Profiles (2 rows updated)              │
└────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Dự Án

```
cờ CARO-online/
│
├── backend/
│   ├── app.py                      # Entry point Flask app
│   ├── socketio_instance.py        # Socket.IO instance
│   ├── requirements.txt            # Python dependencies
│   │
│   ├── models/
│   │   └── gameroom.py            # GameRoom class (board, players, timer)
│   │
│   ├── routes/
│   │   ├── auth_routes.py         # Login, register, update profile
│   │   ├── match_routes.py        # Match history, stats, rankings
│   │   └── room_routes.py         # Room management (sắp xóa)
│   │
│   ├── sockets/
│   │   ├── room_events.py         # Socket: create/join room, ready, disconnect
│   │   ├── game_events.py         # Socket: make_move, timeout
│   │   └── chat_events.py         # Socket: chat (sắp có)
│   │
│   ├── states/
│   │   └── room_manager.py        # Quản lý danh sách rooms
│   │
│   └── utils/
│       ├── supabase_service.py    # Auth, profile management
│       └── match_service.py       # Save match, get history, rankings
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   └── src/
│       ├── App.jsx                # Router chính
│       ├── main.jsx               # Entry point
│       ├── style.css
│       │
│       ├── config/
│       │   └── api.js             # Backend URL config
│       │
│       ├── components/
│       │   ├── Board.jsx          # Bàn cờ offline
│       │   ├── Cell.jsx           # Ô cờ
│       │   ├── GameBoard.jsx      # Bàn cờ online
│       │   ├── ChatBox.jsx        # Chat component
│       │   ├── CreateRoomModal.jsx # Modal tạo phòng
│       │   ├── PasswordModal.jsx  # Modal nhập password
│       │   ├── ProtectedRoute.jsx # Auth guard
│       │   ├── RoomList.jsx       # Danh sách phòng
│       │   ├── Status.jsx         # Trạng thái game
│       │   ├── UserStats.jsx      # Stats component
│       │   └── WaitingRoom.jsx    # Phòng chờ
│       │
│       ├── page/
│       │   ├── Login.jsx          # Trang đăng nhập
│       │   ├── Register.jsx       # Trang đăng ký
│       │   ├── Home.jsx           # Menu chính
│       │   ├── Profile.jsx        # Trang profile
│       │   ├── GameOffline.jsx    # Game offline (PvP, PvC)
│       │   ├── GameOnline.jsx     # Game online
│       │   ├── History.jsx        # Lịch sử đấu
│       │   └── Rank.jsx           # Bảng xếp hạng
│       │
│       └── utils/
│           └── aiMinimax.js       # AI Minimax cho offline mode
│
└── README.md                       # File này
```

---

## 🎮 Hướng Dẫn Sử Dụng

### Chơi Game Online

1. **Đăng nhập** vào tài khoản
2. Chọn **"Chơi Online"** từ menu chính
3. **Tạo phòng mới**:
   - Nhập tên phòng
   - Tùy chọn: Đặt mật khẩu
   - Click "Tạo Phòng"
4. **Hoặc tham gia phòng có sẵn**:
   - Chọn phòng từ danh sách
   - Nhập mật khẩu (nếu có)
5. **Chờ đối thủ** tham gia
6. **Click "Sẵn Sàng"** khi cả 2 người đã vào
7. **Chơi game**:
   - Người X đi trước
   - Click vào ô để đánh
   - Mỗi lượt có 30 giây
8. **Kết thúc**: Người xếp được 5 ô liên tiếp thắng

---

## 🔐 Database Schema

### Users Table
```sql
- user_id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- created_at
```

### Profiles Table
```sql
- user_id (PRIMARY KEY, FK → Users)
- username (UNIQUE)
- elo_score (default: 1000)
- total_wins (default: 0)
- total_losses (default: 0)
- created_at
```

### MatchHistory Table
```sql
- match_history_id (PRIMARY KEY)
- profile_id (FK → Profiles)
- opponent_username
- result ("win" - do constraint DB)
- elo_change (+ for win, - for loss)
- end_reason ("normal", "timeout", "disconnect")
- match_date
- final_board_state (JSON)
```

---

## 🐛 Troubleshooting

### Backend không chạy
```bash
# Kiểm tra port 5001
lsof -ti:5001

# Kill process nếu cần
kill -9 <PID>

# Activate venv và chạy lại
source venv/bin/activate
python app.py
```

### Frontend không kết nối backend
- Kiểm tra `frontend/src/config/api.js`
- Đảm bảo backend đang chạy trên đúng port
- Kiểm tra firewall/network

### Không lưu match history
- Kiểm tra backend console log
- Xác nhận cả 2 người chơi đã đăng nhập (có user_id)
- Kiểm tra Supabase connection

---

## 📝 License

MIT License - Tự do sử dụng cho mục đích học tập và phát triển.

---

## 👥 Contributors

- **Tuấn Hùng** - Developer chính
- **GitHub**: [tuanhung702](https://github.com/tuanhung702)

---

## 📮 Liên Hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo Issue trên GitHub repository.

**Chúc bạn chơi game vui vẻ! 🎮🏆**

---

## 2. Triển khai Backend (Phần Máy chủ)

### 2.1. Phát triển API

#### Kiến trúc
- **RESTful API**: Sử dụng FastAPI để triển khai các endpoint phục vụ các thao tác không realtime như: auth, profile, match history, leaderboard, tạo phòng (persistent).

#### Các API chính

1. **Đăng ký người dùng**
   - **Endpoint**: `POST /auth/register`
   - **Request Body**:
     ```json
     {
       "username": "string (required, unique)",
       "email": "string (required, valid email)",
       "password": "string (required, min 8 characters)"
     }
     ```
   - **Response (Success - 201)**:
     ```json
     {
       "id": "uuid",
       "username": "string",
       "email": "string",
       "created_at": "timestamp"
     }
     ```
   - **Response (Error - 400)**:
     ```json
     {
       "error": "Username already exists | Email already registered | Invalid password format"
     }
     ```
   - **Chức năng**: Tạo user, hash password bằng bcrypt, lưu vào Supabase.

2. **Đăng nhập**
   - **Endpoint**: `POST /auth/login`
   - **Request Body**:
     ```json
     {
       "email": "string (required)",
       "password": "string (required)"
     }
     ```
   - **Response (Success - 200)**:
     ```json
     {
       "token": "jwt_token or supabase_session_token",
       "user": {
         "id": "uuid",
         "username": "string",
         "email": "string",
         "elo": "integer",
         "stats": {
           "wins": "integer",
           "losses": "integer",
           "draws": "integer"
         }
       }
     }
     ```
   - **Response (Error - 401)**:
     ```json
     {
       "error": "Invalid email or password"
     }
     ```
   - **Chức năng**: Xác thực, trả JWT token hoặc Supabase session.

3. **Lấy thông tin người dùng**
   - **Endpoint**: `GET /users/:id`
   - **Headers**: `Authorization: Bearer <token>`
   - **Response (Success - 200)**:
     ```json
     {
       "id": "uuid",
       "username": "string",
       "email": "string",
       "elo": "integer",
       "stats": {
         "wins": "integer",
         "losses": "integer",
         "draws": "integer",
         "total_games": "integer"
       },
       "profile_picture": "url (optional)",
       "created_at": "timestamp"
     }
     ```
   - **Response (Error - 404)**:
     ```json
     {
       "error": "User not found"
     }
     ```
   - **Chức năng**: Trả profile, elo, và stats của người dùng.

4. **Tạo phòng chơi**
   - **Endpoint**: `POST /rooms`
   - **Headers**: `Authorization: Bearer <token>`
   - **Request Body**:
     ```json
     {
       "room_name": "string (required)",
       "password": "string (optional, for private rooms)",
       "max_players": "integer (default: 2)",
       "is_public": "boolean (default: true)"
     }
     ```
   - **Response (Success - 201)**:
     ```json
     {
       "room_id": "uuid",
       "room_name": "string",
       "created_by": "uuid",
       "max_players": "integer",
       "current_players": "integer",
       "status": "waiting (hoặc in_progress)",
       "created_at": "timestamp"
     }
     ```
   - **Chức năng**: Tạo phòng chơi mới, lưu vào DB nếu muốn persistent.

5. **Liệt kê phòng chơi**
   - **Endpoint**: `GET /rooms`
   - **Query Parameters**:
     ```
     ?status=waiting,in_progress (optional)
     &is_public=true (optional)
     &limit=20 (optional, default: 20)
     &offset=0 (optional, default: 0)
     ```
   - **Response (Success - 200)**:
     ```json
     {
       "rooms": [
         {
           "room_id": "uuid",
           "room_name": "string",
           "created_by": "uuid (username)",
           "current_players": "integer",
           "max_players": "integer",
           "status": "waiting (hoặc in_progress)",
           "is_public": "boolean",
           "created_at": "timestamp"
         }
       ],
       "total": "integer",
       "limit": "integer",
       "offset": "integer"
     }
     ```
   - **Chức năng**: Liệt kê các phòng chơi đang hoạt động hoặc công khai.

6. **Lịch sử trận đấu**
   - **Endpoint**: `GET /matches`
   - **Headers**: `Authorization: Bearer <token>`
   - **Query Parameters**:
     ```
     ?userId=<uuid> (required)
     &limit=20 (optional, default: 20)
     &offset=0 (optional, default: 0)
     &sort=desc (optional, sort by date: asc|desc)
     ```
   - **Response (Success - 200)**:
     ```json
     {
       "matches": [
         {
           "match_id": "uuid",
           "player_1": {
             "id": "uuid",
             "username": "string",
             "result": "win|loss|draw"
           },
           "player_2": {
             "id": "uuid",
             "username": "string",
             "result": "win|loss|draw"
           },
           "result": "win|loss|draw",
           "elo_change": "integer (+/-)",
           "played_at": "timestamp",
           "duration": "integer (seconds)"
         }
       ],
       "total": "integer",
       "limit": "integer",
       "offset": "integer"
     }
     ```
   - **Response (Error - 401)**:
     ```json
     {
       "error": "Unauthorized - Invalid token"
     }
     ```
   - **Chức năng**: Trả về lịch sử các trận đấu của người dùng.

7. **Bảng xếp hạng**
   - **Endpoint**: `GET /ranking`
   - **Query Parameters**:
     ```
     ?limit=50 (optional, default: 50)
     &offset=0 (optional, default: 0)
     &region=global (optional, filter by region)
     ```
   - **Response (Success - 200)**:
     ```json
     {
       "ranking": [
         {
           "rank": "integer",
           "user_id": "uuid",
           "username": "string",
           "elo": "integer",
           "wins": "integer",
           "losses": "integer",
           "total_games": "integer",
           "win_rate": "float (percentage)"
         }
       ],
       "total_players": "integer",
       "limit": "integer",
       "offset": "integer"
     }
     ```
   - **Chức năng**: Trả về danh sách top người chơi theo elo (bảng xếp hạng).

#### Bảo mật API
- Sử dụng JWT hoặc Supabase auth để xác thực.
- Kiểm tra token ở middleware/Depends trước khi cho phép truy cập các endpoint bảo mật.

---

### 2.2. Triển khai Game Logic Engine

#### Vị trí
- **Module**: `models/gameroom.py` và `utils/check_win.py`.

#### Chức năng chính
1. **Xác thực nước đi hợp lệ**:
   - Trong bounds (0..19).
   - Ô trống.
   - Đúng lượt.

2. **Cập nhật trạng thái bàn cờ**:
   - Quản lý ma trận bàn cờ (board matrix 20×20).

3. **Lưu lịch sử nước đi**:
   - Lưu lại các nước đi để phục vụ replay trận đấu.

4. **Kiểm tra chiến thắng/hòa**:
   - Kiểm tra 4 hướng (ngang, dọc, chéo chính, chéo phụ).
   - Đếm số quân liên tiếp >= 5 để xác định thắng.

5. **Xử lý timeout**:
   - Nếu người chơi không đi trong 30 giây, xử thua.

#### Mẫu code kiểm tra thắng (tóm tắt):
```python
def check_win(board, x, y, player):
    dirs = [(0,1), (1,0), (1,1), (1,-1)]
    for dx, dy in dirs:
        cnt = 1 + count(board, x, y, dx, dy, player) + count(board, x, y, -dx, -dy, player)
        if cnt >= 5:
            return True
    return False
```

#### Quy trình xử lý `make_move`
1. Server nhận event `make_move` (roomId, x, y, playerId).
2. Kiểm tra token & quyền (player có trong room, đúng ô, đúng lượt).
3. Gọi `room.make_move(x, y, player_no)`:
   - Nếu hợp lệ: cập nhật board, thêm history.
   - Kiểm tra thắng/hòa → cập nhật status.
4. Gửi broadcast `move_made` tới cả room; nếu kết thúc, gửi `game_over` và gọi service lưu match & update ELO.

---

### 3. Triển khai Real-time (Thời gian thực)

#### 3.1. Thiết lập WebSockets Server

- **Công nghệ**: Sử dụng Flask-SocketIO (Python – `Flask-SocketIO` + Eventlet).
- **Khởi tạo** (file `app.py`):
```python
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
```

- **Xác thực khi connect**:
  - Client gửi token trong handshake khi connect.
  - Server verify token trong event `connect` bằng middleware (file `sockets/__init__.py`).
  - Nếu token không hợp lệ, từ chối kết nối.

#### 3.2. Quản lý Phiên trận đấu (Session / Events)

##### Các event chính (client ↔ server):

**Client → Server** (file `sockets/room_events.py`, `sockets/game_events.py`):
- `create_room_request` → `{room_name, password, player_name, user_id}`
- `join_room_request` → `{room_id, password, player_name, user_id}`
- `leave_room` → `{room_id}`
- `ready_to_play` → `{room_id, user_id}`
- `make_move` → `{room_id, row, col, player_no}`
- `chat_message` → `{room_id, message, from_player}` (sắp có)

**Server → Clients** (broadcast to room):
- `rooms_list_update` → `[rooms array]` (gửi tới tất cả client)
- `room_created_success` → `{room_id, player_symbol, status}`
- `join_success` → `{room_id, player_symbol, players, status}`
- `player_joined` → `{players, status}` (broadcast)
- `player_ready` → `{players_ready_status}` (broadcast)
- `game_started` → `{current_player, board, players}` (broadcast)
- `move_made` → `{row, col, player, board, current_player, time_remaining}` (broadcast)
- `move_rejected` → `{reason, message}` (gửi riêng cho player)
- `game_over` → `{winner, winner_name, reason, message}` (broadcast)
- `opponent_left` → `{winner, message}` (gửi cho người còn lại)
- `move_timeout` → `{winner, winner_name, message}` (broadcast)
- `player_disconnected` → `{message}` (broadcast)

##### Mẫu code xử lý event (file `sockets/room_events.py`):
```python
from flask_socketio import emit, join_room, leave_room, rooms
from app import socketio
from states.room_manager import room_manager

@socketio.on('join_room_request')
def handle_join_room(data):
    room_id = data.get('room_id')
    user_id = data.get('user_id')
    player_name = data.get('player_name')
    
    # Validate room exists
    room = room_manager.get_room(room_id)
    if not room:
        emit('error_message', {'error': 'Room not found'})
        return
    
    # Add player to room
    join_room(room_id)
    room.add_player(user_id, player_name)
    
    # Broadcast to room
    socketio.emit('player_joined', {
        'players': room.get_players_info(),
        'status': room.status
    }, room=room_id)
```

##### Mẫu code xử lý make_move (file `sockets/game_events.py`):
```python
@socketio.on('make_move')
def handle_make_move(data):
    room_id = data.get('room_id')
    row, col = data.get('row'), data.get('col')
    player_no = data.get('player_no')
    
    room = room_manager.get_room(room_id)
    if not room:
        emit('error_message', {'error': 'Room not found'})
        return
    
    # Validate move
    if not room.is_valid_move(row, col, player_no):
        emit('move_rejected', {'reason': 'Invalid move'})
        return
    
    # Make move on board
    room.make_move(row, col, player_no)
    
    # Broadcast move to room
    socketio.emit('move_made', {
        'row': row,
        'col': col,
        'player': player_no,
        'board': room.get_board(),
        'current_player': room.get_current_player()
    }, room=room_id)
    
    # Check win condition
    if room.check_win(row, col, player_no):
        winner_info = room.get_winner_info(player_no)
        socketio.emit('game_over', {
            'winner': player_no,
            'winner_name': winner_info['name'],
            'reason': 'normal',
            'message': f"{winner_info['name']} đã thắng!"
        }, room=room_id)
        
        # Save match to database
        from utils.match_service import save_match_result
        save_match_result(room)
```

##### Luồng dữ liệu khi A đánh (chi tiết):
1. **Frontend A**: `socket.emit('make_move', {room_id, row, col, player_no})`
2. **Backend**: Nhận event `make_move` → validate move → cập nhật board state trong `room` object
3. **Backend**: `socketio.emit('move_made', {...}, room=room_id)` → broadcast tới tất cả client trong room
4. **Frontend A & B**: Nhận `move_made` → cập nhật bàn cờ UI ngay
5. **Backend**: Kiểm tra `room.check_win(row, col, player_no)` → nếu thắng:
   - Emit `game_over` → broadcast kết thúc game
   - Gọi `save_match_result(room)` → lưu match vào database + update Elo
6. **Frontend A & B**: Nhận `game_over` → hiển thị thông tin kết quả

##### Xử lý timeout (file `sockets/game_events.py`):
```python
import threading

def start_move_timer(room_id, timeout=30):
    """Start 30-second timer for current player"""
    room = room_manager.get_room(room_id)
    
    def timeout_handler():
        if room and not room.is_finished():
            # Current player timeout - opponent wins
            opponent = 1 if room.current_player == 0 else 0
            socketio.emit('move_timeout', {
                'winner': opponent,
                'winner_name': room.players[opponent]['name'],
                'message': f"Hết giờ! {room.players[opponent]['name']} thắng!"
            }, room=room_id)
            
            room.finish_game(opponent, 'timeout')
            from utils.match_service import save_match_result
            save_match_result(room)
    
    timer = threading.Timer(timeout, timeout_handler)
    room.current_timer = timer
    timer.start()

def cancel_timer(room_id):
    """Cancel current timer when move is made"""
    room = room_manager.get_room(room_id)
    if room and room.current_timer:
        room.current_timer.cancel()
```

##### Xử lý disconnect (file `sockets/room_events.py`):
```python
@socketio.on('disconnect')
def handle_disconnect():
    # Find room containing this player
    room = room_manager.find_room_by_socket_id(request.sid)
    if room:
        opponent = room.get_opponent()
        
        socketio.emit('opponent_left', {
            'winner': opponent['player_no'],
            'message': f"Bạn thắng! Đối thủ rời khỏi phòng"
        }, room=room.room_id)
        
        room.finish_game(opponent['player_no'], 'disconnect')
        from utils.match_service import save_match_result
        save_match_result(room)
        
        room_manager.remove_room(room.room_id)
```

#### 3.3. Lưu ý về Security & Performance

- **Server Authoritative**: Server xác thực TẤT CẢ nước đi - client không thể gian lận.
- **Token Verification**: Kiểm tra token ở mỗi event pháp quyền.
- **Client-side UI Update**: Client chỉ thay đổi UI sau khi nhận `move_made` từ server.
- **Database Transaction**: Mỗi khi `game_over`, gọi `save_match_result()` để lưu trữ nguyên tử.
- **Concurrent Connections**: Eventlet xử lý tự động, hỗ trợ hàng trăm kết nối đồng thời.

---

### 4. Triển khai Frontend (Giao diện Người dùng)

#### 4.1. Cấu Trúc Giao Diện

**Các component chính** (file `frontend/src/components/`):

1. **Board.jsx**: Render grid 20×20
   - Props: `board` (2D array), `onCellClick` (handler click ô)
   - Hiển thị X/O/empty ở mỗi ô

2. **Cell.jsx**: 1 ô cờ
   - Props: `value` (X/O/null), `onClick`
   - Xử lý click event

3. **GameBoard.jsx**: Component chính quản lý game logic
   - Props: `roomId`, `playerSymbol`, `board`, `currentPlayer`, `winner`, `messages`, `socket`
   - Hiển thị: Board + Status + ChatBox + Timer countdown 30s
   - Logic: Kiểm tra lượt chơi, hiển thị modal khi game kết thúc

4. **Status.jsx**: Trạng thái game
   - Hiển thị: Lượt chơi hiện tại, time left, tên 2 người chơi, điểm

5. **ChatBox.jsx**: Chat trong phòng
   - Hiển thị message list + input gửi tin nhắn

6. **RoomList.jsx**: Danh sách phòng
   - Hiển thị: Phòng hiện có, nút Join/Create
   - Xử lý filter, sort theo trạng thái

7. **CreateRoomModal.jsx**: Modal tạo phòng
   - Input: Tên phòng, mật khẩu (tùy chọn)

8. **PasswordModal.jsx**: Modal nhập password
   - Input: Mật khẩu để join phòng bảo mật

9. **WaitingRoom.jsx**: Phòng chờ trước khi bắt đầu
   - Nút "Sẵn Sàng" (ready_to_play) + hiển thị người chơi

#### 4.2. Quy Ước State Management

**Cách quản lý state** (file `frontend/src/page/GameOnline.jsx`):

- **Local State** (useState): `gameState`, `rooms`, `messages`
- **State Structure**:
  ```javascript
  const [gameState, setGameState] = useState({
    roomId: "",
    playerSymbol: "X" | "O",
    board: 2D array 20x20,
    currentPlayer: "X" | "O",
    gameStatus: "waiting" | "playing" | "finished",
    winner: "X" | "O" | null,
    isConnected: true | false,
    players: [ {name, symbol, user_id}, ... ]
  });
  ```

- **useRef**: `socketRef` để giữ socket connection không bị tạo lại khi re-render

#### 4.3. Tích Hợp Real-time

**Khởi tạo Socket** (file `frontend/src/page/GameOnline.jsx`):
```javascript
const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  timeout: 20000,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("✅ Connected to server");
  setGameState((prev) => ({ ...prev, isConnected: true }));
  socket.emit("get_rooms");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
  setGameState((prev) => ({ ...prev, isConnected: false }));
});
```

**Các Socket Event lắng nghe**:

- `rooms_list_update` → Cập nhật danh sách phòng
- `room_created_success` → Tạo phòng thành công, set playerSymbol
- `join_success` → Join phòng thành công
- `player_joined` → Cập nhật danh sách người chơi trong phòng
- `game_started` → Game bắt đầu, nhận board rỗng
- `move_made` → Nhận nước đi của đối thủ, cập nhật board
- `game_over` → Game kết thúc, hiển thị modal kết quả
- `move_timeout` → Timeout, người chơi kia thắng
- `surrender_result` → Kết quả đầu hàng

**Cập nhật UI khi nhận move_made**:
```javascript
socket.on("move_made", (data) => {
  setGameState((prev) => ({
    ...prev,
    board: data.board,          // Cập nhật toàn bộ board
    currentPlayer: data.current_player  // Đổi lượt chơi
  }));
});
```

**Lưu ý**: Không dùng optimistic UI - phải dựa vào server để tránh sync issue.

#### 4.4. Countdown Timer 30 Giây

**Logic timer** (file `frontend/src/components/GameBoard.jsx`):
```javascript
useEffect(() => {
  if (gameStatus === "playing" && currentPlayer === playerSymbol) {
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }
}, [gameStatus, currentPlayer, playerSymbol]);
```

- **Client-side timer**: Frontend hiển thị countdown cho UI
- **Server-side validation**: Backend tự detect timeout sau 30s → gửi `move_timeout`
- **Phối hợp**: Frontend hiển thị thời gian còn lại, backend xác nhận timeout chính thức

#### 4.5. Xử Lý Reconnect & Connection Loss

**Hiện tại**: Khi mất kết nối:
1. Frontend nhận event `disconnect`
2. Hiển thị trạng thái "Mất kết nối với server"
3. Khi reconnect:
   - Frontend sẽ tự động reconnect (Socket.IO có built-in reconnect logic)
   - Lấy lại danh sách phòng bằng `get_rooms`

**Cải tiến tương lai** (nếu cần):
- Thêm `rejoin_room` event để lấy trạng thái game hiện tại
- Lưu `roomId` ở localStorage → rejoin tự động khi reconnect
- Hiển thị modal "Đang kết nối lại..."

#### 4.6. Lưu Match Result

**Quy trình** (file `frontend/src/page/GameOnline.jsx`):
```javascript
const saveMatchResult = async (winnerName) => {
  const response = await fetch(`${BACKEND_URL}/api/match/save_result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      winner_user_id: winner.user_id,
      loser_user_id: loser.user_id,
      elo_change_winner: 50,
      elo_change_loser: -50,
      final_board_state: gameState.board,
      match_duration: 300
    }),
  });
  
  const data = await response.json();
  if (data.success) {
    console.log("✅ Match saved");
  }
};

socket.on("game_over", (data) => {
  setGameState((prev) => ({
    ...prev,
    gameStatus: "finished",
    winner: data.winner
  }));
  
  // Gọi API lưu kết quả
  saveMatchResult(data.winner);
});
```

- **Khi nào gọi**: Sau event `game_over` hoặc `move_timeout` hoặc `surrender_result`
- **Dữ liệu gửi**: Winner/loser ID, Elo change, board final state, duration
- **Backend xử lý**: `POST /api/match/save_result` → lưu MatchHistory + update Profiles

---

### 5. Các Thao tác Dữ liệu Quan Trọng (CRUD Operations)

#### 5.1. Lưu Lịch Sử Nước Đi

**Sau khi kết thúc trận** (file `backend/utils/match_service.py`):

```python
import json
from supabase_service import supabase

def save_match_result(room, end_reason="normal"):
    """
    Lưu kết quả match vào database
    
    Args:
        room: GameRoom object với thông tin người chơi, board, move_history
        end_reason: "normal" | "timeout" | "disconnect"
    """
    try:
        # 1. Lấy thông tin người chơi
        player_x = room.players[0]  # {'user_id': ..., 'name': ...}
        player_o = room.players[1]
        winner = player_x if room.winner == 0 else player_o
        loser = player_o if room.winner == 0 else player_x
        
        # 2. Tạo dữ liệu match
        moves_json = json.dumps(room.move_history)  # Lịch sử nước đi
        
        # Match record cho người thắng
        winner_match = {
            "profile_id": winner["user_id"],
            "opponent_username": loser["name"],
            "result": "win",  # DB constraint yêu cầu
            "elo_change": 50,
            "end_reason": end_reason,
            "match_date": datetime.now().isoformat(),
            "final_board_state": json.dumps(room.board),
            "moves_history": moves_json
        }
        
        # Match record cho người thua
        loser_match = {
            "profile_id": loser["user_id"],
            "opponent_username": winner["name"],
            "result": "win",  # DB constraint yêu cầu
            "elo_change": -50,
            "end_reason": end_reason,
            "match_date": datetime.now().isoformat(),
            "final_board_state": json.dumps(room.board),
            "moves_history": moves_json
        }
        
        # 3. Lưu vào MatchHistory table (2 records - 1 cho mỗi người)
        supabase.table("match_history").insert(winner_match).execute()
        supabase.table("match_history").insert(loser_match).execute()
        
        # 4. Cập nhật Profiles (Elo + Win/Loss count)
        update_player_elo(winner["user_id"], elo_change=50, is_win=True)
        update_player_elo(loser["user_id"], elo_change=-50, is_win=False)
        
        print(f"✅ Match saved: {winner['name']} vs {loser['name']}")
        return {"success": True, "message": "Match saved"}
        
    except Exception as e:
        print(f"❌ Error saving match: {str(e)}")
        # Log error để debugging
        return {"success": False, "error": str(e)}
```

**Cấu trúc move_history**:
```python
# room.move_history = [
#   {"row": 10, "col": 10, "player": "X", "timestamp": ...},
#   {"row": 10, "col": 11, "player": "O", "timestamp": ...},
#   ...
# ]

# JSON lưu vào DB:
# [
#   {"row": 10, "col": 10, "player": "X", "timestamp": "2025-11-26T10:30:45"},
#   {"row": 10, "col": 11, "player": "O", "timestamp": "2025-11-26T10:30:50"},
# ]
```

#### 5.2. Cập Nhật ELO

**Hàm cập nhật ELO** (file `backend/utils/match_service.py`):

```python
def update_player_elo(user_id, elo_change, is_win):
    """
    Cập nhật Elo và thống kê của người chơi
    
    Args:
        user_id: ID người chơi
        elo_change: Thay đổi Elo (+50 cho thắng, -50 cho thua)
        is_win: True nếu thắng, False nếu thua
    """
    try:
        # Lấy profile hiện tại
        profile = supabase.table("profiles") \
            .select("*") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        current_profile = profile.data
        
        # Tính toán giá trị mới
        new_elo = current_profile["elo_score"] + elo_change
        new_wins = current_profile["total_wins"] + (1 if is_win else 0)
        new_losses = current_profile["total_losses"] + (0 if is_win else 1)
        
        # Cập nhật profile
        update_data = {
            "elo_score": new_elo,
            "total_wins": new_wins,
            "total_losses": new_losses
        }
        
        supabase.table("profiles") \
            .update(update_data) \
            .eq("user_id", user_id) \
            .execute()
        
        print(f"✅ Updated ELO for user {user_id}: {current_profile['elo_score']} → {new_elo}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating ELO: {str(e)}")
        return False
```

**Phương án tối ưu - Dùng Transaction** (đảm bảo atomic):

```python
from supabase import create_client
import psycopg2

def save_match_result_atomic(room, end_reason="normal"):
    """
    Lưu match result với transaction - đảm bảo tính nguyên tử
    Nếu có lỗi, tất cả thay đổi đều rollback
    """
    try:
        # 1. Chuẩn bị dữ liệu
        player_x = room.players[0]
        player_o = room.players[1]
        winner = player_x if room.winner == 0 else player_o
        loser = player_o if room.winner == 0 else player_x
        
        # 2. Gọi RPC function từ Supabase (SQL trigger)
        # Hoặc dùng cursor nếu kết nối trực tiếp DB
        
        result = supabase.rpc(
            "save_match_and_update_elo",
            {
                "p_winner_id": winner["user_id"],
                "p_loser_id": loser["user_id"],
                "p_winner_name": winner["name"],
                "p_loser_name": loser["name"],
                "p_end_reason": end_reason,
                "p_board_state": json.dumps(room.board),
                "p_moves_history": json.dumps(room.move_history),
                "p_elo_change": 50
            }
        ).execute()
        
        print(f"✅ Match saved atomically")
        return {"success": True}
        
    except Exception as e:
        print(f"❌ Transaction failed: {str(e)}")
        return {"success": False, "error": str(e)}
```

**SQL RPC Function** (tạo trong Supabase):
```sql
CREATE OR REPLACE FUNCTION save_match_and_update_elo(
    p_winner_id UUID,
    p_loser_id UUID,
    p_winner_name VARCHAR,
    p_loser_name VARCHAR,
    p_end_reason VARCHAR,
    p_board_state JSONB,
    p_moves_history JSONB,
    p_elo_change INTEGER
) RETURNS TABLE (success BOOLEAN, message VARCHAR) AS $$
BEGIN
    -- Transaction start
    BEGIN
        -- 1. Insert winner record
        INSERT INTO match_history (profile_id, opponent_username, result, elo_change, end_reason, match_date, final_board_state, moves_history)
        VALUES (p_winner_id, p_loser_name, 'win', p_elo_change, p_end_reason, NOW(), p_board_state, p_moves_history);
        
        -- 2. Insert loser record
        INSERT INTO match_history (profile_id, opponent_username, result, elo_change, end_reason, match_date, final_board_state, moves_history)
        VALUES (p_loser_id, p_winner_name, 'win', -p_elo_change, p_end_reason, NOW(), p_board_state, p_moves_history);
        
        -- 3. Update winner ELO
        UPDATE profiles 
        SET elo_score = elo_score + p_elo_change,
            total_wins = total_wins + 1
        WHERE user_id = p_winner_id;
        
        -- 4. Update loser ELO
        UPDATE profiles 
        SET elo_score = elo_score - p_elo_change,
            total_losses = total_losses + 1
        WHERE user_id = p_loser_id;
        
        RETURN QUERY SELECT true, 'Match saved successfully'::VARCHAR;
        
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RETURN QUERY SELECT false, SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;
```

#### 5.3. Truy Vấn Lịch Sử Người Dùng

**Backend API** (file `backend/routes/match_routes.py`):

```python
from flask import Blueprint, request, jsonify
from utils.match_service import get_user_match_history

match_bp = Blueprint('match', __name__, url_prefix='/api/match')

@match_bp.route('/history', methods=['GET'])
def get_history():
    """
    GET /api/match/history?userId=<uuid>&limit=50&offset=0&sort=desc
    """
    try:
        user_id = request.args.get('userId')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        sort = request.args.get('sort', 'desc')  # asc|desc
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
        
        # Gọi service để lấy dữ liệu
        matches = get_user_match_history(user_id, limit, offset, sort)
        
        return jsonify({
            "success": True,
            "matches": matches,
            "total": len(matches),
            "limit": limit,
            "offset": offset
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@match_bp.route('/save_result', methods=['POST'])
def save_match():
    """
    POST /api/match/save_result
    Body: {
        winner_user_id, loser_user_id, 
        elo_change_winner, elo_change_loser,
        final_board_state, match_duration,
        end_reason
    }
    """
    try:
        data = request.get_json()
        
        # Validate dữ liệu
        required_fields = ['winner_user_id', 'loser_user_id']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        result = save_match_from_api(data)
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Service function** (file `backend/utils/match_service.py`):

```python
from supabase_service import supabase

def get_user_match_history(user_id, limit=50, offset=0, sort='desc'):
    """
    Truy vấn lịch sử trận đấu của người dùng
    
    SQL equivalent:
    SELECT * FROM match_history 
    WHERE profile_id = user_id 
    ORDER BY match_date DESC/ASC 
    LIMIT limit OFFSET offset
    """
    try:
        # Sắp xếp: 'desc' → DESC (trận mới nhất trước)
        order = "match_date.desc" if sort == "desc" else "match_date.asc"
        
        response = supabase.table("match_history") \
            .select("*") \
            .eq("profile_id", user_id) \
            .order(order) \
            .range(offset, offset + limit - 1) \
            .execute()
        
        matches = []
        for record in response.data:
            matches.append({
                "match_id": record["match_history_id"],
                "opponent": record["opponent_username"],
                "result": record["result"],
                "elo_change": record["elo_change"],
                "end_reason": record["end_reason"],
                "date": record["match_date"],
                "board_state": record["final_board_state"]
            })
        
        return matches
        
    except Exception as e:
        print(f"❌ Error fetching match history: {str(e)}")
        return []

def save_match_from_api(data):
    """
    Lưu kết quả match từ API call (Frontend gọi)
    """
    try:
        winner_id = data.get('winner_user_id')
        loser_id = data.get('loser_user_id')
        elo_change_winner = data.get('elo_change_winner', 50)
        board_state = data.get('final_board_state')
        duration = data.get('match_duration', 0)
        reason = data.get('end_reason', 'normal')
        
        # Lấy tên người chơi
        winner_profile = supabase.table("profiles").select("username").eq("user_id", winner_id).single().execute().data
        loser_profile = supabase.table("profiles").select("username").eq("user_id", loser_id).single().execute().data
        
        # Lưu match records
        winner_match = {
            "profile_id": winner_id,
            "opponent_username": loser_profile["username"],
            "result": "win",
            "elo_change": elo_change_winner,
            "end_reason": reason,
            "match_date": datetime.now().isoformat(),
            "final_board_state": json.dumps(board_state)
        }
        
        loser_match = {
            "profile_id": loser_id,
            "opponent_username": winner_profile["username"],
            "result": "win",
            "elo_change": -elo_change_winner,
            "end_reason": reason,
            "match_date": datetime.now().isoformat(),
            "final_board_state": json.dumps(board_state)
        }
        
        supabase.table("match_history").insert(winner_match).execute()
        supabase.table("match_history").insert(loser_match).execute()
        
        # Update ELO
        update_player_elo(winner_id, elo_change_winner, is_win=True)
        update_player_elo(loser_id, -elo_change_winner, is_win=False)
        
        return {"success": True, "message": "Match saved successfully"}
        
    except Exception as e:
        print(f"❌ Error saving match: {str(e)}")
        return {"success": False, "error": str(e)}
```

##