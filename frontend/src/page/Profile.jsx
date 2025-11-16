// File: frontend/src/page/Profile.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaTrophy, FaGamepad, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { BACKEND_URL } from "../config/api";

export default function Profile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [eloScore, setEloScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile & stats khi trang load
  useEffect(() => {
    const user_id = localStorage.getItem("userId");
    const user_email = localStorage.getItem("email");
    const user_name = localStorage.getItem("username");
    
    if (!user_id) {
      navigate("/login");
      return;
    }
    
    setUserId(user_id);
    setEmail(user_email);
    setUsername(user_name);
    setEditUsername(user_name);
    
    // Gọi API lấy thông tin profile & stats
    fetchProfileStats(user_id);
  }, [navigate]);

  // Lấy thông tin profile từ backend
  const fetchProfileStats = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/match/stats/${userId}`);
      const data = await response.json();
      
      if (data && data.success) {
        setEloScore(data.elo_score || 0);
        setWins(data.total_wins || 0);
        setLosses(data.total_losses || 0);
      }
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    }
  };

  // Cập nhật profile
  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate
    if (!editUsername.trim()) {
      setError("Tên người dùng không được trống.");
      setLoading(false);
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setError("Mật khẩu phải tối thiểu 6 ký tự.");
      setLoading(false);
      return;
    }

    if (editPassword && editPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: editUsername,
        email: email
      };

      if (editPassword) {
        payload.password = editPassword;
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ...payload })
      });

      const data = await response.json();

      if (!data || data.success === false) {
        setError((data && data.message) || "Không thể cập nhật profile.");
        return;
      }

      // Cập nhật localStorage
      localStorage.setItem("username", editUsername);
      setUsername(editUsername);
      setEditPassword("");
      setConfirmPassword("");
      setEditMode(false);
      setSuccess("Cập nhật thành công!");
      
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Lỗi kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditUsername(username);
    setEditPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  };

  if (!userId) {
    return <div className="flex items-center justify-center h-screen text-gray-600">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Navbar */}
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">👤 Hồ sơ cá nhân</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            🏠 Trang chủ
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Thông báo thành công */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Phần thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit /> Chỉnh sửa
              </button>
            )}
          </div>

          {editMode ? (
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Tên người dùng</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Mật khẩu mới (tuỳ chọn)</label>
                <input
                  type="password"
                  placeholder="Để trống nếu không thay đổi"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Xác nhận mật khẩu */}
              {editPassword && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Nút lưu & hủy */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  <FaSave /> {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <FaTimes /> Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Username */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaUser className="text-blue-600 text-xl" />
                <div className="flex-1">
                  <p className="text-gray-600 text-sm">Tên người dùng</p>
                  <p className="font-semibold text-gray-900">{username}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-blue-600 text-xl" />
                <div className="flex-1">
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phần thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Elo Score */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaTrophy className="text-2xl" />
              <span className="text-sm opacity-90">Điểm Elo</span>
            </div>
            <p className="text-4xl font-bold">{eloScore}</p>
          </div>

          {/* Total Wins */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaGamepad className="text-2xl" />
              <span className="text-sm opacity-90">Trận thắng</span>
            </div>
            <p className="text-4xl font-bold">{wins}</p>
          </div>

          {/* Total Losses */}
          <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaGamepad className="text-2xl" />
              <span className="text-sm opacity-90">Trận thua</span>
            </div>
            <p className="text-4xl font-bold">{losses}</p>
          </div>

          {/* Win Rate */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaTrophy className="text-2xl" />
              <span className="text-sm opacity-90">Tỉ lệ thắng</span>
            </div>
            <p className="text-4xl font-bold">
              {wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
