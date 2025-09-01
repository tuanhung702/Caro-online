function Cell({ value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-[30px] h-[30px] border border-gray-400 flex items-center justify-center text-lg font-bold"
    >
      {value}
    </button>
  );
}

export default Cell;
