import { useState, useEffect } from "react";
import Board from "./Board";
import Status from "./Status";
import ChatBox from "./ChatBox";

export default function GameBoard({
  roomId,
  playerSymbol,
  players,
  board,
  currentPlayer,
  winner,
  gameStatus,
  messages,
  onCellClick,
  onLeaveRoom,
  onSurrender,
  onReturnToWaiting,
  socket,
  playerName, // Tên người chơi hiện tại (từ localStorage/currentUser)
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winMessage, setWinMessage] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [loserName, setLoserName] = useState("");
  const [isWinner, setIsWinner] = useState(false);

  const myPlayer = players.find((p) => p.symbol === playerSymbol) || {
    name: playerName,
    symbol: playerSymbol,
  };
  const opponentPlayer = players.find((p) => p.symbol !== playerSymbol);

  // Timer countdown 30s cho mỗi lượt đi
  useEffect(() => {
    if (gameStatus === "playing") {
      setTimeLeft(30);
      if (currentPlayer === playerSymbol) {
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      setTimeLeft(30);
    }
  }, [gameStatus, currentPlayer, playerSymbol]); // Logic hiển thị modal khi game kết thúc (Bị trigger bởi gameStatus === 'finished')

  useEffect(() => {
    if (gameStatus === "finished" && winner && !showWinModal) {
      // Tìm tên người chơi dựa trên symbol chiến thắng
      const winnerPlayer = players.find((p) => p.symbol === winner);
      const loserPlayer = players.find((p) => p.symbol !== winner);

      setWinnerName(winnerPlayer?.name || winner);
      setLoserName(loserPlayer?.name || (winner === "X" ? "O" : "X"));
      setIsWinner(winner === playerSymbol);
      setWinMessage(
        winner === playerSymbol
          ? `🎉 Chúc mừng! Bạn đã thắng ${loserPlayer?.name || "đối thủ"}!`
          : `😢 Thật tiếc! ${winnerPlayer?.name || "đối thủ"} đã thắng bạn!`
      );
      setShowWinModal(true);
    }

    // TẮT MODAL nếu gameStatus chuyển về 'playing' hoặc 'waiting'
    if (gameStatus !== "finished" && showWinModal) {
      setShowWinModal(false);
    }
  }, [gameStatus, winner, players, playerSymbol, showWinModal]);

  // Listen events (Chỉ cần giữ lại để đảm bảo socket không bị lỗi)
  useEffect(() => {
    if (!socket) return;

    // Hàm này chỉ cần đảm bảo các event không làm hỏng socket
    const noopHandler = () => {};

    socket.on("move_timeout", noopHandler);
    socket.on("surrender_result", noopHandler);
    socket.on("game_over", noopHandler);
    socket.on("opponent_left", noopHandler);

    return () => {
      socket.off("move_timeout", noopHandler);
      socket.off("surrender_result", noopHandler);
      socket.off("game_over", noopHandler);
      socket.off("opponent_left", noopHandler);
    };
  }, [socket, playerSymbol, players]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Caro Online</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Phòng: <strong>{roomId}</strong>
              </span>
              <span className="text-sm">
                Bạn là: <strong>{playerSymbol}</strong>
              </span>
              <button
                onClick={onLeaveRoom}
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
                {/* HIỂN THỊ THÔNG TIN NGƯỜI CHƠI */}
                {[myPlayer, opponentPlayer]
                  .filter((p) => p)
                  .map((player) => (
                    <div
                      key={player.symbol}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          player.symbol === "X" ? "bg-red-500" : "bg-blue-500"
                        }`}
                      >
                        {player.symbol}
                      </div>
                      {/* ✅ LẤY TÊN ĐÚNG CỦA MÌNH VÀ CỦA ĐỐI THỦ */}
                      <span
                        className={`text-sm mt-1 font-semibold ${
                          player.symbol === playerSymbol
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                      >
                        {player.symbol === playerSymbol
                          ? `(Bạn) ${player.name}`
                          : player.name}
                      </span>
                      {currentPlayer === player.symbol &&
                        gameStatus === "playing" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></div>
                        )}
                    </div>
                  ))}
              </div>
            </div>
            {/* Game Status */}
            <div className="mb-4">
              <Status xIsNext={currentPlayer === "X"} winner={winner} />

              {/* Timer (luôn giữ không gian cố định) */}
              <div className="mt-2 text-center h-14 flex flex-col justify-center">
                {gameStatus === "playing" && currentPlayer === playerSymbol ? (
                  <>
                    <div
                      className={`text-2xl font-bold ${
                        timeLeft <= 10
                          ? "text-red-600"
                          : timeLeft <= 20
                          ? "text-orange-500"
                          : "text-blue-600"
                      }`}
                    >
                      {timeLeft}s
                    </div>
                    <p className="text-sm text-gray-500">Thời gian còn lại</p>
                  </>
                ) : (
                  <div className="opacity-0">
                    <div className="text-2xl font-bold">00s</div>
                    <p className="text-sm">Thời gian còn lại</p>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Board */}
            <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
              <Board board={board} onClick={onCellClick} />
            </div>
            {/* Game Controls */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={onSurrender}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                disabled={gameStatus !== "playing"}
              >
                Đầu hàng
              </button>
            </div>
          </div>
          {/* Chat/Log Area */}
          <div className="w-80">
            {/* Chat Box */}
            <div className="w-80 mb-4">
              <ChatBox
                socket={socket}
                roomId={roomId}
                player={playerName || playerSymbol}
              />
            </div>
            {/* Messages */}
            <div className="bg-white shadow-lg rounded-lg p-4 h-96 flex flex-col">
              <h3 className="font-bold mb-2">Thông báo</h3>
              <div className="flex-1 overflow-y-auto space-y-1">
                {messages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-500">[{msg.time}]</span>{" "}
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal thông báo kết quả */}
      {showWinModal && gameStatus === "finished" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2
              className={`text-2xl font-bold mb-4 ${
                isWinner ? "text-green-600" : "text-red-600"
              }`}
            >
              {isWinner ? "🎉 CHIẾN THẮNG!" : "😢 THUA CUỘC"}
            </h2>
            <div className="mb-6">
              <p className="text-lg font-semibold mb-3">{winMessage}</p>
              <div className="text-sm text-gray-700 space-y-2 bg-gray-50 p-3 rounded">
                <p className="font-medium text-green-600">
                  Người thắng:{" "}
                  <strong className="text-lg">{winnerName || "N/A"}</strong>
                </p>
                <p className="font-medium text-red-600">
                  Người thua:{" "}
                  <strong className="text-lg">{loserName || "N/A"}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowWinModal(false);
                if (onReturnToWaiting) {
                  onReturnToWaiting();
                }
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Quay về phòng chờ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
