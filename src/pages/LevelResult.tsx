// src/pages/LevelResult.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserLevel } from "../lib/api";
import { LEVEL_QUESTIONS } from "../data/levelQuestions";

/* ---------- 타입 ---------- */
type Answer = { questionId: string; choiceId: string | null };

type ResultPayload = {
  answers: Answer[];
  result: { score: number; maxScore: number; percent: number; level: 1 | 2 | 3 };
};

/* ---------- 로컬 저장 헬퍼 ---------- */
function getLocalResult(): ResultPayload | null {
  try {
    const raw = localStorage.getItem("level_result");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getUser(): any | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ---------- UI 헬퍼 ---------- */
function chip(label: string, bg: string, text: string, border: string) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        color: text,
        border: `1px solid ${border}`,
      }}
    >
      {label}
    </span>
  );
}

type Variant = "neutral" | "correct" | "wrong" | "answer";
function choiceStyle(variant: Variant) {
  const base: React.CSSProperties = {
    padding: "14px 16px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  if (variant === "correct") {
    return { ...base, background: "#EAF8EF", border: "1.5px solid #22c55e", boxShadow: "none" };
  }
  if (variant === "wrong") {
    return { ...base, background: "#FDECEC", border: "1.5px solid #ef4444", boxShadow: "none" };
  }
  if (variant === "answer") {
    return { ...base, background: "#EEF6FF", border: "1.5px solid #60a5fa", boxShadow: "none" };
  }
  return base;
}

/* ---------- 페이지 ---------- */
export default function LevelResult() {
  const navigate = useNavigate();

  const data = useMemo(() => getLocalResult(), []);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = useMemo(() => getUser(), []);
  const calledRef = useRef(false); // StrictMode에서 중복 PATCH 방지

  // 결과가 없으면 다시 테스트로
  useEffect(() => {
    if (!data) navigate("/level-test", { replace: true });
  }, [data, navigate]);

  // 서버 PATCH: 항상 시도하고, 409도 성공처럼 처리 → 이후 로컬 동기화
  useEffect(() => {
    console.log("[LR] effect start");
    console.log("[LR] data:", data);
    console.log("[LR] user:", user);

    if (!data) return;
    if (!user || typeof user.user_id !== "number") {
      console.warn("[LR] no user or invalid user_id");
      setError("로그인 정보를 찾을 수 없어요. 다시 로그인해주세요.");
      return;
    }

    // StrictMode 중복 호출 방지
    if (calledRef.current) return;
    calledRef.current = true;

    console.log("[LR] calling updateUserLevel", { uid: user.user_id, lvl: data.result.level });

    (async () => {
      try {
        setSaving(true);
        await updateUserLevel({ user_id: user.user_id, level: data.result.level });
        console.log("[LR] PATCH ok");
        setSavedMsg("레벨 저장 완료!");
      } catch (e: any) {
        if (e?.message === "LEVEL_ALREADY_ASSIGNED" || e?.code === 409) {
          // 이미 저장된 상태 → 성공 취급
          setSavedMsg("이미 설정된 레벨입니다.");
        } else {
          setError(e?.message || "레벨 저장에 실패했어요.");
          return; // 실패 시 아래 로컬 동기화는 건너뜀
        }
      } finally {
        setSaving(false);
      }

      // 성공(200) 또는 409일 때만 로컬 user.level 동기화 + 다음부터 스킵
      try {
        const updated = { ...user, level: data.result.level };
        localStorage.setItem("user", JSON.stringify(updated));
        localStorage.setItem("level_done", "1");
      } catch {}
    })();
  }, [data, user]);

  if (!data) return null;

  // 선택 답안 조회 맵
  const answerMap = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const a of data.answers) m.set(a.questionId, a.choiceId);
    return m;
  }, [data.answers]);

  const { score, maxScore, percent, level } = data.result;

  return (
    <div className="screen">
      {/* 상단 요약 */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, letterSpacing: -0.3 }}>레벨 테스트 결과</h2>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          점수 <b>{score}</b> / {maxScore} ({percent}%) ·{" "}
          <b>{level === 1 ? "초급" : level === 2 ? "중급" : "고급"}</b> 레벨입니다.
        </div>

        {/* 저장 상태 메시지 */}
        <div style={{ marginTop: 8, minHeight: 22 }}>
          {saving && <span style={{ color: "#2563eb" }}>서버에 저장 중...</span>}
          {!saving && savedMsg && <span style={{ color: "#16a34a" }}>✅ {savedMsg}</span>}
          {!saving && error && <span style={{ color: "#ef4444" }}>❌ {error}</span>}
        </div>
      </div>

      {/* 문제별 결과 카드 */}
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Question {String(i + 1).padStart(2, "0")} · {q.type}
                </div>
                {isCorrect
                  ? chip("정답", "#EAF8EF", "#14532d", "#22c55e")
                  : chip("오답", "#FDECEC", "#7f1d1d", "#ef4444")}
              </div>

              {/* 질문 */}
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 12 }}>
                {q.prompt}
              </div>

              {/* 보기 */}
              <div style={{ display: "grid", gap: 10 }}>
                {q.choices.map((c) => {
                  let variant: Variant = "neutral";
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
        {/* <button className="ghostBtn" onClick={() => navigate("/level-test")}>
          다시 테스트하기
        </button> */}
        <button className="primaryBtn" onClick={() => navigate("/home")}>
          홈으로
        </button>
      </div>
    </div>
  );
}