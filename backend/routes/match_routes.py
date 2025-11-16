# File: backend/routes/match_routes.py
"""Routes cho match history và statistics"""

from flask import Blueprint, request, jsonify
from utils.match_service import save_match_result, get_user_match_history, get_user_stats

match_bp = Blueprint("match", __name__, url_prefix="/api/match")


@match_bp.route("/save_result", methods=["POST"])
def save_match_result_route():
    """Lưu kết quả match"""
    data = request.get_json()
    
    winner_id = data.get("winner_user_id")
    loser_id = data.get("loser_user_id")
    elo_change_winner = data.get("elo_change_winner", 16)
    elo_change_loser = data.get("elo_change_loser", -16)
    final_board_state = data.get("final_board_state", [])
    match_duration = data.get("match_duration")
    
    if not winner_id or not loser_id:
        return jsonify({"success": False, "message": "Thiếu thông tin người chơi"})
    
    result = save_match_result(winner_id, loser_id, elo_change_winner, elo_change_loser, final_board_state, match_duration)
    return jsonify(result)


@match_bp.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):
    """Lấy lịch sử match của user"""
    limit = request.args.get('limit', 20, type=int)
    result = get_user_match_history(user_id, limit)
    return jsonify(result)


@match_bp.route("/stats/<user_id>", methods=["GET"])
def get_stats(user_id):
    """Lấy thống kê của user"""
    result = get_user_stats(user_id)
    return jsonify(result)


@match_bp.route("/rankings", methods=["GET"])
def get_rankings():
    """Lấy bảng xếp hạng (top players theo Elo)"""
    from utils.match_service import get_rankings as get_rankings_service
    result = get_rankings_service()
    return jsonify(result)
