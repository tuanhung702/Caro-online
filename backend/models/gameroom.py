# models/gameroom.py

import threading
import time

class GameRoom:
    def __init__(self, room_id, name="Phòng Mới", password=None):
        self.room_id = room_id
        self.name = name                 # Tên phòng
        self.password = password         # Mật khẩu (None nếu không có)
        self.players = []                # Danh sách người chơi [{id, name, symbol, ready}]
        
        # Logic Game
        self.board = [[None for _ in range(20)] for _ in range(20)]
        self.current_player = 'X'
        self.game_status = 'waiting'     # Trạng thái: waiting, playing, finished
        self.winner = None
        
        # Ready state
        self.ready_players = set()       # Set các player_id đã ready
        
        # Timer cho mỗi lượt đi (30 giây)
        self.move_timer_start = None      # Thời điểm bắt đầu lượt đi
        self.move_timer_thread = None     # Thread cho timer lượt đi
        self.move_timer_running = False
        self.move_timer_callback = None   # Callback khi timeout lượt đi

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
        
    def set_player_ready(self, player_id):
        """Đánh dấu player đã sẵn sàng."""
        for player in self.players:
            if player['id'] == player_id:
                player['ready'] = True
                self.ready_players.add(player_id)
                return True
        return False
    
    def check_all_ready(self):
        """Kiểm tra xem tất cả players đã ready chưa."""
        return len(self.players) == 2 and len(self.ready_players) == 2
    
    def start_game(self):
        """Bắt đầu game khi đủ 2 người chơi và cả 2 đều ready."""
        if self.check_all_ready() and self.game_status == 'waiting':
            self.game_status = 'playing'
            self.current_player = 'X'
            # Bắt đầu timer cho lượt đi đầu tiên
            self.start_move_timer()
            return True
        return False

    def start_move_timer(self, timeout=30):
        """Bắt đầu timer 30 giây cho lượt đi hiện tại."""
        self.stop_move_timer()
        
        if self.game_status != 'playing':
            return
        
        self.move_timer_running = True
        self.move_timer_start = time.time()
        
        def timer():
            start = time.time()
            while self.move_timer_running and time.time() - start < timeout:
                if not self.move_timer_running:
                    return
                if self.game_status != 'playing':
                    self.move_timer_running = False
                    return
                time.sleep(0.5)
            
            if self.move_timer_running and self.game_status == 'playing':
                # Timeout - người chơi hiện tại thua
                loser_symbol = self.current_player
                winner_symbol = 'O' if loser_symbol == 'X' else 'X'
                self.game_status = 'finished'
                self.winner = winner_symbol
                if self.move_timer_callback:
                    self.move_timer_callback(winner_symbol, loser_symbol)
                
                # Reset về waiting state sau khi timeout
                self.game_status = 'waiting'
                self.board = [[None for _ in range(20)] for _ in range(20)]
                self.current_player = 'X'
                self.winner = None
                self.ready_players.clear()
                for player in self.players:
                    player['ready'] = False
            
            self.move_timer_running = False
        
        self.move_timer_thread = threading.Thread(target=timer, daemon=True)
        self.move_timer_thread.start()
    
    def stop_move_timer(self):
        """Dừng timer lượt đi."""
        self.move_timer_running = False
        
    def add_player(self, player_id, player_name):
        """Thêm người chơi vào phòng, gán ký hiệu 'X' hoặc 'O'."""
        if len(self.players) < 2:
            player_symbol = 'X' if len(self.players) == 0 else 'O'
            self.players.append({
                'id': player_id,
                'name': player_name,
                'symbol': player_symbol,
                'ready': False
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

        # Dừng timer lượt đi hiện tại
        self.stop_move_timer()
        
        self.board[row][col] = self.current_player
        if self.check_winner(row, col):
            self.game_status = 'finished'
            self.winner = self.current_player
            return True

        # Chuyển lượt và bắt đầu timer cho lượt mới
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        self.start_move_timer()
        return True
    
    def surrender(self, player_id):
        """Xử lý đầu hàng."""
        if self.game_status != 'playing':
            return False
        
        current_player_data = next((p for p in self.players if p['id'] == player_id), None)
        if not current_player_data:
            return False
        
        # Người đầu hàng thua
        loser_symbol = current_player_data['symbol']
        winner_symbol = 'O' if loser_symbol == 'X' else 'X'
        
        self.game_status = 'finished'
        self.winner = winner_symbol
        self.stop_move_timer()
        
        return True, winner_symbol, loser_symbol

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
        
 