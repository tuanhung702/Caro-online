import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaArrowLeft, FaPlusCircle, FaDoorOpen } from "react-icons/fa";

export default function Room() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      navigate("/login");
      return;
    }
    setPlayerName(user.username);

    socketRef.current = io("http://localhost:5001");

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      socketRef.current.emit("get_rooms");
    });

    socketRef.current.on("rooms_list", (data) => {
      setRooms(data.rooms);
    });

    socketRef.current.on("room_created", (data) => {
      navigate(`/game/${data.room_id}`);
    });

    socketRef.current.on("room_joined", (data) => {
      navigate(`/game/${data.room_id}`);
    });

    return () => socketRef.current.disconnect();
  }, [navigate]);

  const handleCreateRoom = () => {
    socketRef.current.emit("create_room", { player_name: playerName });
  };

  const handleJoinRoom = (roomId) => {
    socketRef.current.emit("join_room", {
      room_id: roomId,
      player_name: playerName,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
          onClick={handleCreateRoom}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          <FaPlusCircle /> Tạo phòng
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-8">
        {rooms.length === 0 ? (
          <p className="text-gray-600 text-lg mt-10">Hiện chưa có phòng nào!</p>
        ) : (
          <table className="w-full max-w-2xl bg-white shadow-lg rounded-lg border border-gray-300">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Mã phòng</th>
                <th className="py-3 px-4 text-center">Số người</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b">
                  <td className="py-3 px-4">{room.id}</td>
                  <td className="text-center">{room.players.length}/2</td>
                  <td className="text-center">
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      <FaDoorOpen /> Vào phòng
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
