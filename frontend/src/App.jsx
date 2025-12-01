import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/Login";
import Register from "./page/Register";
import GameOnline from "./page/GameOnline";
import GameOffline from "./page/GameOffline";
import Home from "./page/Home";
import Profile from "./page/Profile";
import Rank from "./page/Rank";
import History from "./page/History";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gameOffline"
          element={
            <ProtectedRoute>
              <GameOffline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gameonline"
          element={
            <ProtectedRoute>
              <GameOnline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rank"
          element={
            <ProtectedRoute>
              <Rank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
