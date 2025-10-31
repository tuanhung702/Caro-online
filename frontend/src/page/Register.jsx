import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password || !form.confirm) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Lưu tạm vào LocalStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.username === form.username)) {
      setError("Tên đăng nhập đã tồn tại!");
      return;
    }

    users.push({ username: form.username, password: form.password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Đăng ký thành công!");
    navigate("/Login");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng ký</h1>
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
          className="w-full border p-2 mb-3 rounded"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full border p-2 mb-5 rounded"
          value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })}
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Đăng ký
        </button>

        <p className="text-center text-sm mt-4">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
