import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      u => u.username === form.username && u.password === form.password
    );

    if (!user) {
      setError("Tên đăng nhập hoặc mật khẩu sai!");
      return;
    }

    // Lưu trạng thái đăng nhập
    localStorage.setItem("currentUser", JSON.stringify(user));
    navigate("/home");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="w-full border p-2 mb-3 rounded"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border p-2 mb-5 rounded"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Đăng nhập
        </button>

        <p className="text-center text-sm mt-4">
          Chưa có tài khoản?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Đăng ký
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
