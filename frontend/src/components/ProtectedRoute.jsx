import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  // Nếu chưa đăng nhập -> redirect về login
  if (!userId || !username) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập -> hiển thị component
  return children;
}
