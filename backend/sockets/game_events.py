from flask import request
from flask_socketio import emit
from states.room_manager import room_manager 
from socketio_instance import socketio
# ⚠️ Import hàm parse_data từ room_events để xử lý JSON string
from .room_events import parse_data 
# -------------------------------------------------------------------------

@socketio.on('make_move')
def handle_make_move(data):
    # 1. Parse data để đảm bảo nó là dictionary
    data = parse_data(data)
    if data is None:
        emit('error', {'message': 'Dữ liệu gửi lên không phải là JSON hợp lệ.'}, room=request.sid)
        return
        
    room_id = data.get('room_id')
    row = data.get('row')
    col = data.get('col')
    
    # Debug log (Nên thêm vào để tiện theo dõi)
    print(f"DEBUG: Nhận make_move từ client {request.sid} Room: {room_id}, ({row}, {col})")

    room = room_manager.get_room(room_id)
    
    if not room:
        emit('error', {'message': 'Phòng không tồn tại'}, room=request.sid)
        return

    # room.make_move cần được định nghĩa để trả về True/False (success)
    success = room.make_move(row, col, request.sid)

    if success:
        # Gửi thông báo nước đi
        socketio.emit('move_made', {
            'row': row,
            'col': col,
            'player': room.board[row][col], 
            'current_player': room.current_player,
            'board': room.board # Rất quan trọng để client vẽ lại bàn cờ
        }, room=room_id)
        
        # Logic Game Over
        if room.game_status == 'finished':
             socketio.emit('game_over', {
                'winner': room.winner,
                'message': f"Người chơi {room.winner} đã thắng!"
             }, room=room_id)
             # Cập nhật danh sách phòng công khai (Trạng thái chuyển sang 'finished')
             socketio.emit('rooms_list_update', room_manager.get_available_rooms())

    else:
        # Có thể thêm logic trả về thông báo lỗi cụ thể từ room.make_move
        emit('error', {'message': 'Nước đi không hợp lệ'}, room=request.sid)

@socketio.on('reset_game')
def handle_reset_game(data):
    # 1. Parse data để đảm bảo nó là dictionary
    data = parse_data(data)
    if data is None:
        emit('error', {'message': 'Dữ liệu gửi lên không phải là JSON hợp lệ.'}, room=request.sid)
        return
        
    room_id = data.get('room_id')

    room = room_manager.get_room(room_id)
    
    if not room:
        emit('error', {'message': 'Phòng không tồn tại'}, room=request.sid)
        return

    room.reset_game()
    print(f"DEBUG: Reset game thành công cho phòng {room_id}.")

    socketio.emit('game_reset', {
        'board': room.board,
        'current_player': room.current_player
    }, room=room_id)
    
    # Cập nhật danh sách phòng công khai (Trạng thái chuyển từ 'finished' sang 'playing'/'available')
    socketio.emit('rooms_list_update', room_manager.get_available_rooms())
