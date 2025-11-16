# File: backend/utils/match_service.py
"""Service để lưu kết quả match vào Supabase"""

from utils.supabase_service import supabase
import json
from datetime import datetime

def save_match_result(winner_user_id, loser_user_id, elo_change_winner, elo_change_loser, final_board_state, match_duration=None):
    """
    Lưu kết quả match vào bảng MatchHistory và cập nhật Profiles.
    
    Args:
        winner_user_id (str): User ID của người thắng
        loser_user_id (str): User ID của người thua
        elo_change_winner (int): Thay đổi ELO của người thắng
        elo_change_loser (int): Thay đổi ELO của người thua (âm)
        final_board_state (list): Trạng thái bảng cuối cùng (JSON)
        match_duration (int): Thời lượng match (giây)
    
    Returns:
        dict: {success: bool, match_history_id: str, message: str}
    """
    try:
        # Lấy thông tin profile của người thắng
        winner_profile = supabase.table('Profiles').select('*').eq('user_id', winner_user_id).execute()
        if not winner_profile.data:
            return {"success": False, "message": "Không tìm thấy profile người thắng"}
        
        winner_name = winner_profile.data[0]['username']
        winner_elo = winner_profile.data[0]['elo_score']
        winner_wins = winner_profile.data[0]['total_wins']
        
        # Lấy thông tin profile của người thua
        loser_profile = supabase.table('Profiles').select('*').eq('user_id', loser_user_id).execute()
        if not loser_profile.data:
            return {"success": False, "message": "Không tìm thấy profile người thua"}
        
        loser_name = loser_profile.data[0]['username']
        loser_elo = loser_profile.data[0]['elo_score']
        loser_losses = loser_profile.data[0]['total_losses']
        
        # Lưu vào MatchHistory
        match_record = {
            "profile_id": winner_user_id,
            "opponent_username": loser_name,
            "result": "win",
            "elo_change": elo_change_winner,
            "match_date": datetime.utcnow().isoformat(),
            "final_board_state": json.dumps(final_board_state) if isinstance(final_board_state, list) else final_board_state,
            "duration_seconds": match_duration
        }

        match_result = supabase.table('MatchHistory').insert(match_record).execute()
        
        if not match_result.data:
            return {"success": False, "message": "Lỗi lưu match history"}
        
        match_id = match_result.data[0]['match_history_id']
        
        # Cập nhật ELO và thống kê cho người thắng
        new_winner_elo = winner_elo + elo_change_winner
        supabase.table('Profiles').update({
            "elo_score": new_winner_elo,
            "total_wins": winner_wins + 1
        }).eq('user_id', winner_user_id).execute()
        
        # Cập nhật ELO và thống kê cho người thua
        new_loser_elo = loser_elo + elo_change_loser
        supabase.table('Profiles').update({
            "elo_score": new_loser_elo,
            "total_losses": loser_losses + 1
        }).eq('user_id', loser_user_id).execute()
        
        return {
            "success": True,
            "match_history_id": match_id,
            "winner_new_elo": new_winner_elo,
            "loser_new_elo": new_loser_elo,
            "message": "Match result saved successfully"
        }
    
    except Exception as e:
        print(f"❌ Lỗi lưu match result: {e}")
        return {"success": False, "message": f"Lỗi: {str(e)}"}


def get_user_match_history(user_id, limit=20):
    """
    Lấy lịch sử match của user.
    
    Args:
        user_id (str): User ID
        limit (int): Số lượng match tối đa
    
    Returns:
        list: Danh sách match history
    """
    try:
        result = supabase.table('MatchHistory').select('*').eq('profile_id', user_id).order('match_date', desc=True).limit(limit).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        print(f"❌ Lỗi lấy match history: {e}")
        return {"success": False, "data": []}


def get_user_stats(user_id):
    """
    Lấy thống kê của user từ bảng profiles.
    
    Returns:
        dict: {username, elo_score, total_wins, total_losses, win_rate}
    """
    try:
        result = supabase.table('Profiles').select('*').eq('user_id', user_id).execute()
        
        if not result.data:
            return {"success": False, "message": "Không tìm thấy user"}
        
        profile = result.data[0]
        total_games = profile['total_wins'] + profile['total_losses']
        win_rate = (profile['total_wins'] / total_games * 100) if total_games > 0 else 0
        
        return {
            "success": True,
            "username": profile['username'],
            "elo_score": profile['elo_score'],
            "total_wins": profile['total_wins'],
            "total_losses": profile['total_losses'],
            "total_games": total_games,
            "win_rate": round(win_rate, 2)
        }
    
    except Exception as e:
        print(f"❌ Lỗi lấy user stats: {e}")
        return {"success": False, "message": f"Lỗi: {str(e)}"}


def get_rankings():
    """
    Lấy bảng xếp hạng (toàn bộ players sắp xếp theo Elo).
    
    Returns:
        dict: {success: bool, rankings: list}
    """
    try:
        result = supabase.table('Profiles').select('user_id, username, elo_score, total_wins, total_losses').order('elo_score', desc=True).execute()
        
        if not result.data:
            return {"success": True, "rankings": []}
        
        rankings = [
            {
                "user_id": p['user_id'],
                "username": p['username'],
                "elo_score": p['elo_score'],
                "total_wins": p['total_wins'],
                "total_losses": p['total_losses']
            }
            for p in result.data
        ]
        
        return {"success": True, "rankings": rankings}
    
    except Exception as e:
        print(f"❌ Lỗi lấy rankings: {e}")
        return {"success": False, "message": f"Lỗi: {str(e)}", "rankings": []}
