// src/pages/QuizSessionReviewPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getQuizSessionResult,
  type QuizSessionResult,
  type QuizSessionQuestion,
  type QuizSessionOption,
} from "../lib/api";
import "@/mobile.css";
import "../styles/quiz.css"; // ⬅ 이미 사용 중인 quiz.css 경로 맞춰줘!

export default function QuizSessionReviewPage() {
  const nav = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [data, setData] = useState<QuizSessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("잘못된 접근입니다. (sessionId 없음)");
      setLoading(false);
      return;
    }

    const idNum = Number(sessionId);
    if (Number.isNaN(idNum)) {
      setError("잘못된 세션 ID입니다.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const result = await getQuizSessionResult(idNum);
        setData(result);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "불러오기 실패");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="quiz-page">
        <p>퀴즈 결과를 불러오는 중이에요...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <p>오류가 발생했어요 😢</p>
        <p style={{ marginTop: 4, fontSize: 13, color: "#777" }}>{error}</p>
        <button
          onClick={() => nav(-1)}
          className="quiz-back-btn"
        >
          ← 뒤로가기
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="quiz-page">
        <p>데이터가 없습니다.</p>
        <button onClick={() => nav(-1)} className="quiz-back-btn">
          ← 뒤로가기
        </button>
      </div>
    );
  }

  const { score, total_questions, questions } = data;

  return (
    <div className="screen quiz-page">
      {/* 상단 총점 카드 */}
      <header className="quiz-header">
        <h1 className="quiz-title">퀴즈 결과 내용이에요</h1>
        <div className="quiz-score-box">
          <span className="quiz-score-label">점수</span>
          <span className="quiz-score-value">
            {score} / {total_questions}
          </span>
        </div>
      </header>

      {/* 문제들 전체를 한 페이지에 쫙 */}
      <div className="quiz-question-list">
        {questions.map((q, idx) => (
          <QuestionReviewCard key={q.question_id} index={idx} question={q} />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="quiz-bottom">
        <button
          className="quiz-back-btn"
          type="button"
          onClick={() => nav(-1)}
        >
          ← 기사 복습으로
        </button>
      </div>
    </div>
  );
}

// 개별 문항 카드 컴포넌트
type QuestionReviewCardProps = {
  index: number;
  question: QuizSessionQuestion;
};

function QuestionReviewCard({ index, question }: QuestionReviewCardProps) {
  const { prompt, options, correct_option_id, selected_option_id, is_correct, explanation } =
    question;

  // 스타일 계산 함수
  const getOptionClass = (opt: QuizSessionOption) => {
    const base = "quiz-option";

    // 정답인 보기 → 파란색
    if (opt.option_id === correct_option_id) {
      return base + " quiz-option-correct";
    }

    // 내가 선택했는데 틀린 보기 → 빨간색
    if (
      selected_option_id &&
      opt.option_id === selected_option_id &&
      !is_correct
    ) {
      return base + " quiz-option-wrong";
    }

    // 나머지 보기 → 기본
    return base;
  };

  return (
    <section className="quiz-question-card">
      {/* 문제 번호 + 정오 표시 */}
      <div className="quiz-q-header">
        <div className="quiz-q-number">
          Q{index + 1}
        </div>
        <div className={`quiz-q-result ${is_correct ? "correct" : "wrong"}`}>
          {is_correct ? "정답 🎉" : "오답 😢"}
        </div>
      </div>

      {/* 지문 */}
      <div className="quiz-q-prompt">{prompt}</div>

      {/* 보기들 */}
      <div className="quiz-options">
        {options.map((opt) => {
          return (
            <div key={opt.option_id} className={getOptionClass(opt)}>
              <div className="quiz-option-main">
                <span className="quiz-option-label">{opt.label}.</span>
                <span className="quiz-option-text">{opt.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 해설 */}
      {explanation && (
        <div className="quiz-explanation">
          <span className="quiz-explanation-label">해설</span>
          <p className="quiz-explanation-text">{explanation}</p>
        </div>
      )}
    </section>
  );
}
