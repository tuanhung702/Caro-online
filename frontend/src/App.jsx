import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/Login";
import Register from "./page/Register";
import GameOnline from "./page/GameOnline";
import GameOffline from "./page/GameOffline";
import Home from "./page/Home";

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
       
        {/* Trang chơi game */}
        <Route path="/home" element={<Home />} />
        <Route path="/gameOffline" element={<GameOffline />} />
        <Route path="/gameonline" element={<GameOnline />} />
      </Routes>
    </Router>
  );
}

export default App;
