import { useState, useEffect } from "react";

export default function WaitingRoom({ 
  roomId, 
  players = [], 
  playerSymbol, 
  socket, 
  onLeave, 
  onOpponentLeft 
}) {
  const [isReady, setIsReady] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winMessage, setWinMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handlePlayerReady = (data) => {
      // Cập nhật danh sách players với ready state
      if (data.players) {
        const currentPlayer = data.players.find(p => p.symbol === playerSymbol);
        if (currentPlayer && currentPlayer.ready) {
          setIsReady(true);
        }
      }
    };

    const handleOpponentLeft = (data) => {
      setWinMessage(data.message);
      setShowWinModal(true);
      if (onOpponentLeft) onOpponentLeft(data);
    };

    socket.on('player_ready', handlePlayerReady);
    socket.on('opponent_left', handleOpponentLeft);

    return () => {
      socket.off('player_ready', handlePlayerReady);
      socket.off('opponent_left', handleOpponentLeft);
    };
  }, [socket, playerSymbol, onOpponentLeft]);

  const handleReady = () => {
    if (!socket || isReady) return;
    socket.emit('ready_to_play', { room_id: roomId });
    setIsReady(true);
  };

  const allReady = players && players.length === 2 && players.every(p => p && p.ready);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold mb-6">Phòng chờ</h1>
          <p className="text-gray-600 mb-4">Phòng: <strong>{roomId}</strong></p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Người chơi trong phòng:</h3>
            {players && players.length > 0 ? (
            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={index} className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    player.symbol === 'X' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    {player.symbol}
                  </div>
                  <span className="font-medium">{player.name}</span>
                  {player.ready ? (
                    <span className="text-green-600 font-semibold">✓ Sẵn sàng</span>
                  ) : (
                    <span className="text-gray-400"></span>
                  )}
                </div>
              ))}
            </div>
            ) : (
              <p className="text-gray-500 mt-4">Đang tải thông tin người chơi...</p>
            )}
            {players && players.length < 2 && (
              <p className="text-gray-500 mt-4">Đang chờ người chơi thứ 2...</p>
            )}
          </div>

          {/* Nút Sẵn sàng */}
          {players && players.length === 2 && !isReady && (
            <button
              onClick={handleReady}
              className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition text-lg font-semibold mb-3"
            >
              Sẵn sàng
            </button>
          )}

          {isReady && players && !allReady && (
            <div className="mb-4">
              <p className="text-green-600 font-semibold">Bạn đã sẵn sàng! Đang chờ đối thủ...</p>
            </div>
          )}

          <button
            onClick={onLeave}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            Rời phòng
          </button>
        </div>
      </div>

      {/* Modal thông báo thắng */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">🎉 CHIẾN THẮNG!</h2>
            <p className="text-lg mb-6">{winMessage}</p>
            <button
              onClick={() => {
                setShowWinModal(false);
                onLeave();
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
    </>
  );
}
