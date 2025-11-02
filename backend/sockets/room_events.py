from flask import request
from flask_socketio import emit, join_room, leave_room
import json 
from states.room_manager import room_manager 
from socketio_instance import socketio
# -------------------------------------------------------------------------

def parse_data(data):
    """Hàm phụ để đảm bảo data là dictionary, xử lý lỗi Postman gửi string."""
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return None
    return data

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect(sid=None):
    print(f'Client disconnected: {request.sid}')
    
    client_sid = request.sid
    
    for room_id, room in list(room_manager.rooms.items()): 
        if any(p['id'] == client_sid for p in room.players):
            room.remove_player(client_sid)
            leave_room(room_id)
            
            if len(room.players) == 0:
                del room_manager.rooms[room_id]
                print(f"DEBUG: Room {room_id} deleted.")
            
            socketio.emit('rooms_list_update', room_manager.get_available_rooms())
            
            if len(room.players) > 0:
                socketio.emit('player_left', {'message': 'Đối thủ đã rời khỏi phòng'}, room=room_id)
            
# --- TẠO PHÒNG MỚI (CHỈ NHẬN DATA) ---
# Đây là cách an toàn nhất để tránh lỗi TypeError từ sid
@socketio.on('create_room_request')
def handle_create_room(data): 
    
    sid = request.sid # Lấy sid từ context, không phải từ tham số hàm
    
    # Dòng debug này sẽ xuất hiện khi lỗi được sửa
    print(f"DEBUG: Nhận create_room_request từ client {sid} với data: {data}")
    
    data = parse_data(data)
    if data is None:
        emit('error', {'message': 'Dữ liệu gửi lên không phải là JSON hợp lệ.'}, room=sid)
        return
    
    name = data.get('name', 'Phòng Mới')
    password = data.get('password') 
    player_name = data.get('player_name', 'Player')

    try:
        new_room = room_manager.create_room(name, password)
        print(f"DEBUG: Room created with ID: {new_room.room_id}")
        
        room, message = room_manager.join_room(new_room.room_id, sid, player_name, password)

        if room:
            join_room(room.room_id)
            player_symbol = next(p['symbol'] for p in room.players if p['id'] == sid)

            emit('room_created_success', {
                'room_id': room.room_id,
                'room': room.to_public_dict(),
                'player_symbol': player_symbol
            })
            print(f"DEBUG: Successfully emitted room_created_success for room {room.room_id}.")
            
            socketio.emit('rooms_list_update', room_manager.get_available_rooms()) 
        else:
            print(f"ERROR: Join failed during creation: {message}")
            emit('error', {'message': f"Lỗi tạo phòng: {message}"}, room=sid)
            
    except Exception as e:
        print(f"FATAL ERROR during room creation: {e}") 
        emit('error', {'message': f"Lỗi máy chủ khi tạo phòng: {e}"}, room=sid)
        
# --- THAM GIA PHÒNG (CHỈ NHẬN DATA) ---
# Đây là cách an toàn nhất để tránh lỗi TypeError từ sid
@socketio.on('join_room_request') 
def handle_join_room(data): 
    
    sid = request.sid # Lấy sid từ context
    
    # Dòng debug này sẽ xuất hiện khi lỗi được sửa
    print(f"DEBUG: Nhận join_room_request từ client {sid} với data: {data}")

    data = parse_data(data)
    if data is None:
        emit('join_fail', {'message': 'Dữ liệu gửi lên không phải là JSON hợp lệ.'}, room=sid)
        return

    room_id = data.get('room_id')
    player_name = data.get('player_name', 'Player')
    password = data.get('password')

    room, message = room_manager.join_room(room_id, sid, player_name, password)

    if room:
        join_room(room_id)
        player_symbol = next(p['symbol'] for p in room.players if p['id'] == sid)
        
        emit('join_success', {
            'room_id': room_id,
            'player_symbol': player_symbol,
            'players': room.players
        })
        print(f"DEBUG: Client {sid} joined room {room_id} successfully.")
        
        socketio.emit('player_joined', {'players': room.players}, room=room_id)
        
        if len(room.players) == 2:
            room.start_game()
            socketio.emit('game_started', {
                'current_player': room.current_player,
                'board': room.board,
                'players': room.players
            }, room=room_id)
            socketio.emit('rooms_list_update', room_manager.get_available_rooms())
            
    else:
        print(f"DEBUG: Client {sid} join fail. Message: {message}")
        emit('join_fail', {'message': message}, room=sid)
