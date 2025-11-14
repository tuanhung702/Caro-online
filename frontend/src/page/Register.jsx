// File: src/page/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5001";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.email || !form.password || !form.username) {
      setError("Vui lòng nhập đầy đủ Tên người dùng, Email và Mật khẩu!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Lỗi đăng ký không xác định.");
        return;
      }

      setSuccess(
        data.message || "Đăng ký thành công! Bạn có thể đăng nhập ngay."
      );
      setForm({ username: "", email: "", password: "" }); // Xóa form
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      setError("Không thể kết nối tới Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm transition duration-300 hover:shadow-xl"
      >
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">
          Đăng Ký Tài Khoản
        </h1>
        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
            {success}
          </p>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tên người dùng"
            className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
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
          className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng Ký"}
        </button>

        <p className="text-center text-sm mt-6 text-gray-600">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium hover:underline cursor-pointer transition duration-150"
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
