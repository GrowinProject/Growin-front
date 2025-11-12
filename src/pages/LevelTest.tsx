// src/pages/LevelTest.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEVEL_QUESTIONS } from "../data/levelQuestions";

// levelQuestions.ts에 Difficulty가 있다면 타입 가져와서 써도 되고,
// 여기서는 문자열 union 그대로 사용
type Answer = { questionId: string; choiceId: string | null };

// ✅ 난이도별 가중치 (필요시 자유롭게 조정 가능)
const WEIGHT: Record<"beginner" | "intermediate" | "advanced", number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// ✅ 점수 계산: 정답이면 해당 문제 난이도 가중치만큼 득점
function computeScore(answers: Answer[]) {
  let score = 0;
  let maxScore = 0;

  for (const q of LEVEL_QUESTIONS) {
    const ans = answers.find((a) => a.questionId === q.id);
    const w = WEIGHT[q.difficulty as keyof typeof WEIGHT] ?? 1;

    // 최대점(분모)은 모든 문제 가중치 합
    maxScore += w;

    // 정답 체크
    if (ans?.choiceId && q.correctId && ans.choiceId === q.correctId) {
      score += w;
    }
  }

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percent };
}

// ✅ 레벨 산출 규칙 (예시)
// - 75% 이상: 고급(3)
// - 40% 이상: 중급(2)
// - 그 미만:  초급(1)
function computeLevel(percent: number) {
  if (percent >= 75) return 3;
  if (percent >= 40) return 2;
  return 1;
}

export default function LevelTest() {
  const navigate = useNavigate();
  const total = LEVEL_QUESTIONS.length; // 6
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const q = LEVEL_QUESTIONS[idx];
  const percent = useMemo(() => Math.round((idx / total) * 100), [idx, total]);

  function commit(choiceId: string | null) {
    const next = [...answers];
    // 현재 질문에 대한 기존 답 있으면 덮어쓰기
    const existing = next.findIndex((a) => a.questionId === q.id);
    if (existing >= 0) next[existing] = { questionId: q.id, choiceId };
    else next.push({ questionId: q.id, choiceId });
    setAnswers(next);
    return next; // ✅ 다음 단계에서 즉시 계산에 활용하려고 반환
  }

  function finalizeAndGo(nextAnswers: Answer[]) {
    // ✅ 점수/레벨 계산
    const { score, maxScore, percent } = computeScore(nextAnswers);
    const level = computeLevel(percent);

    // ✅ 로컬 저장 (결과 화면 및 이후 로직에서 사용)
    const payload = {
      answers: nextAnswers,
      result: { score, maxScore, percent, level }, // level: 1|2|3
    };
    try {
      localStorage.setItem("level_result", JSON.stringify(payload));
    } catch {}

    // ✅ 결과 페이지로 이동 (여기서는 아직 서버 PATCH 안 함)
    navigate("/level-complete");
  }

  function handleChoice(choiceId: string) {
    setSelected(choiceId);
  }

  function handleNext() {
    const next = commit(selected); // 선택 저장
    if (idx + 1 >= total) {
      // ✅ 마지막 문제면 결과 계산/저장
      finalizeAndGo(next);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  function handleSkip() {
    setSelected(null);
    const next = commit(null);
    if (idx + 1 >= total) {
      finalizeAndGo(next);
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
        <div className="progressWrap" style={{ height: 8, background: "#eef2f7", borderRadius: 999 }}>
          <div
            className="progressBar"
            style={{
              width: `${percent}%`,
              height: 8,
              background: "#5b7cfa",
              borderRadius: 999,
              transition: "width .25s ease",
            }}
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
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, whiteSpace: "pre-line" }}>
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
                  cursor: "pointer",
                }}
              >
                {c.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="stickyBottom" style={{ marginTop: 24, display: "flex", gap: 10 }}>
        <button
          className="primaryBtn"
          onClick={handleNext}
          disabled={selected === null}
          style={{
            opacity: selected === null ? 0.6 : 1,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#5b7cfa",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            cursor: selected === null ? "not-allowed" : "pointer",
          }}
        >
          다음으로
        </button>
        <button
          className="ghostBtn"
          onClick={handleSkip}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fff",
            color: "#374151",
            fontWeight: 700,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          Skip &gt;
        </button>
      </div>
    </div>
  );
}
