import Cell from "./Cell";

function Board({ board, onClick }) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${board.length}, 30px)` }}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <Cell key={`${i}-${j}`} value={cell} onClick={() => onClick(i, j)} />
        ))
      )}
    </div>
  );
}

export default Board;
