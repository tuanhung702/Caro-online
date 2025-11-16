// File: frontend/src/components/UserStats.jsx
import { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:5001";

export default function UserStats({ userId }) {
  const [stats, setStats] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("stats"); // 'stats' hoặc 'history'

  useEffect(() => {
    if (!userId) return;
    
    fetchStats();
    fetchMatchHistory();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/match/stats/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      } else {
        setError(data.message || "Lỗi lấy thống kê");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Không thể kết nối backend");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/match/history/${userId}?limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setMatchHistory(data.data || []);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-2 px-4 font-semibold ${
            activeTab === "stats"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📊 Thống kê
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-2 px-4 font-semibold ${
            activeTab === "history"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📜 Lịch sử
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tab Thống kê */}
      {activeTab === "stats" && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Tên người chơi</p>
              <p className="text-2xl font-bold text-blue-600">{stats.username}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Điểm ELO</p>
              <p className="text-2xl font-bold text-orange-600">{stats.elo_score}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Lần thắng</p>
              <p className="text-2xl font-bold text-green-600">{stats.total_wins}</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Lần thua</p>
              <p className="text-2xl font-bold text-red-600">{stats.total_losses}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Tổng trận</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_games}</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Tỉ lệ thắng</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.win_rate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Lịch sử */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {matchHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có lịch sử trận đấu</p>
          ) : (
            matchHistory.map((match) => (
              <div
                key={match.match_history_id}
                className={`p-4 rounded-lg border-l-4 ${
                  match.result === "win"
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      vs {match.opponent_username}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(match.match_date).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      match.result === "win"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {match.result === "win" ? "🎉 THẮNG" : "😔 THUA"}
                    </p>
                    <p className={`text-sm font-semibold ${
                      match.elo_change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {match.elo_change > 0 ? "+" : ""}{match.elo_change} ELO
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
