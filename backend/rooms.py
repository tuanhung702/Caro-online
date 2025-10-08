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
