import { useState } from "react";
import Board from "./components/Board";
import Status from "./components/Status";

function App() {
  const size = 20; // kích thước bàn cờ (có thể chỉnh 50x50)
  const [board, setBoard] = useState(Array(size).fill().map(() => Array(size).fill(null)));
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
      [1, 0], [0, 1], [1, 1], [1, -1], // dọc, ngang, chéo
    ];

    for (let [dx, dy] of directions) {
      let count = 1;

      // kiểm tra xuôi
      let r = row + dx, c = col + dy;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
        count++;
        r += dx; c += dy;
      }

      // kiểm tra ngược
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

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Caro Offline 🎮</h1>
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

export default App;
