import React, { useState, useEffect } from "react";

function ChatBox({ socket, roomId, player }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("chat_message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (message.trim() !== "" && socket) {
      socket.emit("chat_message", {
        room_id: roomId,
        player: player,
        text: message,
      });
      setMessage("");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 h-96 flex flex-col">
      <h3 className="font-bold mb-2"> Chat</h3>
      <div className="flex-1 overflow-y-auto border p-2 mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="text-sm">
            <b>{msg.player}:</b> {msg.text}
          </div>
        ))}
      </div>

      {/* Dùng form thay cho div */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded px-2 py-1 mr-2"
          placeholder="Nhập tin nhắn..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
