export default function CreateRoomModal({ 
  show, 
  roomName, 
  password, 
  onRoomNameChange, 
  onPasswordChange, 
  onCreate, 
  onCancel 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Tạo phòng mới</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tên phòng:</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => onRoomNameChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên phòng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu (tùy chọn):</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Để trống nếu không có mật khẩu"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCreate}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Tạo phòng
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

