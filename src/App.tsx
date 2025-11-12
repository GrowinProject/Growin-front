import { Routes, Route, Navigate } from "react-router-dom";
import LevelTest from "./pages/LevelTest";
import LevelComplete from "./pages/LevelComplete";
import LevelResult from "./pages/LevelResult";
import Home from "./pages/Home";
import DailyCategory from "./pages/DailyCategory";
import LoadingPage from "./pages/LoadingPage";
import ArticleRead from "./pages/ArticleRead";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/level-test" element={<LevelTest />} />
        <Route path="/level-complete" element={<LevelComplete />} />
        <Route path="/level-result" element={<LevelResult />} />
        <Route path="/home" element={<Home />} />
        <Route path="/daily" element={<DailyCategory />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/article" element={<ArticleRead />} />
        <Route path="/signup-page" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
