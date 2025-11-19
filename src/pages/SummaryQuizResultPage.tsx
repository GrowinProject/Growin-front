// src/pages/SummaryQuizResultPage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { QuizSubmitResponse } from "../lib/api";
import "../styles/quiz.css";

// SummaryQuizPage.tsx에서 쓰던 타입 재사용용 (간단 버전)
type QuizOption = {
  option_id: number;
  label: string;
  text: string;
};

type QuizQuestion = {
  question_id: number;
  question_type: string;
  prompt: string;
  options: QuizOption[];
};

type QuizData = {
  summary_id: number;
  quiz_id: number;
  question_count: number;
  questions: QuizQuestion[];
};

type ResultData = QuizSubmitResponse["data"];

type LocationState = {
  result: ResultData;
  quiz: QuizData;
  meta?: {
    category?: string;
    articleId?: string;
    level?: string;
  };
};

export default function SummaryQuizResultPage() {
  const nav = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // ❗ 새로고침하면 state가 날아갈 수 있으니까 대비용 처리
  if (!state) {
    return (
      <div className="screen quizPage">
        <p>결과 데이터가 없습니다. 다시 퀴즈를 풀어주세요.</p>
        <button className="secondaryBtn" onClick={() => nav(-1)}>
          ← 이전 화면으로
        </button>
      </div>
    );
  }

  const { result, quiz, meta } = state;
  const [index, setIndex] = useState(0);

  const currentResult = result.results[index];
  const currentQuestion = quiz.questions.find(
    (q) => q.question_id === currentResult.question_id
  );

  if (!currentQuestion) {
    return (
      <div className="screen quizPage">
        <p>해당 결과에 맞는 문제를 찾을 수 없어요.</p>
        <button className="secondaryBtn" onClick={() => nav(-1)}>
          ← 이전 화면으로
        </button>
      </div>
    );
  }

  const isCorrect = currentResult.is_correct;
  const total = result.total_questions;
  const currentNumber = index + 1;

  return (
    <div className="screen quizPage">
      {/* 상단: 정답/오답 + 점수 + 진행도 */}
      <header className="quizHeader">
        <h2 className="quizResultTitle">
          {isCorrect ? "정답이에요! ✅" : "아쉬워요 😢"}
        </h2>
        <p className="quizResultScore">
          점수: {result.score} / {result.total_questions}
        </p>
        {meta && (
          <p className="quizMeta">
            <span>{meta.category}</span>{" "}
            <span>Article {meta.articleId}</span>{" "}
            <span>LEVEL {meta.level}</span>
          </p>
        )}
        <div className="quizProgressBarWrap">
          <div className="quizProgressTop">
            {currentNumber} / {total}
          </div>
          <div className="quizProgressBarBg">
            <div
              className="quizProgressBarFill"
              style={{
                width: `${(currentNumber / total) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* 문제 카드 */}
      <main className="quizList">
        <section className="quizItem">
          <div className="quizQHeader">
            <span className="quizQNumber">
              Question <span style={{ color: "#3276EB" }}>
                0{currentNumber}
              </span>
            </span>
            <span className="quizQType">{currentQuestion.question_type}</span>
          </div>
          <div className="quizPrompt">{currentQuestion.prompt}</div>

          <div className="quizOptions">
            {currentQuestion.options.map((opt) => {
              const selected =
                currentResult.selected_option_id === opt.option_id;
              const correct =
                currentResult.correct_option_id === opt.option_id;

              let extraClass = "";
              if (correct) extraClass = " quizOptionCorrect";
              if (selected && !correct)
                extraClass = " quizOptionWrongSelected";
              if (selected && correct)
                extraClass = " quizOptionCorrectSelected";

              return (
                <div
                  key={opt.option_id}
                  className={"quizOptionBtn result" + extraClass}
                >
                  <span className="quizOptionText">{opt.text}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 해설 카드 */}
        <section className="quizExplanationCard">
          <h3 className="quizExplanationTitle">문제 해설</h3>
          <p className="quizExplanationText">
            {currentResult.explanation}
          </p>
        </section>
      </main>

      {/* 하단 버튼: 다음 / 완료 / Skip */}
      <div className="stickyBottom">
        <button
          type="button"
          className="primaryBtn"
          onClick={() => {
            if (index < total - 1) {
              setIndex((prev) => prev + 1);
            } else {
              nav("/home")
            }
          }}
        >
          {index < total - 1 ? "다음으로" : "완료"}
        </button>

        <button
          type="button"
          className="secondaryBtn"
          style={{ marginTop: 8 }}
          onClick={() => nav(-1)}
        >
          문제풀이 Skip &gt;
        </button>
      </div>
    </div>
  );
}
