import { FaLock, FaLockOpen, FaUsers, FaPlay, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function RoomList({ rooms, onJoinRoom, onCreateRoom }) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaArrowLeft
            className="cursor-pointer hover:text-gray-200"
            size={22}
            onClick={() => navigate("/home")}
          />
          <h1 className="text-xl font-semibold">Danh sách phòng</h1>
        </div>
        <button
          onClick={onCreateRoom}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          <FaPlay /> Tạo phòng
        </button>
      </header>

      {/* Danh sách phòng */}
      <main className="flex-1 flex flex-col items-center p-8">
        {rooms.length === 0 ? (
          <p className="text-gray-600 text-lg mt-10">Hiện chưa có phòng nào!</p>
        ) : (
          <table className="w-full max-w-4xl bg-white shadow-lg rounded-lg border border-gray-300">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID Phòng</th>
                <th className="py-3 px-4 text-center">Tên phòng</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Mật khẩu</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{room.id}</td>
                  <td className="py-3 px-4 text-center">{room.name}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FaUsers className="text-gray-500" />
                      {room.current_players}/{room.max_players}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      room.game_status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      room.game_status === 'playing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {room.game_status === 'waiting' ? 'Chờ' :
                       room.game_status === 'playing' ? 'Đang chơi' : 'Kết thúc'}
                    </span>
                  </td>
                  <td className="text-center">
                    {room.has_password ? (
                      <FaLock className="text-red-500 mx-auto" />
                    ) : (
                      <FaLockOpen className="text-green-500 mx-auto" />
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onJoinRoom(room)}
                      disabled={room.current_players >= room.max_players}
                      className={`px-4 py-2 rounded flex items-center gap-2 justify-center mx-auto ${
                        room.current_players >= room.max_players
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <FaPlay /> {room.current_players >= room.max_players ? 'Đầy' : 'Vào phòng'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

