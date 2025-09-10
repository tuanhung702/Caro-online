# 🎮 Hướng dẫn chơi Caro Online từ xa

## 🚀 Cách 1: Sử dụng ngrok (Đơn giản nhất)

### Bước 1: Khởi động Backend

```bash
cd backend
python3 app.py
```

### Bước 2: Khởi động Frontend (Terminal mới)

```bash
cd frontend
npm run dev
```

### Bước 3: Khởi động ngrok (Terminal mới)

ngrok start --all --config=ngrok.yml

### Bước 4: Chia sẻ URL

- Copy URL ngrok của frontend (ví dụ: `https://abc123.ngrok.io`)
- Gửi cho bạn bè
- Họ truy cập URL đó để chơi cùng bạn!

## 🌐 Cách 2: Deploy lên server (Lâu dài)

### Sử dụng Vercel (Frontend)

1. Push code lên GitHub
2. Kết nối với Vercel
3. Deploy frontend

### Sử dụng Railway/Heroku (Backend)

1. Tạo account Railway/Heroku
2. Deploy backend
3. Cập nhật URL trong frontend

## 📱 Cách chơi từ xa

1. **Bạn (Host):**

   - Tạo phòng mới
   - Chia sẻ URL ngrok cho bạn bè

2. **Bạn bè:**
   - Truy cập URL ngrok
   - Tham gia phòng bằng mã phòng
   - Bắt đầu chơi!

## ⚠️ Lưu ý

- **ngrok miễn phí:** URL thay đổi mỗi lần restart
- **ngrok pro:** URL cố định, tốt hơn cho sử dụng lâu dài
- **Bảo mật:** Chỉ chia sẻ với người tin tưởng
- **Tốc độ:** Phụ thuộc vào kết nối internet

##

    // Kết nối tới server
    // Kết nối tới server - sử dụng backend ngrok
    const serverUrl = 'https://6da4b3eccce2.ngrok-free.app';
    console.log('Connecting to server:', serverUrl);
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
