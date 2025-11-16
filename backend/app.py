from flask import Flask
from socketio_instance import socketio

from routes.room_routes import room_bp
from routes.auth_routes import auth_bp  # Auth routes
from routes.match_routes import match_bp  # Match history routes

import sockets.room_events
import sockets.game_events
import sockets.chat_events

from flask_cors import CORS  # Thêm CORS để React frontend gọi được

app = Flask(__name__)
app.config['SECRET_KEY'] = 'caro_secret_key'

CORS(app)  # ✅ Cho phép frontend gọi API
socketio.init_app(app)

# 🟢 Đăng ký blueprint
app.register_blueprint(room_bp, url_prefix='/api')
app.register_blueprint(auth_bp)  # Không cần url_prefix ở đây
app.register_blueprint(match_bp)  # Match history routes

@app.route('/')
def index():
    return "Caro Online Backend is running!"

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
