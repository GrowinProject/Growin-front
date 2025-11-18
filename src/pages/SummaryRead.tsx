// src/pages/SummaryRead.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchArticleSummary } from "../lib/api"; // ✅ 방금 만든 함수 import
import { IoMdTime } from "react-icons/io";
import KeywordHighlighter from "../components/KeywordHighlighter";
import "@/mobile.css";

export default function SummaryRead() {
    const nav = useNavigate();
    const { category, articleId, level } = useParams();

    // URL에서 받은 값들
    const cat = category ?? "";
    const aid = useMemo(() => Number(articleId), [articleId]);
    const lvl = useMemo(() => Number(level), [level]);

    // 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadSummary() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchArticleSummary(cat, aid, lvl);
                if (!cancelled) setSummary(data);
            } catch (err: any) {
                if (!cancelled) setError(err.message || "요약을 불러오지 못했어요.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (cat && aid && lvl) {
            loadSummary();
        } else {
            setError("잘못된 경로입니다.");
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [cat, aid, lvl]);

    // --- UI ---
    if (loading) return <div style={{ padding: 24 }}>로딩 중...</div>;

    if (error)
        return (
            <div style={{ padding: 24 }}>
                <p style={{ color: "red" }}>{error}</p>
                <button onClick={() => nav(-1)}>← 돌아가기</button>
            </div>
        );

    if (!summary)
        return (
            <div style={{ padding: 24 }}>
                <p>요약 데이터가 없습니다.</p>
                <button onClick={() => nav(-1)}>← 돌아가기</button>
            </div>
        );

    const hiKeywords =
        (summary?.keywords ?? []).map((k: { word: string; translation_ko: string }) => ({
            term: k.word,
            meaning: k.translation_ko,
        }));

    // ✅ SummaryRead.tsx (성공 렌더 구간 교체)
    return (
        <div className="screen">
            <article className="articleWrap">
                {/* 제목 */}
                <h1 className="articleTitle" style={{ marginBottom: 10, marginTop: 20 }}>
                {summary.articleTitle}
                </h1>

                {/* 카테고리, 기사id, 레벨 출력하려고할시 */}
                {/* <span>카테고리 <b>{summary.category}</b></span>
                <span>기사ID <b>{summary.articleId}</b></span>
                <span>레벨 <b>{summary.readingLevel}</b></span> */}

                {/* 카테고리/날짜 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 8,
                        lineHeight: 1.6,
                    }}
                >
                    {/* 카테고리 표시는 필요하면 해제 */}
                    {/* <div>{summary.category}</div> */}

                    {/* 날짜 */}
                    {summary.articlePublishedAt && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <IoMdTime style={{ verticalAlign: "-2px" }} />
                            {new Date(summary.articlePublishedAt).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    )}
                </div>

                {/* 대표 이미지 (있을 때만) */}
                {!!summary.articleImageUrl && (
                    <div className="articleImageWrap">
                        <img
                            src={summary.articleImageUrl}
                            className="articleImage"
                            alt=""
                            draggable={false}
                            style={{ display: "block", width: "100%", borderRadius: 12 }}
                        />
                    </div>
                )}

                {/* 요약 본문 */}
                <div className="articleBody">
                    {summary.summaryText.split("\n").map((p: string, idx: number) => (
                        <p key={idx} className="articleP">
                            <KeywordHighlighter text={p} keywords={hiKeywords} />
                        </p>
                    ))}
                </div>

                {/* 키워드 카드 */}
                {!!summary.keywords?.length && (
                    <section style={{ marginTop: 20 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>키워드</div>
                        <div style={{ display: "grid", gap: 8 }}>
                            {summary.keywords.map(
                                (k: { word: string; translation_ko: string }, i: number) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "10px 12px",
                                            borderRadius: 10,
                                            border: "1px solid #e5e7eb",
                                            background: "#f8fafc",
                                        }}
                                    >
                                        <div style={{ fontWeight: 700 }}>{k.word}</div>
                                        <div style={{ fontSize: 13, color: "#64748b" }}>
                                            {k.translation_ko}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}
            </article>

            {/* 하단 고정 버튼 */}
            <div className="stickyBottom" style={{ marginTop: 24 }}>
                <button
                    type="button"
                    className="primaryBtn"
                    disabled={!summary}
                    onClick={() => {
                        if (!summary) return;

                        // ✅ summary는 camelCase 구조니까 summaryId로 접근
                        const sid = summary.summaryId;

                        if (!sid) {
                            console.error("summaryId 없음:", summary);
                            return;
                        }

                        // 현재 위치: /summary/:category/:articleId/level/:level
                        // → 상대 경로로 quiz/:summaryId 로 이동
                        nav(`quiz/${sid}`);
                    }}
                >
                    이 요약으로 퀴즈 풀기
                </button>

            </div>
        </div >
    );

}
