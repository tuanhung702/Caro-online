import React, { useState, useEffect, useRef } from 'react';
// Giả sử bạn truyền đối tượng socket (io.connect) vào qua props
// Và room_id cùng với player_name của người dùng hiện tại.

// Component ChatBox nhận các props cần thiết từ GameOnline.jsx
const ChatBox = ({ socket, roomId, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Ref để tự động cuộn xuống cuối hộp chat
  const messagesEndRef = useRef(null);

  // Hàm tự động cuộn xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Luôn cuộn xuống dưới khi có tin nhắn mới
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Lắng nghe sự kiện nhận tin nhắn từ backend
    const handleReceiveMessage = (msg) => {
      console.log('Received message:', msg);
      setMessages(prevMessages => [...prevMessages, msg]);
    };

    // Lắng nghe các tin nhắn hệ thống (người chơi rời/vào)
    const handleSystemMessage = (msg) => {
      const systemMsg = {
        user_name: 'Hệ thống',
        message: msg.message,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isSystem: true
      };
      setMessages(prevMessages => [...prevMessages, systemMsg]);
    };

    socket.on('receive_chat_message', handleReceiveMessage);
    socket.on('system_message', handleSystemMessage);

    // Cleanup khi component unmount
    return () => {
      socket.off('receive_chat_message', handleReceiveMessage);
      socket.off('system_message', handleSystemMessage);
    };
  }, [socket]); // Chỉ chạy lại khi đối tượng socket thay đổi

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();

    if (!socket || !roomId || !trimmedMessage) {
      // Có thể hiển thị lỗi nếu không kết nối hoặc tin nhắn rỗng
      console.error('Cannot send message: socket not ready or message is empty.');
      return;
    }

    // Gửi sự kiện tới backend
    socket.emit('send_chat_message', {
      room_id: roomId,
      message: trimmedMessage
      // player_name không cần thiết vì backend dùng request.sid để tìm tên
    });

    // Xóa nội dung input
    setInputMessage('');
  };

  // Hàm định dạng tin nhắn (người dùng hiện tại, người khác, hệ thống)
  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.user_name === playerName;
    
    // Tin nhắn hệ thống (player join/leave)
    if (msg.isSystem) {
      return (
        <div key={index} className="text-center text-sm italic text-gray-500 my-1">
          {msg.message}
        </div>
      );
    }

    // Tin nhắn của người dùng hiện tại
    const messageClass = isCurrentUser
      ? "bg-blue-500 text-white rounded-br-none self-end"
      : "bg-gray-200 text-gray-800 rounded-tl-none self-start";
    
    return (
      <div key={index} className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'} my-1`}>
        <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${messageClass}`}>
          {!isCurrentUser && (
            <div className="font-bold text-xs mb-1 opacity-80">
              {msg.user_name}
            </div>
          )}
          <p className="break-words">{msg.message}</p>
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} text-right`}>
            {msg.timestamp}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
      
      {/* Header Chat */}
      <div className="p-3 bg-indigo-600 text-white text-lg font-semibold shadow-inner">
        Chat Trận Đấu ({roomId})
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2" style={{ maxHeight: 'calc(100% - 100px)' }}>
        {messages.map(renderMessage)}
        {/* Dùng ref để cuộn xuống */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            placeholder="Nhập tin nhắn..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            required
            disabled={!socket || !roomId}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-300"
            disabled={!socket || !roomId || inputMessage.trim() === ''}
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
