import { useState, useEffect } from "react";
import Board from "../components/Board";
import Status from "../components/Status";
import { findBestMove } from "../utils/aiMinimax";

function GameOffline() {
  const size = 20;
  const [board, setBoard] = useState(
    Array(size).fill().map(() => Array(size).fill(null))
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null); // null, 'pvp', 'pvc'
  const [aiThinking, setAiThinking] = useState(false);

  const handleClick = (row, col) => {
    if (board[row][col] || winner || aiThinking) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = xIsNext ? "X" : "O";
    setBoard(newBoard);

    if (checkWinner(newBoard, row, col)) {
      setWinner(newBoard[row][col]);
      return;
    }

    // Nếu chế độ PvC và người chơi vừa đi là X, AI (O) sẽ đi
    if (gameMode === 'pvc' && xIsNext) {
      setXIsNext(false);
      setAiThinking(true);
      // Delay để máy "suy nghĩ"
      setTimeout(() => {
        makeAIMove(newBoard);
      }, 500);
    } else {
      setXIsNext(!xIsNext);
    }
  };

  const makeAIMove = (currentBoard) => {
    const newBoard = currentBoard.map((r) => [...r]);
    const move = findBestMove(newBoard, 'O', 2);

    if (move) {
      const [row, col] = move;
      newBoard[row][col] = 'O';

      if (checkWinner(newBoard, row, col)) {
        setWinner('O');
        setAiThinking(false);
        return;
      }
    }

    setBoard(newBoard);
    setXIsNext(true);
    setAiThinking(false);
  };

  const checkWinner = (board, row, col) => {
    const player = board[row][col];
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1],
    ];

    for (let [dx, dy] of directions) {
      let count = 1;
      let r = row + dx, c = col + dy;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
        count++;
        r += dx; c += dy;
      }
      r = row - dx; c = col - dy;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
        count++;
        r -= dx; c -= dy;
      }

      if (count >= 5) return true;
    }
    return false;
  };

  const resetGame = () => {
    setBoard(Array(size).fill().map(() => Array(size).fill(null)));
    setWinner(null);
    setXIsNext(true);
    setGameMode(null);
    setAiThinking(false);
  };

  useEffect(() => {
    if (winner) {
      alert(`Người chơi ${winner} đã chiến thắng!`);
    }
  }, [winner]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
     <h2 className="text-6xl font-extrabold text-blue-700 mb-10 drop-shadow-lg">
          Caro Online
        </h2>

      {/* Chọn chế độ chơi */}
      {!gameMode && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">Chọn chế độ chơi</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setGameMode('pvp')}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
            >
               Người vs Người
            </button>
            <button
              onClick={() => setGameMode('pvc')}
              className="px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 font-semibold"
            >
               Người vs Máy
            </button>
          </div>
        </div>
      )}

      {gameMode && (
        <>
          <div className="w-[600px] bg-white shadow-lg rounded p-4 mb-6 flex justify-between items-center">
            <div className="flex flex-col items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/616/616430.png"
                alt="Player X"
                className="w-16 h-16 mb-2"
              />
              <span className="font-bold">Bạn (X)</span>
            </div>

            <span className="text-3xl font-bold">VS</span>

            <div className="flex flex-col items-center">
              <img
                src={gameMode === 'pvp' 
                  ? "https://cdn-icons-png.flaticon.com/512/616/616408.png"
                  : "https://cdn-icons-png.flaticon.com/512/4436/4436481.png"}
                alt={gameMode === 'pvp' ? "Player O" : "AI"}
                className="w-16 h-16 mb-2"
              />
              <span className="font-bold">{gameMode === 'pvp' ? 'Người chơi (O)' : 'Máy (O)'}</span>
            </div>
          </div>

          {/* Trạng thái và bàn cờ */}
          <Status xIsNext={xIsNext} winner={winner} />
          {aiThinking && gameMode === 'pvc' && (
            <p className="text-sm text-gray-600 mb-2">🤖 Máy đang suy nghĩ...</p>
          )}
          <Board board={board} onClick={handleClick} />

          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </>
      )}
    </div>
  );
}

export default GameOffline;
