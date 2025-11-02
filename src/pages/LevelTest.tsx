// src/pages/LevelTest.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEVEL_QUESTIONS } from "../data/levelQuestions";

type Answer = { questionId: string; choiceId: string | null };

export default function LevelTest() {
  const navigate = useNavigate();
  const total = LEVEL_QUESTIONS.length; // 6
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const q = LEVEL_QUESTIONS[idx];
  const percent = useMemo(
    () => Math.round((idx / total) * 100),
    [idx, total]
  );

  function commit(choiceId: string | null) {
    const next = [...answers];
    // 현재 질문에 대한 기존 답 있으면 덮어쓰기
    const existing = next.findIndex((a) => a.questionId === q.id);
    if (existing >= 0) next[existing] = { questionId: q.id, choiceId };
    else next.push({ questionId: q.id, choiceId });
    setAnswers(next);
  }

  function handleChoice(choiceId: string) {
    setSelected(choiceId);
  }

  function handleNext() {
    commit(selected); // 선택 저장
    if (idx + 1 >= total) {
      // 결과 저장 후 완료 페이지로 이동
      try {
        localStorage.setItem("level_answers", JSON.stringify(answers.concat([{ questionId: q.id, choiceId: selected }])));
      } catch {}
      navigate("/level-complete");
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  function handleSkip() {
    setSelected(null);
    commit(null);
    if (idx + 1 >= total) {
      try {
        localStorage.setItem("level_answers", JSON.stringify(answers.concat([{ questionId: q.id, choiceId: null }])));
      } catch {}
      navigate("/level-complete");
      return;
    }
    setIdx((i) => i + 1);
  }

  return (
    <div className="screen">
      {/* 헤더 */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, letterSpacing: -0.3 }}>
          간단한 레벨 테스트를 진행할게요!
        </h2>
        <div className="progressWrap">
          <div
            className="progressBar"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
          {idx + 1} / {total}
        </div>
      </div>

      {/* 질문 카드 */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          marginTop: 16,
        }}
      >
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
          Question {String(idx + 1).padStart(2, "0")} · {q.type}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>
          {q.prompt}
        </div>

        {/* 선택지 */}
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {q.choices.map((c) => {
            const active = selected === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleChoice(c.id)}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: active ? "2px solid #5b7cfa" : "1px solid #e5e7eb",
                  background: active ? "#eef2ff" : "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {c.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="stickyBottom" style={{ marginTop: 24 }}>
        <button
          className="primaryBtn"
          onClick={handleNext}
          disabled={selected === null}
          style={{ opacity: selected === null ? 0.6 : 1 }}
        >
          다음으로
        </button>
        <button className="ghostBtn" onClick={handleSkip}>
          Skip &gt;
        </button>
      </div>
    </div>
  );
}
