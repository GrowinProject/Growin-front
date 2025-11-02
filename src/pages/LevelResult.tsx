// src/pages/LevelResult.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEVEL_QUESTIONS } from "../data/levelQuestions";

type SavedAnswer = { questionId: string; choiceId: string | null };

export default function LevelResult() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);

  // 로컬 저장값 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem("level_answers");
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, []);

  // qid -> choiceId 매핑
  const answerMap = useMemo(() => {
    const m = new Map<string, string | null>();
    answers.forEach(a => m.set(a.questionId, a.choiceId ?? null));
    return m;
  }, [answers]);

  // 점수 계산
  const { correctCount } = useMemo(() => {
    let ok = 0;
    for (const q of LEVEL_QUESTIONS) {
      const picked = answerMap.get(q.id);
      if (picked && picked === q.correctId) ok++;
    }
    return { correctCount: ok };
  }, [answerMap]);

  const percent = Math.round((correctCount / LEVEL_QUESTIONS.length) * 100);

  // 배지/버튼 스타일
  const chip = (text: string, bg: string, color: string, border: string) => (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {text}
    </span>
  );

  // 보기 스타일 결정
  function choiceStyle(
    variant: "neutral" | "correct" | "wrong" | "answer"
  ): React.CSSProperties {
    const base: React.CSSProperties = {
      textAlign: "left",
      padding: "14px 16px",
      borderRadius: 12,
      fontSize: 16,
      fontWeight: 600,
      border: "1px solid #e5e7eb",
      background: "#fff",
    };
    if (variant === "correct") {
      base.border = "2px solid #22c55e";
      base.background = "#EAF8EF";
      base.color = "#14532d";
    } else if (variant === "wrong") {
      base.border = "2px solid #ef4444";
      base.background = "#FDECEC";
      base.color = "#7f1d1d";
    } else if (variant === "answer") {
      base.border = "2px solid #3b82f6";
      base.background = "#EFF6FF";
      base.color = "#1e3a8a";
    }
    return base;
  }

  return (
    <div className="screen">
      {/* 헤더 요약 */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, letterSpacing: -0.3 }}>
          레벨 테스트 결과
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {chip(`정답 ${correctCount}/${LEVEL_QUESTIONS.length}`, "#EEF2FF", "#1e40af", "#c7d2fe")}
          {chip(`${percent}%`, "#F1F5F9", "#0f172a", "#e2e8f0")}
        </div>
      </div>

      {/* 전체 6문항 렌더 */}
      <div style={{ display: "grid", gap: 16 }}>
        {LEVEL_QUESTIONS.map((q, i) => {
          const picked = answerMap.get(q.id) ?? null;
          const isCorrect = !!picked && picked === q.correctId;

          return (
            <div
              key={q.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 18,
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              {/* 상단 타이틀 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Question {String(i + 1).padStart(2, "0")} · {q.type}
                </div>
                {/* 맞/틀 배지 */}
                {isCorrect
                  ? chip("정답", "#EAF8EF", "#14532d", "#22c55e")
                  : chip("오답", "#FDECEC", "#7f1d1d", "#ef4444")}
              </div>

              {/* 질문 */}
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 12 }}>
                {q.prompt}
              </div>

              {/* 보 기 */}
              <div style={{ display: "grid", gap: 10 }}>
                {q.choices.map((c) => {
                  // 표시 규칙:
                  // - 정답이면: 선택한 보기(=정답)만 초록(correct)
                  // - 오답이면: 내가 고른 보기 빨강(wrong) + 정답 파랑(answer)
                  let variant: "neutral" | "correct" | "wrong" | "answer" = "neutral";
                  if (picked && picked === q.correctId) {
                    if (c.id === picked) variant = "correct";
                  } else {
                    if (picked && c.id === picked) variant = "wrong";
                    if (c.id === q.correctId) variant = "answer";
                  }

                  return (
                    <div key={c.id} style={choiceStyle(variant)}>
                      {c.text}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="stickyBottom" style={{ marginTop: 24 }}>
        <button className="ghostBtn" onClick={() => navigate("/level-test")}>
          다시 테스트하기
        </button>
        <button className="primaryBtn" onClick={() => navigate("/home")}>
          홈으로
        </button>
      </div>
    </div>
  );
}
