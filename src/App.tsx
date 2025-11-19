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
import SummaryRead from "./pages/SummaryRead";
import SummaryQuizPage from "./pages/SummaryQuizPage";
import SummaryQuizResultPage from "./pages/SummaryQuizResultPage";
import ReviewHistoryPage from "./pages/ReviewHistoryPage";
import ArticleReviewPage from "./pages/ArticleReviewPage";
import SummaryReviewPage from "./pages/SummaryReviewPage";
import QuizSessionReviewPage from "./pages/QuizSessionReviewPage";

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
        {/* <Route path="/signup-page" element={<SignupPage />} /> */}
        <Route path="/summary/:category/:articleId/level/:level" element={<SummaryRead />} />
        <Route path="/summary/:category/:articleId/level/:level/quiz/:summaryId" element={<SummaryQuizPage />} />
        <Route
          path="/articles/:category/:articleId/level/:level/summaries/:summaryId/quiz/result"
          element={<SummaryQuizResultPage />}
        />
        <Route path="/review-history" element={<ReviewHistoryPage />} />
        <Route
          path="/articles/:articleId/review"
          element={<ArticleReviewPage />}
        />
        <Route
          path="/summaries/:summaryId/review"
          element={<SummaryReviewPage />}
        />
        <Route
          path="/quiz-sessions/:sessionId/results"
          element={<QuizSessionReviewPage />}
        />
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </div>
  )
}

export default App
