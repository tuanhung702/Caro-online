function Status({ xIsNext, winner }) {
    let status;
    if (winner) {
      status = `Người thắng: ${winner}`;
    } else {
      status = `Lượt đi: ${xIsNext ? "X" : "O"}`;
    }
  
    return <div className="mb-2 text-xl">{status}</div>;
  }
  
  export default Status;
  