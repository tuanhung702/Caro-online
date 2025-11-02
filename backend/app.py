# app.py

from flask import Flask
# Import instance socketio từ file riêng
from socketio_instance import socketio 

# --- 1. IMPORT VÀ ĐĂNG KÝ HTTP ROUTES ---
# Import Blueprint từ routes/room_routes.py
from routes.room_routes import room_bp 

# --- 2. IMPORT SOCKET EVENTS ---
# Import các file Socket Events để đăng ký các hàm @socketio.on
import sockets.room_events 
import sockets.game_events
import sockets.chat_events


app = Flask(__name__)
app.config['SECRET_KEY'] = 'caro_secret_key'
socketio.init_app(app)

# ⚠️ ĐĂNG KÝ HTTP BLUEPRINT (quan trọng cho API danh sách phòng)
app.register_blueprint(room_bp, url_prefix='/api')


@app.route('/')
def index():
    return "Caro Online Backend is running!"

if __name__ == '__main__':
    # Lưu ý: Khi chạy app.py, các file import room_manager và GameRoom 
    # (như room_routes.py và các socket events) sẽ được load,
    # đảm bảo room_manager được khởi tạo trước khi server chạy.
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)