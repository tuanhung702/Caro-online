from flask import Flask
from socketio_instance import socketio

# Import các sự kiện
import sockets.game_events
import sockets.chat_events

app = Flask(__name__)
app.config['SECRET_KEY'] = 'caro_secret_key'
socketio.init_app(app)

@app.route('/')
def index():
    return "Caro Online Backend is running!"

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)