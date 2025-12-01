from flask_socketio import emit
from socketio_instance import socketio

@socketio.on('chat_message')
def handle_chat(data):
    room_id = data.get('room_id')
    message = {
        'player': data.get('player'),
        'text': data.get('text')
    }
    socketio.emit('chat_message', message, room=room_id)
