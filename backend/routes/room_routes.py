# routes/room_routes.py

from flask import Blueprint, jsonify
# ⚠️ Import instance room_manager từ states
from states.room_manager import room_manager 

room_bp = Blueprint('rooms', __name__)

@room_bp.route('/rooms', methods=['GET'])
def list_rooms():
    """
    Endpoint HTTP để trả về danh sách các phòng đang chờ hoặc đã kết thúc.
    """
    # Gọi phương thức từ RoomManager
    rooms_list_public = room_manager.get_available_rooms()
    
    return jsonify({
        'status': 'success',
        'rooms': rooms_list_public
    })
    
# Tùy chọn: Thêm endpoint POST nếu bạn muốn tạo phòng bằng HTTP
# @room_bp.route('/rooms', methods=['POST'])
# def create_room_http():
#     # ... logic tạo phòng
#     pass