import React from "react";

function Board({ board, onClick }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${board.length}, 30px)`,
        gap: "2px",
      }}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <button
            key={`${i}-${j}`}
            onClick={() => onClick(i, j)}
            className="w-[30px] h-[30px] border border-gray-400 flex items-center justify-center text-xl font-bold"
          >
            <span
              className={
                cell === "X"
                  ? "text-blue-600" 
                  : cell === "O"
                  ? "text-red-600" 
                  : ""
              }
            >
              {cell}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

export default Board;
