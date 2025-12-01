from flask import request
from flask_socketio import emit
from states.room_manager import room_manager 
from socketio_instance import socketio
from .room_events import parse_data
from utils.match_service import save_match_result
import json

@socketio.on('make_move')
def handle_make_move(data):

    data = parse_data(data)
    if data is None:
        emit('error', {'message': 'Dữ liệu gửi lên không phải là JSON hợp lệ.'}, room=request.sid)
        return
        
    room_id = data.get('room_id')
    row = data.get('row')
    col = data.get('col')
    
    print(f"DEBUG: Nhận make_move từ client {request.sid} Room: {room_id}, ({row}, {col})")

    room = room_manager.get_room(room_id)
    
    if not room:
        emit('error', {'message': 'Phòng không tồn tại'}, room=request.sid)
        return

    # Setup callback cho timer nếu chưa có
    if not room.move_timer_callback:
        def move_timeout_callback(winner_symbol, loser_symbol):
            winner = next((p for p in room.players if p['symbol'] == winner_symbol), None)
            loser = next((p for p in room.players if p['symbol'] == loser_symbol), None)
            
            # 💾 Lưu kết quả match khi hết thời gian
            if winner and loser and winner.get('user_id') and loser.get('user_id'):
                match_result = save_match_result(
                    winner_user_id=winner['user_id'],
                    loser_user_id=loser['user_id'],
                    elo_change_winner=50,
                    elo_change_loser=-50,
                    final_board_state=room.board,
                    match_duration=None,
                    end_reason="timeout"
                )
                print(f"✅ Timeout match saved: {match_result}")
            
            socketio.emit('move_timeout', {
                'winner': winner_symbol,
                'winner_name': winner['name'] if winner else winner_symbol,
                'loser': loser_symbol,
                'loser_name': loser['name'] if loser else loser_symbol,
                'message': f'Người chơi {winner["name"] if winner else winner_symbol} thắng! Đối thủ đã hết thời gian.'
            }, room=room_id)
            room_manager.update_rooms_list(socketio)
        room.move_timer_callback = move_timeout_callback
    
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
            winner_player = next((p for p in room.players if p['symbol'] == room.winner), None)
            loser_player = next((p for p in room.players if p['symbol'] != room.winner), None)
            
            # 💾 Lưu kết quả match vào database (chỉ khi có user_id)
            if winner_player and loser_player and winner_player.get('user_id') and loser_player.get('user_id'):
                match_result = save_match_result(
                    winner_user_id=winner_player['user_id'],
                    loser_user_id=loser_player['user_id'],
                    elo_change_winner=50,
                    elo_change_loser=-50,
                    final_board_state=room.board,
                    match_duration=None,
                    end_reason="normal"
                )
                print(f"✅ Match saved: {match_result}")
            
            socketio.emit('game_over', {
                'winner': room.winner,
                'winner_name': winner_player['name'] if winner_player else room.winner,
                'loser_name': loser_player['name'] if loser_player else ('O' if room.winner == 'X' else 'X'),
                'message': f"Người chơi {winner_player['name'] if winner_player else room.winner} đã thắng!"
            }, room=room_id)
            
            # Reset game về waiting state để có thể chơi lại
            room.game_status = 'waiting'
            room.board = [[None for _ in range(20)] for _ in range(20)]
            room.current_player = 'X'
            room.winner = None
            room.ready_players.clear()
            for player in room.players:
                player['ready'] = False
            
            # Cập nhật danh sách phòng
            room_manager.update_rooms_list(socketio)

    else:
        # Có thể thêm logic trả về thông báo lỗi cụ thể từ room.make_move
        emit('error', {'message': 'Nước đi không hợp lệ'}, room=request.sid)


    
@socketio.on('get_rooms')
def handle_get_rooms():
    # Trả về danh sách phòng available (đang chờ hoặc đang chơi)
    rooms_data = room_manager.get_available_rooms()
    emit('rooms_list', {'rooms': rooms_data}, room=request.sid)
