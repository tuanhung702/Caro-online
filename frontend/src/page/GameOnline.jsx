import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa";

import RoomList from "../components/RoomList";
import CreateRoomModal from "../components/CreateRoomModal";
import PasswordModal from "../components/PasswordModal";
import WaitingRoom from "../components/WaitingRoom";
import GameBoard from "../components/GameBoard";

function GameOnline() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [gameState, setGameState] = useState({
    roomId: '',
    playerSymbol: '',
    board: Array(20).fill().map(() => Array(20).fill(null)),
    currentPlayer: 'X',
    players: [],
    gameStatus: 'waiting', // waiting, playing, finished
    winner: null,
    isConnected: false
  });

  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createRoomName, setCreateRoomName] = useState('');
  const [createRoomPassword, setCreateRoomPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [messages, setMessages] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const playerName = currentUser?.username || 'Player';

  useEffect(() => {
    // Kết nối tới server
    const serverUrl = 'http://localhost:5001';
    console.log('Connecting to server:', serverUrl);
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to server successfully!');
      setGameState(prev => ({ ...prev, isConnected: true }));
      addMessage('Đã kết nối tới server');
      // Yêu cầu danh sách phòng
      socketRef.current.emit('get_rooms');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setGameState(prev => ({ ...prev, isConnected: false }));
      addMessage('Mất kết nối với server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      addMessage(`Lỗi kết nối: ${error.message}`);
    });

    // Nhận danh sách phòng
    socketRef.current.on('rooms_list', (data) => {
      console.log('📦 Danh sách phòng:', data.rooms);
      setRooms(data.rooms || []);
    });

    socketRef.current.on('rooms_list_update', (data) => {
      console.log('🔄 Cập nhật danh sách phòng:', data);
      setRooms(data || []);
    });

    // Tạo phòng thành công
    socketRef.current.on('room_created_success', (data) => {
      console.log('✅ Room created:', data);
      setGameState(prev => ({
        ...prev,
        roomId: data.room_id,
        playerSymbol: data.player_symbol,
        players: data.players || []
      }));
      setShowCreateModal(false);
      setCreateRoomName('');
      setCreateRoomPassword('');
      addMessage(`Đã tạo phòng: ${data.room_id}`);
    });

    // Join phòng thành công
    socketRef.current.on('join_success', (data) => {
      console.log('✅ Join success:', data);
      setGameState(prev => ({
        ...prev,
        roomId: data.room_id,
        playerSymbol: data.player_symbol,
        players: data.players || []
      }));
      setShowPasswordModal(false);
      setJoinPassword('');
      setSelectedRoom(null);
      addMessage(`Đã tham gia phòng: ${data.room_id}`);
    });

    socketRef.current.on('join_fail', (data) => {
      alert(`Lỗi: ${data.message}`);
      setShowPasswordModal(false);
      setJoinPassword('');
    });

    socketRef.current.on('player_joined', (data) => {
      setGameState(prev => ({
        ...prev,
        players: data.players || prev.players
      }));
      addMessage(`Người chơi mới đã tham gia`);
    });

    socketRef.current.on('game_started', (data) => {
      console.log('🎮 Game started:', data);
      setGameState(prev => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player,
        gameStatus: 'playing',
        players: data.players || prev.players
      }));
      addMessage('Game đã bắt đầu!');
    });

    socketRef.current.on('move_made', (data) => {
      setGameState(prev => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player
      }));
    });

    socketRef.current.on('game_over', (data) => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: data.winner
      }));
      addMessage(`Game kết thúc! Người thắng: ${data.winner}`);
    });

    socketRef.current.on('move_timeout', (data) => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: data.winner
      }));
      addMessage(data.message);
    });

    socketRef.current.on('surrender_result', (data) => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: data.winner
      }));
      addMessage(data.message);
    });

    socketRef.current.on('game_reset', (data) => {
      setGameState(prev => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player,
        gameStatus: 'playing',
        winner: null
      }));
      addMessage('Game đã được reset');
    });

    socketRef.current.on('player_left', (data) => {
      addMessage(data.message || 'Đối thủ đã rời khỏi phòng');
      // Nếu đang chơi và đối thủ rời, reset về waiting
      setGameState(prev => ({
        ...prev,
        gameStatus: 'waiting',
        players: data.players || prev.players
      }));
    });

    socketRef.current.on('error', (data) => {
      addMessage(`Lỗi: ${data.message}`);
      alert(`Lỗi: ${data.message}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const addMessage = (message) => {
    setMessages(prev => [...prev, { text: message, time: new Date().toLocaleTimeString() }]);
  };

  const handleCreateRoom = () => {
    if (!createRoomName.trim()) {
      alert('Vui lòng nhập tên phòng');
      return;
    }
    socketRef.current.emit('create_room_request', {
      name: createRoomName,
      password: createRoomPassword.trim() || null,
      player_name: playerName
    });
  };

  const handleJoinRoom = (room) => {
    setSelectedRoom(room);
    if (room.has_password) {
      setShowPasswordModal(true);
    } else {
      // Join ngay không cần password
      socketRef.current.emit('join_room_request', {
        room_id: room.id,
        player_name: playerName,
        password: null
      });
    }
  };

  const handleConfirmJoin = () => {
    if (!selectedRoom) return;
    socketRef.current.emit('join_room_request', {
      room_id: selectedRoom.id,
      player_name: playerName,
      password: joinPassword
    });
  };

  const handleClick = (row, col) => {
    if (gameState.gameStatus !== 'playing' ||
      gameState.board[row][col] ||
      gameState.currentPlayer !== gameState.playerSymbol) {
      return;
    }

    socketRef.current.emit('make_move', {
      room_id: gameState.roomId,
      row: row,
      col: col
    });
  };

  const handleResetGame = () => {
    if (gameState.roomId) {
      socketRef.current.emit('reset_game', { room_id: gameState.roomId });
    }
  };

  const handleSurrender = () => {
    if (gameState.roomId && window.confirm('Bạn có chắc chắn muốn đầu hàng?')) {
      socketRef.current.emit('surrender', { room_id: gameState.roomId });
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    // Reset state
    setGameState({
      roomId: '',
      playerSymbol: '',
      board: Array(20).fill().map(() => Array(20).fill(null)),
      currentPlayer: 'X',
      players: [],
      gameStatus: 'waiting',
      winner: null,
      isConnected: true
    });
    navigate('/home');
  };

  const handleOpponentLeft = (data) => {
    addMessage(data.message);
  };

  // Màn hình loading
  if (!gameState.isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang kết nối tới server...</p>
        </div>
      </div>
    );
  }

  // Màn hình danh sách phòng
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
            setCreateRoomName('');
            setCreateRoomPassword('');
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
            setJoinPassword('');
            setSelectedRoom(null);
          }}
        />
      </>
    );
  }

  // Màn hình phòng chờ (waiting)
  if (gameState.gameStatus === 'waiting') {
    return (
      <WaitingRoom
        roomId={gameState.roomId}
        players={gameState.players}
        playerSymbol={gameState.playerSymbol}
        socket={socketRef.current}
        onLeave={handleLeaveRoom}
        onOpponentLeft={handleOpponentLeft}
      />
    );
  }

  // Màn hình bàn cờ (playing hoặc finished)
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
      />
  );
}

export default GameOnline;
