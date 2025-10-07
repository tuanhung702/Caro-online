from flask_socketio import SocketIO, join_room, leave_room, emit
from datetime import datetime
import json

# Khởi tạo SocketIO (cần được gọi từ app.py hoặc init_socket.py của bạn)
# Ví dụ: socketio = SocketIO(app, cors_allowed_origins="*")

def register_chat_events(socketio: SocketIO):
    """
    Đăng ký các sự kiện (event handlers) cho chức năng chat.
    """

    @socketio.on('join_game_room')
    def handle_join_room(data):
        """
        Xử lý khi người chơi tham gia phòng game.
        Người chơi cần tham gia một "room" (phòng) để nhận tin nhắn.
        """
        room_id = data.get('room_id')
        user_name = data.get('user_name', 'Anonymous')
        
        if room_id:
            join_room(room_id)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] User {user_name} joined room: {room_id}")
            # Thông báo cho tất cả mọi người trong phòng (trừ người vừa join)
            emit('system_message', 
                 {'message': f'{user_name} đã tham gia trận đấu.'}, 
                 room=room_id, skip_sid=True)

    @socketio.on('leave_game_room')
    def handle_leave_room(data):
        """
        Xử lý khi người chơi rời phòng game.
        """
        room_id = data.get('room_id')
        user_name = data.get('user_name', 'Anonymous')
        
        if room_id:
            leave_room(room_id)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] User {user_name} left room: {room_id}")
            # Thông báo cho tất cả mọi người còn lại trong phòng
            emit('system_message', 
                 {'message': f'{user_name} đã rời trận đấu.'}, 
                 room=room_id)


    @socketio.on('send_chat_message')
    def handle_chat_message(data):
        """
        Xử lý khi người chơi gửi tin nhắn chat.
        """
        # 1. Lấy dữ liệu
        room_id = data.get('room_id')
        user_name = data.get('user_name')
        message_content = data.get('message')
        
        if not room_id or not user_name or not message_content:
            print(f"Error: Missing data for chat message: {data}")
            return # Bỏ qua nếu thiếu thông tin quan trọng

        # 2. Xây dựng gói tin hoàn chỉnh
        chat_message = {
            'room_id': room_id,
            'user_name': user_name,
            'message': message_content,
            'timestamp': datetime.now().isoformat()
        }

        # 3. Phát tin nhắn tới tất cả người chơi trong phòng (room)
        # Tên sự kiện: 'receive_chat_message'
        # Dữ liệu: chat_message
        # Phòng: room_id
        emit('receive_chat_message', chat_message, room=room_id)
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Chat in Room {room_id} from {user_name}: {message_content}")

# Lưu ý: Cần import hàm register_chat_events này vào file `app.py` hoặc 
# file `sockets/_init_.py` của bạn và gọi nó với đối tượng `socketio` đã khởi tạo.