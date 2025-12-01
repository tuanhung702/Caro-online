// File: src/page/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Backend trả về { success: True/False, message, user_id, username, email }
      if (!data || data.success === false) {
        setError((data && data.message) || "Lỗi đăng nhập không xác định.");
        return;
      }

      // ✅ Lưu thông tin người dùng
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);

      navigate("/home");
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      setError(
        "Không thể kết nối tới Backend. Vui lòng kiểm tra server và cổng."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm transition duration-300 hover:shadow-xl"
      >
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">
          Đăng nhập
        </h1>

        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 animate-shake transition-all duration-300">
            {error}
          </p>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.email || !form.password}
          className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 ${
            loading || !form.email || !form.password
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
          }`}
        >
          {loading ? "Đang xác thực..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm mt-6 text-gray-600">
          Chưa có tài khoản?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 font-medium hover:underline cursor-pointer transition duration-150"
          >
            Đăng ký ngay
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
