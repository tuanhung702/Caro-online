import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../config/api";
import RoomList from "../components/RoomList";
import CreateRoomModal from "../components/CreateRoomModal";
import PasswordModal from "../components/PasswordModal";
import WaitingRoom from "../components/WaitingRoom";
import GameBoard from "../components/GameBoard";

function GameOnline() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const playerName = localStorage.getItem("username") || "Player";

  const [gameState, setGameState] = useState({
    roomId: "",
    playerSymbol: "",
    board: Array(20)
      .fill()
      .map(() => Array(20).fill(null)),
    currentPlayer: "X",
    gameStatus: "waiting",
    winner: null,
    isConnected: false,
    players: [],
  });

  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createRoomName, setCreateRoomName] = useState("");
  const [createRoomPassword, setCreateRoomPassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [messages, setMessages] = useState([]);

  const addMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      { text: message, time: new Date().toLocaleTimeString() },
    ]);
  };

  // Hàm lưu kết quả match vào database
  const saveMatchResult = async (winnerName) => {
    try {
      const players = gameState.players || [];
      const winner = players.find((p) => p.name === winnerName);
      const loser = players.find((p) => p.name !== winnerName);

      if (!winner || !loser) {
        console.error("Không tìm thấy thông tin người chơi");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/match/save_result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner_user_id: winner.user_id || userId,
          loser_user_id: loser.user_id,
          elo_change_winner: 50,
          elo_change_loser: -50,
          final_board_state: gameState.board,
          match_duration: 300, // Tạm thời set 5 phút
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("✅ Match saved:", data);
      } else {
        console.error("Lỗi lưu match:", data.message);
      }
    } catch (err) {
      console.error("Lỗi lưu kết quả match:", err);
    }
  };

  const handleReturnToWaitingRoom = () => {
    setGameState((prev) => ({
      ...prev,
      gameStatus: "waiting",
      board: Array(20)
        .fill()
        .map(() => Array(20).fill(null)),
      winner: null,
      currentPlayer: "X",
    }));
    if (socketRef.current) {
      socketRef.current.emit("get_rooms");
    }
    addMessage("Trở về phòng chờ. Có thể bắt đầu game mới.");
  };

  useEffect(() => {
    const serverUrl = BACKEND_URL;

    // Khởi tạo socket
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });
    socketRef.current = socket; // Gán vào ref

    socket.on("connect", () => {
      console.log("✅ Connected to server successfully!");
      setGameState((prev) => ({ ...prev, isConnected: true }));
      addMessage("Đã kết nối tới server");
      socket.emit("get_rooms");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setGameState((prev) => ({
        ...prev,
        isConnected: false,
        roomId: "",
        players: [],
      }));
      addMessage("Mất kết nối với server");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      addMessage(`Lỗi kết nối: ${error.message}`);
    });

    socket.on("rooms_list", (data) => {
      setRooms(data.rooms || []);
    });

    socket.on("rooms_list_update", (data) => {
      setRooms(data || []);
    });

    // ✅ CHỈNH SỬA: Tạo phòng thành công
    socket.on("room_created_success", (data) => {
      setGameState((prev) => ({
        ...prev,
        roomId: data.room_id, // Cập nhật roomId
        playerSymbol: data.player_symbol,
        players: data.players || [],
        gameStatus: "waiting", // Đảm bảo set waiting
        currentPlayer: data.current_player || "X",
      }));
      setShowCreateModal(false);
      setCreateRoomName("");
      setCreateRoomPassword("");
      addMessage(`Đã tạo phòng: ${data.room_id}`);
    });

    // ✅ CHỈNH SỬA: Join phòng thành công
    socket.on("join_success", (data) => {
      setGameState((prev) => ({
        ...prev,
        roomId: data.room_id, // Cập nhật roomId
        playerSymbol: data.player_symbol,
        players: data.players || [],
        gameStatus: "waiting", // Đảm bảo set waiting
        currentPlayer: data.current_player || "X",
      }));
      setShowPasswordModal(false);
      setJoinPassword("");
      setSelectedRoom(null);
      addMessage(`Đã tham gia phòng: ${data.room_id}`);
    });

    socket.on("join_fail", (data) => {
      alert(`Lỗi: ${data.message}`);
      setShowPasswordModal(false);
      setJoinPassword("");
    });

    socket.on("player_joined", (data) => {
      setGameState((prev) => ({
        ...prev,
        players: data.players || prev.players,
      }));
      addMessage(`Người chơi mới đã tham gia`);
    });

    socket.on("game_started", (data) => {
      setGameState((prev) => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player,
        gameStatus: "playing",
        players: data.players || prev.players,
      }));
      addMessage("Game đã bắt đầu!");
    });

    socket.on("move_made", (data) => {
      setGameState((prev) => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player,
      }));
    });

    socket.on("game_over", (data) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "finished",
        winner: data.winner,
      }));
      addMessage(`Game kết thúc! Người thắng: ${data.winner}`);
      
      // Lưu match result vào database
      if (gameState.players && gameState.players.length >= 2) {
        saveMatchResult(data.winner);
      }
    });

    socket.on("move_timeout", (data) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "finished",
        winner: data.winner,
      }));
      addMessage(data.message);
    });

    socket.on("surrender_result", (data) => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "finished",
        winner: data.winner,
      }));
      addMessage(data.message);
      
      // Lưu match result vào database
      if (gameState.players && gameState.players.length >= 2) {
        saveMatchResult(data.winner);
      }
    });

    socket.on("game_reset", (data) => {
      setGameState((prev) => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player,
        gameStatus: "playing",
        winner: null,
      }));
      addMessage("Game đã được reset");
    });

    socket.on("player_left", (data) => {
      addMessage(data.message || "Đối thủ đã rời khỏi phòng");
      setGameState((prev) => ({
        ...prev,
        gameStatus: "waiting",
        players: data.players || prev.players,
      }));
    });

    socket.on("error", (data) => {
      addMessage(`Lỗi: ${data.message}`);
      alert(`Lỗi: ${data.message}`);
    });

    return () => {
      // Logic cleanup: Disconnect socket và gửi leave_room
      if (socketRef.current) {
        // Chỉ gửi leave_room nếu đã có roomId
        if (gameState.roomId && socketRef.current.connected) {
          socketRef.current.emit("leave_room", { room_id: gameState.roomId });
        }
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // useEffect này chỉ chạy một lần khi component mount

  // ----------------------------------------------------------------------------------
  // CÁC HÀM XỬ LÝ KHÁC
  // ----------------------------------------------------------------------------------

  const handleCreateRoom = () => {
    if (!createRoomName.trim()) {
      alert("Vui lòng nhập tên phòng");
      return;
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("create_room_request", {
        name: createRoomName,
        password: createRoomPassword.trim() || null,
        player_name: playerName,
        user_id: userId,
      });
    } else {
      alert("Chưa kết nối tới server. Vui lòng thử lại.");
    }
  };

  const handleJoinRoom = (room) => {
    setSelectedRoom(room);
    if (room.has_password) {
      setShowPasswordModal(true);
    } else {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("join_room_request", {
          room_id: room.id,
          player_name: playerName,
          user_id: userId,
          password: null,
        });
      }
    }
  };

  const handleConfirmJoin = () => {
    if (!selectedRoom) return;
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("join_room_request", {
        room_id: selectedRoom.id,
        player_name: playerName,
        user_id: userId,
        password: joinPassword,
      });
    }
  };

  const handleClick = (row, col) => {
    if (
      gameState.gameStatus !== "playing" ||
      gameState.board[row][col] ||
      gameState.currentPlayer !== gameState.playerSymbol
    ) {
      console.log("Không thể đánh:", {
        status: gameState.gameStatus,
        cell: gameState.board[row][col],
        isMyTurn: gameState.currentPlayer === gameState.playerSymbol,
      });
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("make_move", {
        room_id: gameState.roomId,
        row: row,
        col: col,
      });
    }
  };

  const handleSurrender = () => {
    if (
      gameState.roomId &&
      gameState.gameStatus === "playing" &&
      window.confirm("Bạn có chắc chắn muốn đầu hàng?")
    ) {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("surrender", { room_id: gameState.roomId });
      }
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      if (gameState.roomId && socketRef.current.connected) {
        socketRef.current.emit("leave_room", { room_id: gameState.roomId });
      }
      socketRef.current.disconnect();
    }

    // Reset state
    setGameState({
      roomId: "",
      playerSymbol: "",
      board: Array(20)
        .fill()
        .map(() => Array(20).fill(null)),
      currentPlayer: "X",
      players: [],
      gameStatus: "waiting",
      winner: null,
      isConnected: false,
    });

    navigate("/home");
  };

  if (!gameState.isConnected && !gameState.roomId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang kết nối tới server...</p>
        </div>
      </div>
    );
  }

  // 2. Màn hình danh sách phòng (khi chưa có roomId)
  if (!gameState.roomId) {
    return (
      <>
        <RoomList
          rooms={rooms}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={() => setShowCreateModal(true)}
        />

        <CreateRoomModal
          show={showCreateModal}
          roomName={createRoomName}
          password={createRoomPassword}
          onRoomNameChange={setCreateRoomName}
          onPasswordChange={setCreateRoomPassword}
          onCreate={handleCreateRoom}
          onCancel={() => {
            setShowCreateModal(false);
            setCreateRoomName("");
            setCreateRoomPassword("");
          }}
        />

        <PasswordModal
          show={showPasswordModal}
          roomName={selectedRoom?.name}
          password={joinPassword}
          onPasswordChange={setJoinPassword}
          onConfirm={handleConfirmJoin}
          onCancel={() => {
            setShowPasswordModal(false);
            setJoinPassword("");
            setSelectedRoom(null);
          }}
        />
      </>
    );
  }

  // 3. Màn hình phòng chờ (khi có roomId và gameStatus là 'waiting')
  if (gameState.gameStatus === "waiting") {
    return (
      <WaitingRoom
        roomId={gameState.roomId}
        players={gameState.players}
        playerSymbol={gameState.playerSymbol}
        socket={socketRef.current}
        onLeave={handleLeaveRoom}
      />
    );
  }

  // 4. Màn hình bàn cờ (playing HOẶC finished)
  return (
    <GameBoard
      roomId={gameState.roomId}
      playerSymbol={gameState.playerSymbol}
      players={gameState.players}
      board={gameState.board}
      currentPlayer={gameState.currentPlayer}
      winner={gameState.winner}
      gameStatus={gameState.gameStatus}
      messages={messages}
      onCellClick={handleClick}
      onSurrender={handleSurrender}
      onLeaveRoom={handleLeaveRoom}
      socket={socketRef.current}
      playerName={playerName}
      onReturnToWaiting={handleReturnToWaitingRoom}
    />
  );
}

export default GameOnline;
