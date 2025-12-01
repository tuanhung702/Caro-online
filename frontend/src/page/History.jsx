import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config/api";

const History = () => {
  const navigate = useNavigate();
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchMatchHistory();
  }, [userId, navigate]);

  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/match/history/${userId}?limit=50`);
      const data = await response.json();

      if (data.success) {
        setMatchHistory(data.data || []);
      } else {
        setError(data.message || "Không thể tải lịch sử đấu");
      }
    } catch (err) {
      console.error("Error fetching match history:", err);
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Database lưu tất cả record với result="win", dựa vào elo_change để phân biệt thắng/thua
  const getResultBadge = (match) => {
    // Nếu elo_change > 0 = thắng, < 0 = thua
    const isWin = match.elo_change > 0;
    
    if (isWin) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
          THẮNG
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
          THUA
        </span>
      );
    }
  };

  const getEloChangeColor = (eloChange) => {
    return eloChange > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                 Lịch Sử Đấu
              </h1>
              <p className="text-gray-600">
                Người chơi: <span className="font-semibold text-indigo-600">{currentUsername}</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              ← Về Trang Chủ
            </button>
          </div>
        </div>

        {/* Match History List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Đang tải lịch sử...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">❌ {error}</p>
              <button
                onClick={fetchMatchHistory}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Thử Lại
              </button>
            </div>
          ) : matchHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Chưa có lịch sử đấu nào</p>
              <p className="text-gray-400 mt-2">Hãy chơi trận đầu tiên của bạn!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Tổng số trận: {matchHistory.length}
                </h2>
                <button
                  onClick={fetchMatchHistory}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  🔄 Làm mới
                </button>
              </div>

              {/* Table for desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đối thủ
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kết quả
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thay đổi Elo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lý do
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matchHistory.map((match) => (
                      <tr key={match.match_history_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(match.match_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-bold text-lg">
                                {match.opponent_username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {match.opponent_username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getResultBadge(match)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={getEloChangeColor(match.elo_change)}>
                            {match.elo_change > 0 ? "+" : ""}{match.elo_change}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {match.end_reason === "timeout" ? "Hết thời gian" : 
                           match.end_reason === "disconnect" ? "Thoát khỏi phòng" : "Hoàn thành"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards for mobile */}
              <div className="md:hidden space-y-4">
                {matchHistory.map((match) => (
                  <div
                    key={match.match_history_id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-xl">
                            {match.opponent_username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {match.opponent_username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(match.match_date)}
                          </p>
                        </div>
                      </div>
                      {getResultBadge(match)}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600">
                        {match.end_reason === "timeout" ? "Hết thời gian" : 
                         match.end_reason === "disconnect" ? "Thoát phòng" : "Hoàn thành"}
                      </span>
                      <span className={`text-lg ${getEloChangeColor(match.elo_change)}`}>
                        {match.elo_change > 0 ? "+" : ""}{match.elo_change} Elo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
