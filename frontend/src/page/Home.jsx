import { FaUserCircle, FaSignOutAlt, FaPlay, FaList, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Lấy thông tin user từ localStorage khi trang load
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser?.username) {
      setUsername(currentUser.username);
    } else {
      // Nếu chưa đăng nhập -> quay về login
      navigate("/login");
    }
  }, [navigate]);

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-800 text-white px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Caro Online</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaUserCircle className="text-2xl" />
            <span>{username || "Guest"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-gray-200"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
        <h2 className="text-6xl font-extrabold text-blue-700 mb-10 drop-shadow-lg">
          Caro Online
        </h2>

        {/* Khung chứa các nút */}
        <div className="bg-white border border-gray-300 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 w-96 max-w-md">
          {/* Nút Game Offline */}
          <button
            onClick={() => navigate("/gameOffline")}
            className="w-full bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-md flex items-center justify-center gap-3 hover:bg-green-700 transition"
          >
            <FaPlay size={22} />
            GAME OFFLINE
          </button>

          {/* Nút Play Now */}
          <button
            onClick={() => navigate("/gameonline")}
            className="w-full bg-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-md flex items-center justify-center gap-3 hover:bg-blue-700 transition"
          >
            <FaPlay size={22} />
            PLAY NOW
          </button>

          {/* ROOM & RANK */}
          <div className="flex gap-5 w-full">
            
            <button
              onClick={() => navigate("/rank")}
              className="flex-1 bg-pink-700 text-white px-6 py-4 text-lg font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-pink-600 transition"
            >
              <FaChartBar size={20} />
              RANK
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
