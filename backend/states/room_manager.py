import uuid
from models.gameroom import GameRoom

class RoomManager:
    def __init__(self):
        self.rooms = {}  # {room_id: GameRoom object}

    def create_room(self, name, password=None):
        room_id = str(uuid.uuid4())[:8]
        new_room = GameRoom(room_id, name, password=password)
        self.rooms[room_id] = new_room
        return new_room

    def get_room(self, room_id):
        return self.rooms.get(room_id)

    def join_room(self, room_id, user_id, user_name, password=None):
        room = self.get_room(room_id)
        if not room:
            return None, "Phòng không tồn tại."

        # Kiểm tra mật khẩu
        if room.password and room.password != password:
            return None, "Mật khẩu không chính xác."

        # Kiểm tra trùng user
        if not any(p['id'] == user_id for p in room.players):
            room.add_player(user_id, user_name)

        return room, "Tham gia phòng thành công."

    def get_all_rooms(self):
        """
        Trả về tất cả phòng với thông tin cơ bản: mã phòng, tên, số người và trạng thái.
        Không lọc 'waiting' hay 'finished'.
        """
        rooms_info = []
        for room in self.rooms.values():
            rooms_info.append({
                "room_id": room.room_id,
                "name": room.name,
                "player_count": len(room.players),
                "status": room.game_status  # 'waiting', 'playing', 'finished'
            })
        return rooms_info

    def get_available_rooms(self):
        """
        Trả về danh sách các phòng đang chờ hoặc đang chơi (có thể tham gia).
        Lọc bỏ các phòng đã kết thúc.
        """
        rooms_info = []
        for room in self.rooms.values():
            if room.game_status in ['waiting', 'playing']:
                rooms_info.append(room.to_public_dict())
        return rooms_info

    def cleanup_empty_rooms(self, socketio_instance=None):
        """
        Tự động xóa các phòng không còn người chơi nào.
        Được gọi sau mỗi lần remove player để đảm bảo không có room trống.
        
        Args:
            socketio_instance: Instance của SocketIO để emit event cập nhật danh sách.
        
        Returns:
            list: Danh sách các room_id đã bị xóa
        """
        deleted_rooms = []
        rooms_to_delete = []
        
        # Tìm các room trống
        for room_id, room in self.rooms.items():
            if len(room.players) == 0:
                rooms_to_delete.append(room_id)
        
        # Xóa các room trống
        for room_id in rooms_to_delete:
            del self.rooms[room_id]
            deleted_rooms.append(room_id)
            print(f"DEBUG: Room {room_id} đã được xóa vì không còn người chơi.")
        
        # Cập nhật danh sách phòng nếu có room bị xóa
        if deleted_rooms and socketio_instance:
            self.update_rooms_list(socketio_instance)
        
        return deleted_rooms

    def update_rooms_list(self, socketio_instance=None):
        """
        Phương thức cập nhật danh sách phòng và broadcast đến tất cả clients.
        Được gọi mỗi khi có thay đổi về players (thêm/xóa player) hoặc trạng thái phòng.
        
        Args:
            socketio_instance: Instance của SocketIO để emit event. 
                              Nếu None, chỉ trả về danh sách mà không broadcast.
        
        Returns:
            list: Danh sách các phòng available
        """
        available_rooms = self.get_available_rooms()
        
        if socketio_instance:
            # Broadcast cập nhật danh sách phòng đến tất cả clients
            socketio_instance.emit('rooms_list_update', available_rooms)
            print(f"DEBUG: Broadcasted rooms_list_update với {len(available_rooms)} phòng")
        
        return available_rooms


# Singleton
room_manager = RoomManager()
