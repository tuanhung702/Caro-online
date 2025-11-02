# states/room_manager.py

import uuid
# ⚠️ Import lớp GameRoom từ models
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

    def get_available_rooms(self):
        """Lấy danh sách các phòng đang 'waiting' để hiển thị cho client."""
        return [room.to_public_dict() 
                for room in self.rooms.values() 
                if room.game_status == 'waiting' or room.game_status == 'finished']

    def join_room(self, room_id, user_id, user_name, password=None):
        room = self.get_room(room_id)
        if not room:
            return None, "Phòng không tồn tại."
        
        # Kiểm tra mật khẩu
        if room.password and room.password != password:
            return None, "Mật khẩu không chính xác."

        if len(room.players) >= 2 and not any(p['id'] == user_id for p in room.players):
            return None, "Phòng đã đầy."
            
        if not any(p['id'] == user_id for p in room.players):
             room.add_player(user_id, user_name)
        
        # Logic bắt đầu game sẽ được xử lý trong Socket Events sau khi join thành công
        return room, "Tham gia phòng thành công."

# Khởi tạo instance duy nhất (Singleton)
room_manager = RoomManager()