# 🎮 HƯỚNG DẪN CHƠI CARO ONLINE

## 📋 Mục lục

1. [Cài đặt và chạy local](#cài-đặt-và-chạy-local)
2. [Chơi online từ xa](#chơi-online-từ-xa)
3. [Troubleshooting](#troubleshooting)
4. [Các tính năng game](#các-tính-năng-game)

---

## 🏠 Cài đặt và chạy local

### Bước 1: Cài đặt Backend

```bash
cd backend
pip install -r requirements.txt
python3 app.py
```

Backend sẽ chạy trên `http://localhost:5001`

### Bước 2: Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy trên `http://localhost:5173`

### Bước 3: Chơi local

1. Mở trình duyệt và truy cập `http://localhost:5173`
2. Click "GAME OFFLINE" để chơi 1 mình
3. Hoặc click "PLAY NOW" để test online với 2 tab

---

## 🌐 Chơi online từ xa

### Phương pháp 1: Sử dụng ngrok (Khuyến nghị)

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### Bước 4: Tạo file cấu hình ngrok

Tạo file `ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  backend:
    addr: 5001
    proto: http
  frontend:
    addr: 5173
    proto: http
```

#### Bước 5: Chạy tất cả services

**Terminal 1 - Backend:**

```bash
cd backend
python3 app.py
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Terminal 3 - Ngrok:**

```bash
ngrok start --all --config=ngrok.yml
```

#### Bước 6: Chia sẻ với bạn bè

1. Copy URL ngrok của frontend (ví dụ: `https://abc123.ngrok.io`)
2. Gửi cho bạn bè
3. Họ truy cập URL đó để chơi cùng!

### Phương pháp 2: Sử dụng mạng nội bộ

#### Khi bạn bè cùng mạng WiFi:

1. Chạy backend và frontend như bình thường
2. Chia sẻ URL: `http://192.168.1.2:5173/` (IP của bạn)
3. Bạn bè truy cập URL đó

---

## 🎮 Cách chơi game

### Game Offline

1. Click "GAME OFFLINE"
2. Chơi 1 mình với 2 ký tự X và O
3. Thắng khi có 5 ô liên tiếp

### Game Online

1. **Host (Người tạo phòng):**

   - Click "PLAY NOW"
   - Nhập tên người chơi
   - Click "Tạo phòng mới"
   - Chia sẻ mã phòng cho bạn bè

2. **Guest (Người tham gia):**

   - Click "PLAY NOW"
   - Nhập tên người chơi
   - Click "Tham gia phòng"
   - Nhập mã phòng
   - Click "Tham gia"

3. **Bắt đầu chơi:**
   - Cả 2 người sẽ thấy màn hình "Sẵn sàng bắt đầu!"
   - Một trong 2 người click "BẮT ĐẦU GAME"
   - Cả 2 người chuyển vào bàn cờ
   - Lần lượt đánh X và O
   - Thắng khi có 5 ô liên tiếp

---

## 🔧 Troubleshooting

### Lỗi "Failed to resolve import socket.io-client"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Lỗi "Blocked request" với ngrok

Sửa file `frontend/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "192.168.1.2",
      ".ngrok-free.app",
      ".ngrok.io",
    ],
  },
});
```

### Lỗi "authentication failed" với ngrok

1. Kiểm tra auth token có đúng không
2. Chạy lại: `ngrok config add-authtoken YOUR_AUTH_TOKEN`

### Lỗi "Your account is limited to 1 simultaneous ngrok agent"

- Sử dụng file cấu hình `ngrok.yml` thay vì chạy nhiều lệnh ngrok

### Game không đồng bộ

1. Kiểm tra backend có chạy không
2. Kiểm tra ngrok có hoạt động không
3. Restart tất cả services

---

## ✨ Các tính năng game

### Tính năng chính

- ✅ Game offline 1 người
- ✅ Game online 2 người
- ✅ Tạo phòng và tham gia phòng
- ✅ Chat/Thông báo real-time
- ✅ Kiểm tra thắng thua tự động
- ✅ Reset game
- ✅ Responsive design

### Luật chơi

- Bàn cờ 20x20
- Thắng khi có 5 ô liên tiếp (ngang, dọc, chéo)
- Lần lượt đánh X và O
- Không được đánh vào ô đã có

---

## 📱 Hướng dẫn cho người mới

### Lần đầu chạy:

1. Cài đặt Python 3.8+
2. Cài đặt Node.js 16+
3. Clone project
4. Chạy theo hướng dẫn trên

### Chia sẻ với bạn bè:

1. Sử dụng ngrok để tạo URL public
2. Chia sẻ URL cho bạn bè
3. Hướng dẫn họ tham gia phòng

### Tips:

- Giữ tất cả terminals chạy khi chơi online
- URL ngrok thay đổi mỗi lần restart
- Có thể chơi trên mobile qua ngrok
- Sử dụng ngrok pro để có URL cố định

---

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra tất cả services có chạy không
2. Kiểm tra console logs
3. Restart tất cả services
4. Kiểm tra firewall/antivirus

**Chúc bạn chơi vui vẻ!** 🎯🎮
