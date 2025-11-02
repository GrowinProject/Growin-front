import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import LevelTest from "./pages/LevelTest";
import LevelComplete from "./pages/LevelComplete";
import LevelResult from "./pages/LevelResult";
import Home from "./pages/Home";
import DailyCategory from "./pages/DailyCategory";

function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/level-test" element={<LevelTest />} />
        <Route path="/level-complete" element={<LevelComplete />} />
        <Route path="/level-result" element={<LevelResult />} />
        <Route path="/home" element={<Home />} />
        <Route path="/daily" element={<DailyCategory />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
