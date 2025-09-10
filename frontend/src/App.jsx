import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import GameOffline from "./page/GameOffline";
import GameOnline from "./page/GameOnline";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/GameOffline" element={<GameOffline />} />
        <Route path="/GameOnline" element={<GameOnline />} />
      </Routes>
    </Router>
  );
}
