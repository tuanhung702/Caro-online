# from flask import Blueprint, jsonify, request
# from room_manager import GameRoom

# room_bp = Blueprint('room_bp', __name__)

# # Danh sách phòng hiện tại
# rooms = {}

# @room_bp.route("/rooms", methods=["GET"])
# def get_rooms():
#     room_list = [
#         {
#             "room_id": rid,
#             "players": len(room.players),
#             "status": room.game_status
#         }
#         for rid, room in rooms.items()
#     ]
#     return jsonify(room_list), 200


# @room_bp.route("/create_room", methods=["POST"])
# def create_room():
#     data = request.get_json()
#     room_id = data.get("room_id")

#     if not room_id:
#         return jsonify({"error": "Missing room_id"}), 400
#     if room_id in rooms:
#         return jsonify({"error": "Room already exists"}), 400

#     rooms[room_id] = GameRoom(room_id)
#     return jsonify({"message": "Room created", "room_id": room_id}), 201
