#!/bin/bash

# Script để chạy ngrok cho backend và frontend

echo "🚀 Đang khởi động ngrok..."

# Chạy ngrok cho backend (port 5001)
echo "📡 Tạo tunnel cho backend (port 5001)..."
ngrok http 5001 --log=stdout > ngrok_backend.log 2>&1 &
BACKEND_PID=$!

# Chạy ngrok cho frontend (port 5173)  
echo "🌐 Tạo tunnel cho frontend (port 5173)..."
ngrok http 5173 --log=stdout > ngrok_frontend.log 2>&1 &
FRONTEND_PID=$!

# Đợi ngrok khởi động
sleep 3

echo "✅ Ngrok đã khởi động!"
echo ""
echo "🔗 URLs để chia sẻ:"
echo "Backend:  $(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)"
echo "Frontend: $(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | tail -1 | cut -d'"' -f4)"
echo ""
echo "📱 Gửi URL Frontend cho bạn bè để họ có thể chơi cùng!"
echo ""
echo "⏹️  Nhấn Ctrl+C để dừng ngrok"

# Giữ script chạy
wait
