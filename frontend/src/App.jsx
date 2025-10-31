import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/Login";
import Register from "./page/Register";
import GameOnline from "./page/GameOnline";
import Home from "./page/Home";
import Room from "./page/Room";
function App() {
  return (
    <Router>
      <Routes>
        {/* Khi vào trang gốc "/", tự động chuyển sang /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Trang đăng ký */}
        <Route path="/register" element={<Register />} />
          <Route path="/room" element={<Room />} />
        {/* Trang chơi game */}
        <Route path="/home" element={<Home />} />
        <Route path="/gameonline" element={<GameOnline />} />
      </Routes>
    </Router>
  );
}

export default App;
