from flask import request
from flask_socketio import emit, join_room
from socketio_instance import socketio
from rooms import GameRoom
import uuid

# Lưu trữ các phòng game
rooms = {}

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    for room_id, room in list(rooms.items()):
        room.remove_player(request.sid)
        if len(room.players) == 0:
            del rooms[room_id]
        else:
            socketio.emit('player_left', {'message': 'Đối thủ đã rời khỏi phòng'}, room=room_id)

@socketio.on('create_room')
def handle_create_room(data):
    player_name = data.get('player_name', 'Player')
    room_id = str(uuid.uuid4())[:8]

    room = GameRoom(room_id)
    player_symbol = room.add_player(request.sid, player_name)

    rooms[room_id] = room
    join_room(room_id)

    emit('room_created', {
        'room_id': room_id,
        'player_symbol': player_symbol,
        'players': room.players
    })

@socketio.on('join_room')
def handle_join_room(data):
    room_id = data.get('room_id')
    player_name = data.get('player_name', 'Player')

    if room_id not in rooms:
        emit('error', {'message': 'Phòng không tồn tại'})
        return

    room = rooms[room_id]
    if len(room.players) >= 2:
        emit('error', {'message': 'Phòng đã đầy'})
        return

    player_symbol = room.add_player(request.sid, player_name)
    join_room(room_id)

    emit('room_joined', {
        'room_id': room_id,
        'player_symbol': player_symbol,
        'players': room.players
    })

    socketio.emit('player_joined', {
        'player_symbol': player_symbol,
        'players': room.players
    }, room=room_id)

    if len(room.players) == 2:
        socketio.emit('ready_to_start', {
            'players': room.players,
            'room_id': room_id
        }, room=room_id)

@socketio.on('start_game')
def handle_start_game(data):
    room_id = data.get('room_id')
    if room_id not in rooms:
        emit('error', {'message': 'Phòng không tồn tại'})
        return

    room = rooms[room_id]
    if len(room.players) == 2:
        room.start_game()
        socketio.emit('game_started', {
            'current_player': room.current_player,
            'board': room.board
        }, room=room_id)

@socketio.on('make_move')
def handle_make_move(data):
    room_id = data.get('room_id')
    row = data.get('row')
    col = data.get('col')

    if room_id not in rooms:
        emit('error', {'message': 'Phòng không tồn tại'})
        return

    room = rooms[room_id]
    success = room.make_move(row, col, request.sid)

    if success:
        socketio.emit('move_made', {
            'row': row,
            'col': col,
            'player': room.board[row][col],
            'current_player': room.current_player,
            'board': room.board,
            'game_status': room.game_status,
            'winner': room.winner
        }, room=room_id)
    else:
        emit('error', {'message': 'Nước đi không hợp lệ'})

@socketio.on('reset_game')
def handle_reset_game(data):
    room_id = data.get('room_id')

    if room_id not in rooms:
        emit('error', {'message': 'Phòng không tồn tại'})
        return

    room = rooms[room_id]
    room.reset_game()

    socketio.emit('game_reset', {
        'board': room.board,
        'current_player': room.current_player
    }, room=room_id)
