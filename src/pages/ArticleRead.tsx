// src/pages/ArticleRead.tsx
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Article, Category, Keyword as ApiKeyword } from "../lib/api";
import KeywordHighlighter from "../components/KeywordHighlighter";
import { IoMdTime } from "react-icons/io";
import "@/mobile.css";

type StateShape = {
  data?: {
    article: Article;
    category: Category;
    keywords: ApiKeyword[];
  };
};

export default function ArticleRead() {
  const [articleData, setArticleData] = useState<any>(null);
  const userLevel = 1;

  useEffect(() => {
    fetch("https://your-backend-domain.com/articles/random", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        console.log("📰 전체 응답:", json);
        console.log("📄 기사 데이터:", json.data.article);
        console.log("🕒 저장 시간(created_at):", json.data.article.created_at);
        console.log("📂 카테고리:", json.data.category);
        console.log("🔑 키워드 목록:", json.data.keywords);
        setArticleData(json.data);
      })
      .catch((err) => console.error("❌ 기사 로드 실패:", err));
  }, []);

  const nav = useNavigate();
  const loc = useLocation() as { state?: StateShape };

  // 1) state 우선, 없으면 세션에서 복구
  const data = useMemo(() => {
    if (loc.state?.data) return loc.state.data;
    const raw = sessionStorage.getItem("current_article");
    return raw ? (JSON.parse(raw) as StateShape["data"]) : undefined;
  }, [loc.state]);

  // 2) 없으면 카테고리 선택 화면으로
  useEffect(() => {
    if (!data) nav("/daily", { replace: true });
  }, [data, nav]);

  if (!data) return null;

  const { article, category, keywords } = data;

  // 3) 본문 단락 나누기 (API가 통문장이라면 적당히 분리)
  const paragraphs = useMemo(() => {
    const content = article.content ?? "";
    // \n\n 기준 → 없으면 . 기준으로 적당히 쪼개기
    const byGap = content.split(/\n\s*\n/).filter(Boolean);
    if (byGap.length > 1) return byGap;
    return content.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean);
  }, [article.content]);

  // 4) 하이라이터가 기대하는 형태로 키워드 맵핑
  const hiKeywords = useMemo(
    () =>
      (keywords ?? []).map((k) => ({
        term: k.word,
        meaning: k.translation_ko,
      })),
    [keywords]
  );

  return (
    <div className="screen">
      <article className="articleWrap">


        {/* 제목 */}
        <h1 className="articleTitle" style={{ marginBottom: 10, marginTop: 20, }}>
          {article.title}
        </h1>

        {/* 카테고리/날짜 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column", // ← 세로 정렬
            alignItems: "flex-start",
            fontSize: 13,
            color: "#64748b",
            marginBottom: 8,
            lineHeight: 1.6,
          }}
        >
          {/* 카테고리 */}
          {/* <div>{category?.name}</div> */}

          {/* 날짜 */}
          {article.published_at && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IoMdTime style={{ verticalAlign: "-2px" }} />
              {new Date(article.published_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>

        {/* 대표 이미지 (있을 때만) */}
        {!!article.image_url && (
          <div className="articleImageWrap">
            <img
              src={article.image_url}
              className="articleImage"
              alt=""
              draggable={false}
              style={{ display: "block", width: "100%", borderRadius: 12 }}
            />
          </div>
        )}

        {/* 본문 */}
        <div className="articleBody">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="articleP">
              <KeywordHighlighter text={p} keywords={hiKeywords} />
            </p>
          ))}
        </div>

        {/* 키워드 카드 */}
        {!!hiKeywords.length && (
          <section style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>키워드</div>
            <div style={{ display: "grid", gap: 8 }}>
              {hiKeywords.map((k, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{k.term}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{k.meaning}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* 하단 고정 버튼 */}
      <div className="stickyBottom" style={{ marginTop: 24 }}>
        {/* <button className="ghostBtn" onClick={() => nav("/daily")}>
          다른 카테고리
        </button> */}
        <button
          type="button"            // ✅ 이 줄 추가
          className="primaryBtn"
          onClick={() => {
            if (!category || !article) return;
            nav(`/summary/${category.slug}/${article.id}/level/${userLevel}`);
          }}
        >
          요약하기
        </button>
      </div>
    </div>
  );
}