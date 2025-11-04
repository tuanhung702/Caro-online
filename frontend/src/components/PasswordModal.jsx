export default function PasswordModal({ 
  show, 
  roomName, 
  password, 
  onPasswordChange, 
  onConfirm, 
  onCancel 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Nhập mật khẩu</h2>
        <p className="text-sm text-gray-600 mb-4">Phòng: <strong>{roomName}</strong></p>
        <div>
          <label className="block text-sm font-medium mb-2">Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onConfirm()}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mật khẩu phòng"
            autoFocus
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Xác nhận
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

