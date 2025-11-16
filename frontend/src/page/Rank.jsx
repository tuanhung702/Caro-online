import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaMedal, FaTrophy, FaGamepad } from "react-icons/fa";
import { BACKEND_URL } from "../config/api";

export default function Rank() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/match/rankings`);
      const data = await response.json();

      if (data && data.success) {
        const sorted = (data.rankings || []).sort((a, b) => b.elo_score - a.elo_score);
        setRankings(sorted);

        // Tìm rank của user hiện tại
        const userRank = sorted.findIndex((p) => p.user_id === parseInt(userId));
        if (userRank !== -1) {
          setCurrentUserRank(userRank + 1);
        }
      } else {
        setError(data?.message || "Không thể tải xếp hạng.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Lỗi kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <FaMedal className="text-yellow-500 text-2xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-2xl" />;
    if (rank === 3) return <FaMedal className="text-orange-600 text-2xl" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 border-l-4 border-yellow-500";
    if (rank === 2) return "bg-gray-100 border-l-4 border-gray-400";
    if (rank === 3) return "bg-orange-100 border-l-4 border-orange-600";
    return "bg-white border-l-4 border-blue-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Navbar */}
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            Bảng Xếp Hạng
          </h1>
        </div>
        {currentUserRank && (
          <div className="text-right">
            <p className="text-sm opacity-90">Vị trí của bạn</p>
            <p className="text-2xl font-bold text-yellow-300">#{currentUserRank}</p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-lg text-gray-600">Đang tải xếp hạng...</div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Chưa có dữ liệu xếp hạng.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold mb-4">
              <div className="col-span-2">Rank</div>
              <div className="col-span-4">Tên người chơi</div>
              <div className="col-span-3 text-center">Elo</div>
              <div className="col-span-3 text-center">Trận</div>
            </div>

            {/* Rankings List */}
            {rankings.map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = parseInt(userId) === player.user_id;
              return (
                <div
                  key={player.user_id}
                  className={`${getRankColor(rank)} p-4 rounded-lg grid grid-cols-12 gap-3 items-center shadow-md hover:shadow-lg transition ${
                    isCurrentUser ? "ring-2 ring-blue-400 ring-offset-1" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 flex justify-center">
                    {getMedalIcon(rank)}
                  </div>

                  {/* Username */}
                  <div className="col-span-4">
                    <p className="font-semibold text-gray-800">{player.username}</p>
                    {isCurrentUser && (
                      <p className="text-xs text-blue-600 font-bold">Bạn</p>
                    )}
                  </div>

                  {/* Elo Score */}
                  <div className="col-span-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{player.elo_score}</p>
                  </div>

                  {/* Total Matches */}
                  <div className="col-span-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FaGamepad className="text-gray-600" />
                      <span className="font-semibold">
                        {(player.total_wins || 0) + (player.total_losses || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Statistics Summary */}
        {rankings.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Player */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-sm opacity-90 mb-2">🥇 Vị trí #1</p>
              <p className="text-2xl font-bold">{rankings[0]?.username}</p>
              <p className="text-lg mt-2 opacity-90">{rankings[0]?.elo_score} Elo</p>
            </div>

            {/* Total Players */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-sm opacity-90 mb-2">👥 Tổng người chơi</p>
              <p className="text-3xl font-bold">{rankings.length}</p>
            </div>

            {/* Average Elo */}
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-sm opacity-90 mb-2">📊 Elo trung bình</p>
              <p className="text-3xl font-bold">
                {Math.round(
                  rankings.reduce((sum, p) => sum + p.elo_score, 0) / rankings.length
                )}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
