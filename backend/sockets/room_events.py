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
            # Lấy người còn lại TRƯỚC KHI remove
            remaining_player = [p for p in room.players if p['id'] != client_sid]
            
            # Nếu đang trong phòng chờ (waiting) hoặc đang chơi (playing), người thoát sẽ thua
            if len(room.players) == 2 and remaining_player:
                remaining = remaining_player[0]
                disconnected = next((p for p in room.players if p['id'] == client_sid), None)
                room.game_status = 'finished'
                room.winner = remaining['symbol']
                room.stop_move_timer()
                
                # 💾 Lưu kết quả match khi người chơi thoát (chỉ khi đang playing)
                if room.game_status == 'playing' and remaining.get('user_id') and disconnected and disconnected.get('user_id'):
                    from utils.match_service import save_match_result
                    match_result = save_match_result(
                        winner_user_id=remaining['user_id'],
                        loser_user_id=disconnected['user_id'],
                        elo_change_winner=50,
                        elo_change_loser=-50,
                        final_board_state=room.board,
                        match_duration=None,
                        end_reason="disconnect"
                    )
                    print(f"✅ Disconnect match saved: {match_result}")
                
                socketio.emit('opponent_left', {
                    'winner': remaining['symbol'],
                    'winner_name': remaining['name'],
                    'message': f'Bạn thắng! Đối thủ đã rời khỏi phòng.'
                }, room=room_id)
                
                # Reset về waiting state (nhưng người thoát không còn trong room nữa)
                # Room sẽ tự động xóa nếu không còn ai
            
            # Xóa player và reset ready state
            room.remove_player(client_sid)
            room.ready_players.discard(client_sid)
            leave_room(room_id)
            
            # Thông báo cho các player còn lại trong phòng
            if len(room.players) > 0:
                socketio.emit('player_left', {
                    'message': 'Đối thủ đã rời khỏi phòng',
                    'players': room.players  # Gửi danh sách players còn lại
                }, room=room_id)
            
            # Tự động xóa các room trống (không còn người chơi)
            # Phương thức này sẽ tự động cập nhật danh sách phòng
            room_manager.cleanup_empty_rooms(socketio)
            
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
    # Xử lý password: nếu là empty string hoặc None thì set về None
    if password == '' or password is None:
        password = None
    player_name = data.get('player_name', 'Player')
    user_id = data.get('user_id')  # Lấy user_id từ database

    try:
        print(f"DEBUG: Creating room with name={name}, password={password}, player_name={player_name}, user_id={user_id}")
        new_room = room_manager.create_room(name, password)
        print(f"DEBUG: Room created with ID: {new_room.room_id}")
        
        room, message = room_manager.join_room(new_room.room_id, sid, player_name, password, user_id)
        print(f"DEBUG: Join room result: room={room is not None}, message={message}")

        if room:
            join_room(room.room_id)
            player_symbol = next(p['symbol'] for p in room.players if p['id'] == sid)

            emit('room_created_success', {
                'room_id': room.room_id,
                'room': room.to_public_dict(),
                'player_symbol': player_symbol,
                'players': room.players  # Thêm players để frontend hiển thị
            })
            print(f"DEBUG: Successfully emitted room_created_success for room {room.room_id}.")
            
            # Cập nhật danh sách phòng khi tạo phòng mới
            room_manager.update_rooms_list(socketio) 
        else:
            print(f"ERROR: Join failed during creation: {message}")
            emit('error', {'message': f"Lỗi tạo phòng: {message}"}, room=sid)
            
    except Exception as e:
        import traceback
        print(f"FATAL ERROR during room creation: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        emit('error', {'message': f"Lỗi máy chủ khi tạo phòng: {str(e)}"}, room=sid)
        
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
    user_id = data.get('user_id')  # Lấy user_id từ database
    # Xử lý password: nếu là empty string thì set về None
    if password == '':
        password = None

    room, message = room_manager.join_room(room_id, sid, player_name, password, user_id)

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
        
        # Cập nhật danh sách phòng khi có player join
        room_manager.update_rooms_list(socketio)
        
        # Không cần timer trong phòng chờ nữa, chỉ cần ready state
            
    else:
        print(f"DEBUG: Client {sid} join fail. Message: {message}")
        emit('join_fail', {'message': message}, room=sid)

@socketio.on('ready_to_play')
def handle_ready_to_play(data):
    """Xử lý khi player ấn nút 'Sẵn sàng'."""
    sid = request.sid
    data = parse_data(data)
    if data is None:
        emit('error', {'message': 'Dữ liệu gửi lên không phải là JSON hợp lệ.'}, room=sid)
        return
    
    room_id = data.get('room_id')
    room = room_manager.get_room(room_id)
    
    if not room:
        emit('error', {'message': 'Phòng không tồn tại'}, room=sid)
        return
    
    # Đánh dấu player ready
    if room.set_player_ready(sid):
        # Broadcast trạng thái ready
        socketio.emit('player_ready', {
            'player_id': sid,
            'players': room.players
        }, room=room_id)
        
        # Kiểm tra nếu cả 2 đều ready
        if room.check_all_ready():
            # Setup callback cho timer lượt đi
            def move_timeout_callback(winner_symbol, loser_symbol):
                winner = next((p for p in room.players if p['symbol'] == winner_symbol), None)
                loser = next((p for p in room.players if p['symbol'] == loser_symbol), None)
                socketio.emit('move_timeout', {
                    'winner': winner_symbol,
                    'winner_name': winner['name'] if winner else winner_symbol,
                    'loser': loser_symbol,
                    'loser_name': loser['name'] if loser else loser_symbol,
                    'message': f'Người chơi {winner["name"] if winner else winner_symbol} thắng! Đối thủ đã hết thời gian.'
                }, room=room_id)
                room_manager.update_rooms_list(socketio)
            
            room.move_timer_callback = move_timeout_callback
            
            if room.start_game():
                socketio.emit('game_started', {
                    'current_player': room.current_player,
                    'board': room.board,
                    'players': room.players
                }, room=room_id)
                room_manager.update_rooms_list(socketio)
