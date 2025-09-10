from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'caro_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Lưu trữ các phòng game
rooms = {}
# Lưu trữ thông tin người chơi
players = {}

class GameRoom:
    def __init__(self, room_id):
        self.room_id = room_id
        self.players = []
        self.board = [[None for _ in range(20)] for _ in range(20)]
        self.current_player = 'X'
        self.game_status = 'waiting'  # waiting, playing, finished
        self.winner = None

    def add_player(self, player_id, player_name):
        if len(self.players) < 2:
            player_symbol = 'X' if len(self.players) == 0 else 'O'
            self.players.append({
                'id': player_id,
                'name': player_name,
                'symbol': player_symbol
            })
            return player_symbol
        return None

    def remove_player(self, player_id):
        self.players = [p for p in self.players if p['id'] != player_id]

    def make_move(self, row, col, player_id):
        if self.game_status != 'playing':
            return False
        
        # Kiểm tra lượt đi
        current_player_data = next((p for p in self.players if p['id'] == player_id), None)
        if not current_player_data or current_player_data['symbol'] != self.current_player:
            return False
        
        # Kiểm tra ô đã được đánh chưa
        if self.board[row][col] is not None:
            return False
        
        # Đánh cờ
        self.board[row][col] = self.current_player
        
        # Kiểm tra thắng thua
        if self.check_winner(row, col):
            self.game_status = 'finished'
            self.winner = self.current_player
            return True
        
        # Đổi lượt
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        return True

    def check_winner(self, row, col):
        player = self.board[row][col]
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
        
        for dx, dy in directions:
            count = 1
            # Đếm về phía dương
            r, c = row + dx, col + dy
            while 0 <= r < 20 and 0 <= c < 20 and self.board[r][c] == player:
                count += 1
                r += dx
                c += dy
            
            # Đếm về phía âm
            r, c = row - dx, col - dy
            while 0 <= r < 20 and 0 <= c < 20 and self.board[r][c] == player:
                count += 1
                r -= dx
                c -= dy
            
            if count >= 5:
                return True
        return False

    def start_game(self):
        if len(self.players) == 2:
            self.game_status = 'playing'
            self.current_player = 'X'
            return True
        return False

    def reset_game(self):
        self.board = [[None for _ in range(20)] for _ in range(20)]
        self.current_player = 'X'
        self.game_status = 'playing'
        self.winner = None

@app.route('/')
def index():
    return "Caro Online Backend is running!"

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Xóa người chơi khỏi phòng
    for room_id, room in rooms.items():
        room.remove_player(request.sid)
        if len(room.players) == 0:
            del rooms[room_id]
        else:
            # Thông báo cho người chơi còn lại
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
    
    # Gửi thông tin room cho người chơi vừa join
    emit('room_joined', {
        'room_id': room_id,
        'player_symbol': player_symbol,
        'players': room.players
    })
    
    # Thông báo cho tất cả người chơi trong phòng
    socketio.emit('player_joined', {
        'player_symbol': player_symbol,
        'players': room.players
    }, room=room_id)
    
    # Thông báo đủ 2 người chơi, chờ bắt đầu game
    if len(room.players) == 2:
        socketio.emit('ready_to_start', {
            'players': room.players,
            'room_id': room_id
        }, room=room_id)

@socketio.on('start_game')
def handle_start_game(data):
    room_id = data.get('room_id')
    print(f'Start game request for room: {room_id}')
    
    if room_id not in rooms:
        emit('error', {'message': 'Phòng không tồn tại'})
        return
    
    room = rooms[room_id]
    if len(room.players) == 2:
        room.start_game()
        print(f'Starting game for room {room_id} with {len(room.players)} players')
        socketio.emit('game_started', {
            'current_player': room.current_player,
            'board': room.board
        }, room=room_id)
        print(f'Game started event sent to room {room_id}')

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
        # Gửi cập nhật cho tất cả người chơi trong phòng
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

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
