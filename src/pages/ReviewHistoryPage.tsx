// src/pages/ReviewHistoryPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReviewHistory, type ReviewHistoryItem } from "../lib/api";
import "../styles/review.css";

// 날짜 포맷 함수 (이미 만들어뒀으면 중복 정의 말고 기존 거 써도 돼!)
function formatReviewDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export default function ReviewHistoryPage() {
  const nav = useNavigate();

  const [items, setItems] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getReviewHistory();
        setItems(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "불러오기 실패");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="screen review-page">
        <p>복습 내역을 불러오는 중이에요...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-page">
        <p>오류가 발생했어요 😢</p>
        <p style={{ marginTop: 4, fontSize: 13, color: "#777" }}>{error}</p>
        <button
          onClick={() => nav(-1)}
          style={{
            marginTop: 16,
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← 뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="screen review-page">
      <h1 className="review-header-title">복습을 시작해볼까요?</h1>
      <p className="review-header-sub">최근에 풀었던 퀴즈들이에요</p>

      {items.length === 0 ? (
        <p style={{ fontSize: 14, color: "#777" }}>
          아직 복습 기록이 없어요. 퀴즈를 풀고 다시 돌아와 주세요!
        </p>
      ) : (
        <div className="review-list">
          {items.map((item) => (
            <div
              key={item.quiz_id}
              className="review-card"
              onClick={() => {
                nav(`/articles/${item.article_id}/review`);
              }}
            >
              {/* 썸네일 */}
              <div className="review-thumb-wrap">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="review-thumb"
                  />
                ) : (
                  <span>NEWS</span>
                )}
              </div>

              {/* 텍스트 + 날짜 + 점수 */}
              <div className="review-main">
                <div className="review-title">{item.title}</div>

                <div className="review-meta-row">
                  <div className="review-date">
                    복습 날짜: {formatReviewDate(item.last_reviewed_at)}
                  </div>
                  <div className="review-score-badge">
                    {item.score}/{item.total_questions}
                  </div>
                </div>
              </div>

              {/* 화살표 */}
              <div className="review-arrow">›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
