# models/gameroom.py

class GameRoom:
    def __init__(self, room_id, name="Phòng Mới", password=None):
        self.room_id = room_id
        self.name = name                 # Tên phòng
        self.password = password         # Mật khẩu (None nếu không có)
        self.players = []                # Danh sách người chơi [{id, name, symbol}]
        
        # Logic Game
        self.board = [[None for _ in range(20)] for _ in range(20)]
        self.current_player = 'X'
        self.game_status = 'waiting'     # Trạng thái: waiting, playing, finished
        self.winner = None

    # --- CHỨC NĂNG QUẢN LÝ PHÒNG ---
    def to_public_dict(self):
        """Trả về thông tin công khai của phòng cho danh sách (KHÔNG CÓ MẬT KHẨU)."""
        return {
            'id': self.room_id,
            'name': self.name,
            'current_players': len(self.players),
            'max_players': 2,
            'has_password': self.password is not None, 
            'game_status': self.game_status
        }
        
    def start_game(self):
        """Bắt đầu game khi đủ 2 người chơi và đang ở trạng thái chờ."""
        if len(self.players) == 2 and self.game_status == 'waiting':
            self.game_status = 'playing'
            self.current_player = 'X'
            return True
        return False
        
    def add_player(self, player_id, player_name):
        """Thêm người chơi vào phòng, gán ký hiệu 'X' hoặc 'O'."""
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
        """Xóa người chơi khỏi phòng."""
        self.players = [p for p in self.players if p['id'] != player_id]

    # --- CHỨC NĂNG CỜ CARO (make_move, check_winner...) giữ nguyên logic của bạn ---
    def make_move(self, row, col, player_id):
        if self.game_status != 'playing':
            return False
        current_player_data = next((p for p in self.players if p['id'] == player_id), None)
        if not current_player_data or current_player_data['symbol'] != self.current_player:
            return False
        if not (0 <= row < 20 and 0 <= col < 20) or self.board[row][col] is not None:
             return False

        self.board[row][col] = self.current_player
        if self.check_winner(row, col):
            self.game_status = 'finished'
            self.winner = self.current_player
            return True

        self.current_player = 'O' if self.current_player == 'X' else 'X'
        return True

    def check_winner(self, row, col):
        player = self.board[row][col]
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
        for dx, dy in directions:
            count = 1
            r, c = row + dx, col + dy
            while 0 <= r < 20 and 0 <= c < 20 and self.board[r][c] == player:
                count += 1; r += dx; c += dy
            r, c = row - dx, col - dy
            while 0 <= r < 20 and 0 <= c < 20 and self.board[r][c] == player:
                count += 1; r -= dx; c -= dy
            if count >= 5: return True
        return False
        
    def reset_game(self):
        self.board = [[None for _ in range(20)] for _ in range(20)]
        self.current_player = 'X'
        self.game_status = 'playing'
        self.winner = None