import { Routes, Route, NavLink } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";

function App() {
  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px" }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <NavLink to="/" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>
          홈
        </NavLink>
        <NavLink to="/about" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>
          소개
        </NavLink>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
