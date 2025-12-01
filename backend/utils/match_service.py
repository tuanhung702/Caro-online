# File: backend/utils/match_service.py
"""Service để lưu kết quả match vào Supabase"""

from utils.supabase_service import supabase
import json
from datetime import datetime

def save_match_result(winner_user_id, loser_user_id, elo_change_winner, elo_change_loser, final_board_state, match_duration=None, end_reason="normal"):
   
    try:
        # Convert user_id sang int
        winner_user_id = int(winner_user_id)
        loser_user_id = int(loser_user_id)
        
        print(f" Saving match: Winner ID={winner_user_id}, Loser ID={loser_user_id}")
        
        # Lấy thông tin profile của người thắng
        winner_profile = supabase.table('Profiles').select('*').eq('user_id', winner_user_id).execute()
        if not winner_profile.data:
            print(f" Không tìm thấy profile người thắng: {winner_user_id}")
            return {"success": False, "message": "Không tìm thấy profile người thắng"}
        
        winner_name = winner_profile.data[0]['username']
        winner_elo = winner_profile.data[0]['elo_score']
        winner_wins = winner_profile.data[0]['total_wins']
        print(f" Winner found: {winner_name}, Elo={winner_elo}, Wins={winner_wins}")
        
        # Lấy thông tin profile của người thua
        loser_profile = supabase.table('Profiles').select('*').eq('user_id', loser_user_id).execute()
        if not loser_profile.data:
            print(f" Không tìm thấy profile người thua: {loser_user_id}")
            return {"success": False, "message": "Không tìm thấy profile người thua"}
        
        loser_name = loser_profile.data[0]['username']
        loser_elo = loser_profile.data[0]['elo_score']
        loser_losses = loser_profile.data[0]['total_losses']
        print(f" Loser found: {loser_name}, Elo={loser_elo}, Losses={loser_losses}")
        
        
        
        # Record cho người thắng
        winner_match_record = {
            "profile_id": winner_user_id,
            "opponent_username": loser_name,
            "result": "win",
            "elo_change": abs(elo_change_winner),
            "end_reason": end_reason,
            "match_date": datetime.utcnow().isoformat(),
            "final_board_state": json.dumps(final_board_state) if isinstance(final_board_state, list) else final_board_state
        }

        # Record cho người thua (result="win" do constraint, nhưng elo_change âm để phân biệt)
        loser_match_record = {
            "profile_id": loser_user_id,
            "opponent_username": winner_name,
            "result": "win",
            "elo_change": -abs(elo_change_loser),  # Lưu số âm để frontend biết đây là thua
            "end_reason": end_reason,
            "match_date": datetime.utcnow().isoformat(),
            "final_board_state": json.dumps(final_board_state) if isinstance(final_board_state, list) else final_board_state
        }

        print(f" Inserting winner match history for {winner_name}...")
        winner_result = supabase.table('MatchHistory').insert(winner_match_record).execute()
        
        if not winner_result.data:
            print(f" Failed to insert winner match history")
            return {"success": False, "message": "Lỗi lưu match history người thắng"}
        
        print(f" Inserting loser match history for {loser_name}...")
        loser_result = supabase.table('MatchHistory').insert(loser_match_record).execute()
        
        if not loser_result.data:
            print(f" Failed to insert loser match history")
            return {"success": False, "message": "Lỗi lưu match history người thua"}
        
        match_id = winner_result.data[0]['match_history_id']
        print(f" Both match histories saved successfully!")
        
        # Cập nhật ELO và thống kê cho người thắng
        new_winner_elo = winner_elo + elo_change_winner
        print(f" Updating winner {winner_name}: Elo {winner_elo} -> {new_winner_elo}, Wins {winner_wins} -> {winner_wins + 1}")
        winner_update = supabase.table('Profiles').update({
            "elo_score": new_winner_elo,
            "total_wins": winner_wins + 1
        }).eq('user_id', winner_user_id).execute()
        print(f" Winner profile updated: {winner_update.data}")
        
        # Cập nhật ELO và thống kê cho người thua
        new_loser_elo = loser_elo + elo_change_loser
        print(f" Updating loser {loser_name}: Elo {loser_elo} -> {new_loser_elo}, Losses {loser_losses} -> {loser_losses + 1}")
        loser_update = supabase.table('Profiles').update({
            "elo_score": new_loser_elo,
            "total_losses": loser_losses + 1
        }).eq('user_id', loser_user_id).execute()
        print(f" Loser profile updated: {loser_update.data}")
        
        return {
            "success": True,
            "match_history_id": match_id,
            "winner_new_elo": new_winner_elo,
            "loser_new_elo": new_loser_elo,
            "message": "Match result saved successfully"
        }
    
    except Exception as e:
        print(f" Lỗi lưu match result: {e}")
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
        print(f" Lỗi lấy match history: {e}")
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
        print(f" Lỗi lấy user stats: {e}")
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
        print(f" Lỗi lấy rankings: {e}")
        return {"success": False, "message": f"Lỗi: {str(e)}", "rankings": []}
