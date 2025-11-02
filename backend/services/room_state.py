# services/room_state.py

# Import lớp GameRoom
from models.gameroom import GameRoom 

# Dictionary chứa tất cả các phòng (Shared State)
rooms = {} 

# Bạn cũng có thể thêm hàm get_available_rooms ở đây nếu muốn