import { useState, useEffect } from "react";
import Board from "../components/Board";
import Status from "../components/Status";

function GameOffline() {
  const size = 20;
  const [board, setBoard] = useState(
    Array(size).fill().map(() => Array(size).fill(null))
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const handleClick = (row, col) => {
    if (board[row][col] || winner) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    if (checkWinner(newBoard, row, col)) {
      setWinner(newBoard[row][col]);
    }
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
  };

  useEffect(() => {
    if (winner) {
      alert(`Người chơi ${winner} đã chiến thắng!`);
    }
  }, [winner]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">CARO OFFLINE</h1>
      <div className="w-[600px] bg-white shadow-lg rounded p-4 mb-6 flex justify-between items-center">
        <div className="flex flex-col items-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616430.png"
            alt="Player X"
            className="w-16 h-16 mb-2"
          />
          <span className="font-bold">HOST (X)</span>
        </div>

        <span className="text-3xl font-bold">VS</span>

        <div className="flex flex-col items-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="Player O"
            className="w-16 h-16 mb-2"
          />
          <span className="font-bold">GUEST (O)</span>
        </div>
      </div>

      {/* Trạng thái và bàn cờ */}
      <Status xIsNext={xIsNext} winner={winner} />
      <Board board={board} onClick={handleClick} />

      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Chơi lại
      </button>
    </div>
  );
}

export default GameOffline;
