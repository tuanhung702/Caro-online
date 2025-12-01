# routes/room_routes.py

from flask import Blueprint, jsonify
from states.room_manager import room_manager 

room_bp = Blueprint('rooms', __name__)

@room_bp.route('/rooms', methods=['GET'])
def list_rooms():
    """
    Endpoint HTTP để trả về danh sách các phòng đang chờ hoặc đã kết thúc.
    """

    rooms_list_public = room_manager.get_available_rooms()
    
    return jsonify({
        'status': 'success',
        'rooms': rooms_list_public
    })
    
