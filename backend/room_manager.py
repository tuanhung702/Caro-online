# from rooms import GameRoom
# import uuid

# class RoomManager:
#     def __init__(self):
#         self.rooms = {}

#     def create_room(self, player_name):
#         room_id = str(uuid.uuid4())[:6].upper()
#         player_id = str(uuid.uuid4())
#         room = GameRoom(room_id)
#         room.add_player(player_id, player_name)
#         self.rooms[room_id] = room
#         return room_id, player_id

#     def join_room(self, room_id, player_name):
#         if room_id not in self.rooms:
#             return None, None, "Room not found"
#         room = self.rooms[room_id]
#         if len(room.players) >= 2:
#             return None, None, "Room full"
#         player_id = str(uuid.uuid4())
#         symbol = room.add_player(player_id, player_name)
#         room.start_game()
#         return player_id, symbol, None

#     def get_rooms(self):
#         return [
#             {
#                 "room_id": r.room_id,
#                 "players": [p["name"] for p in r.players],
#                 "status": r.game_status
#             }
#             for r in self.rooms.values()
#         ]

# manager = RoomManager()
