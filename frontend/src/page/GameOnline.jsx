import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Board from "../components/Board";
import Status from "../components/Status";

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
  
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Kết nối tới server
    // Kết nối tới server - sử dụng backend ngrok
    const serverUrl = 'https://616592d6a91a.ngrok-free.app';
    console.log('Connecting to server:', serverUrl);
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    socketRef.current.on('connect', () => {
      console.log(' Connected to server successfully!');
      setGameState(prev => ({ ...prev, isConnected: true }));
      addMessage('Đã kết nối tới server');
    });

    socketRef.current.on('disconnect', () => {
      console.log(' Disconnected from server');
      setGameState(prev => ({ ...prev, isConnected: false }));
      addMessage('Mất kết nối với server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error(' Connection error:', error);
      addMessage(`Lỗi kết nối: ${error.message}`);
    });

    socketRef.current.on('room_created', (data) => {
      setGameState(prev => ({
        ...prev,
        roomId: data.room_id,
        playerSymbol: data.player_symbol,
        players: data.players
      }));
      addMessage(`Đã tạo phòng: ${data.room_id}`);
    });

    socketRef.current.on('room_joined', (data) => {
      console.log('Received room_joined event:', data);
      setGameState(prev => {
        console.log('Setting roomId to:', data.room_id);
        return {
          ...prev,
          roomId: data.room_id,
          playerSymbol: data.player_symbol,
          players: data.players
        };
      });
      addMessage(`Đã tham gia phòng: ${data.room_id}`);
    });

    socketRef.current.on('player_joined', (data) => {
      setGameState(prev => ({
        ...prev,
        players: data.players
      }));
      addMessage(`Người chơi ${data.player_symbol} đã tham gia`);
    });

    socketRef.current.on('ready_to_start', (data) => {
      console.log('Received ready_to_start event:', data);
      setGameState(prev => ({
        ...prev,
        players: data.players,
        gameStatus: 'ready'
      }));
      addMessage('Đủ 2 người chơi! Sẵn sàng bắt đầu game');
    });

    socketRef.current.on('game_started', (data) => {
      console.log('Received game_started event:', data);
      console.log('Current gameState:', gameState);
      setGameState(prev => {
        console.log('Previous gameState:', prev);
        return {
          ...prev,
          board: data.board,
          currentPlayer: data.current_player,
          gameStatus: 'playing'
        };
      });
      addMessage('Game đã bắt đầu!');
    });

    socketRef.current.on('move_made', (data) => {
      setGameState(prev => ({
        ...prev,
        board: data.board,
        currentPlayer: data.current_player,
        gameStatus: data.game_status,
        winner: data.winner
      }));
      
      if (data.game_status === 'finished') {
        addMessage(`Game kết thúc! Người thắng: ${data.winner}`);
      }
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
      addMessage(data.message);
    });

    socketRef.current.on('error', (data) => {
      addMessage(`Lỗi: ${data.message}`);
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
    if (!playerName.trim()) {
      alert('Vui lòng nhập tên người chơi');
      return;
    }
    socketRef.current.emit('create_room', { player_name: playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Vui lòng nhập tên người chơi và mã phòng');
      return;
    }
    socketRef.current.emit('join_room', { 
      room_id: roomCode, 
      player_name: playerName 
    });
  };

  const handleStartGame = () => {
    if (gameState.roomId) {
      socketRef.current.emit('start_game', { room_id: gameState.roomId });
    }
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

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate('/');
  };

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

  if (!gameState.roomId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Caro Online</h1>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tên người chơi:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Tạo phòng mới
            </button>
            
            <button
              onClick={() => setShowRoomInput(!showRoomInput)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Tham gia phòng
            </button>
            
            {showRoomInput && (
              <div className="mt-4">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  placeholder="Nhập mã phòng"
                />
                <button
                  onClick={handleJoinRoom}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  Tham gia
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus === 'ready') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold mb-6">Sẵn sàng bắt đầu!</h1>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Người chơi trong phòng:</h3>
            {gameState.players.map((player, index) => (
              <div key={index} className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  player.symbol === 'X' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {player.symbol}
                </div>
                <span>{player.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartGame}
            className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition text-lg font-semibold"
          >
            BẮT ĐẦU GAME
          </button>

          <button
            onClick={handleLeaveRoom}
            className="w-full mt-3 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
          >
            Rời phòng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Caro Online</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">Phòng: <strong>{gameState.roomId}</strong></span>
              <span className="text-sm">Bạn là: <strong>{gameState.playerSymbol}</strong></span>
              <button
                onClick={handleLeaveRoom}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Rời phòng
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Game Area */}
          <div className="flex-1">
            {/* Player Info */}
            <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                {gameState.players.map((player, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      player.symbol === 'X' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {player.symbol}
                    </div>
                    <span className="text-sm mt-1">{player.name}</span>
                    {gameState.currentPlayer === player.symbol && gameState.gameStatus === 'playing' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Status */}
            <Status 
              xIsNext={gameState.currentPlayer === 'X'} 
              winner={gameState.winner} 
            />

            {/* Board */}
            <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
              <Board board={gameState.board} onClick={handleClick} />
            </div>

            {/* Game Controls */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleResetGame}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                disabled={gameState.gameStatus !== 'playing'}
              >
                Chơi lại
              </button>
            </div>
          </div>

          {/* Chat/Log Area */}
          <div className="w-80">
            <div className="bg-white shadow-lg rounded-lg p-4 h-96 flex flex-col">
              <h3 className="font-bold mb-2">Thông báo</h3>
              <div className="flex-1 overflow-y-auto space-y-1">
                {messages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-500">[{msg.time}]</span> {msg.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOnline;
