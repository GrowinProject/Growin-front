// src/pages/SummaryReviewPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    getSummaryDetail,
    type SummaryDetail,
} from "../lib/api";
import KeywordHighlighter from "../components/KeywordHighlighter";
import "@/mobile.css";

export default function SummaryReviewPage() {
    const nav = useNavigate();
    const { summaryId } = useParams<{ summaryId: string }>();

    // 🔹 ArticleReviewPage에서 넘겨준 sessionId 받기
    const loc = useLocation() as { state?: { sessionId?: number } };
    const sessionIdFromState = loc.state?.sessionId;

    const [data, setData] = useState<SummaryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!summaryId) {
            setError("잘못된 접근입니다. (summaryId 없음)");
            setLoading(false);
            return;
        }

        const idNum = Number(summaryId);
        if (Number.isNaN(idNum)) {
            setError("잘못된 요약 ID입니다.");
            setLoading(false);
            return;
        }

        async function load() {
            try {
                const result = await getSummaryDetail(idNum);
                setData(result);
            } catch (e: any) {
                console.error(e);
                setError(e.message ?? "불러오기 실패");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [summaryId]);

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <p>요약을 불러오는 중이에요...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24 }}>
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

    if (!data) {
        return (
            <div style={{ padding: 24 }}>
                <p>데이터가 없습니다.</p>
                <button onClick={() => nav(-1)}>← 뒤로가기</button>
            </div>
        );
    }

    const { summary_text, keywords, image_url, title, published_at } = data;

    // 🔍 하이라이터가 기대하는 형태로 키워드 변환
    const hiKeywords = keywords.map((k) => ({
        term: k.word,
        meaning: k.translation_ko,
    }));

    return (
        <div className="screen">
            <article className="articleWrap">
                {/* 제목 영역 */}
                <h1
                    className="articleTitle"
                    style={{ marginTop: 20, marginBottom: 8 }}
                >
                    {title}
                </h1>

                <div style={{ fontSize: 12, color: "#777", marginBottom: 16 }}>
                    발행일: {published_at.split("T")[0]}
                </div>

                {/* 대표 이미지 */}
                {image_url && (
                    <div
                        style={{
                            width: "100%",
                            borderRadius: 12,
                            overflow: "hidden",
                            marginBottom: 16,
                        }}
                    >
                        <img
                            src={image_url}
                            alt="summary"
                            style={{ width: "100%", display: "block", borderRadius: 12 }}
                        />
                    </div>
                )}

                {/* 레벨 배지 */}
                {/* <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 10px",
                        borderRadius: 999,
                        backgroundColor: "#eef2ff",
                        color: "#4f46e5",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 16,
                    }}
                >
                    {levelLabel(level)}
                </div> */}

                {/* 요약 텍스트 */}
                <section style={{ marginBottom: 24 }}>
                    <div
                        style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: "#111827",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        <KeywordHighlighter text={summary_text} keywords={hiKeywords} />
                    </div>
                </section>

                {/* 키워드 */}
                {!!keywords.length && (
                    <section style={{ marginTop: 12, marginBottom: 20 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>키워드</div>
                        <div style={{ display: "grid", gap: 8 }}>
                            {keywords.map((k, i) => (
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
                            ))}
                        </div>
                    </section>
                )}
            </article>

            {/* 하단 버튼 */}
            <div className="stickyBottom" style={{ marginTop: 24, gap: 8 }}>
                <button
                    className="primaryBtn"
                    type="button"
                    onClick={() => {
                        if (!sessionIdFromState) {
                            alert("퀴즈 세션 정보가 없어요. 기사 화면에서 다시 들어와 주세요.");
                            return;
                        }
                        nav(`/quiz-sessions/${sessionIdFromState}/results`);
                    }}
                >
                    퀴즈 결과 보기
                </button>
                <button
                    className="ghostBtn"
                    type="button"
                    onClick={() => nav(-1)}  // ← 기사 복습으로 돌아감
                >
                    ← 기사로
                </button>
            </div>
        </div>
    );
}
