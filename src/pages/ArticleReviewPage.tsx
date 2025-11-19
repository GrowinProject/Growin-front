// ArticleReviewPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getArticleReview, type ArticleReviewData, } from "../lib/api";
import KeywordHighlighter from "../components/KeywordHighlighter";
import "@/mobile.css";

// 1) 하이라이트용 키워드 배열 (본문 표시 + 키워드 카드 둘 다에서 사용 가능)
type HiKeyword = { term: string; meaning: string };

function formatReviewDate(iso: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
}

export default function ArticleReviewPage() {
    const nav = useNavigate();
    const { articleId } = useParams<{ articleId: string }>();

    const [data, setData] = useState<ArticleReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // articleId가 없거나 숫자가 아니면 바로 에러 처리
        if (!articleId) {
            setError("잘못된 접근입니다. (articleId 없음)");
            setLoading(false);
            return;
        }
        const idNum = Number(articleId);
        if (Number.isNaN(idNum)) {
            setError("잘못된 기사 ID입니다.");
            setLoading(false);
            return;
        }
        async function load() {
            try {
                const result = await getArticleReview(idNum);
                setData(result);
            } catch (e: any) {
                console.error(e);
                setError(e.message ?? "불러오기 실패");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [articleId]);

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <p>복습용 기사를 불러오는 중이에요...</p>
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

    // ⬇⬇⬇ 여기부터는 data가 항상 존재하는 구간

    // 키워드 원본
    const rawKeywords = data.article_keywords ?? [];

    // 하이라이터가 기대하는 형태
    const hiKeywords: HiKeyword[] = rawKeywords.map((k) => ({
        term: k.word,
        meaning: k.translation_ko,
    }));

    // 본문을 문단/문장 단위로 쪼개기 (일반 함수)
    const paragraphs = (() => {
        const content = data.content ?? "";
        const byGap = content.split(/\n\s*\n/).filter(Boolean);
        if (byGap.length > 1) return byGap;
        return content.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean);
    })();


    return (
        <div className={'screen'}>
            {/* 제목 */}
            <h1 className="articleTitle" style={{ marginBottom: 10, marginTop: 20, }}>
                {data.title}
            </h1>

            <div style={{ fontSize: 12, color: "#777",}}>
                발행일: {formatReviewDate(data.published_at)}
            </div>

            {/* 마지막 복습 날짜 */}
            <div style={{ fontSize: 12, color: "#777", marginBottom: 16 }}>
                마지막 복습: {formatReviewDate(data.last_reviewed_at)}
            </div>

            {/* 이미지 */}
            {data.image_url && (
                <div
                    style={{
                        width: "100%",
                        borderRadius: 16,
                        overflow: "hidden",
                        marginBottom: 16,
                    }}
                >
                    <img
                        src={data.image_url}
                        alt={data.title}
                        style={{ width: "100%", height: "auto", display: "block" }}
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

            {/* 키워드 */}
            <div style={{ marginBottom: 24, marginTop: 30, }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>키워드</div>
                <div style={{ display: "grid", gap: 8 }}>
                    {rawKeywords.map((k, i) => (
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
                            <div style={{ fontSize: 13, color: "#64748b" }}>{k.translation_ko}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 밑에 버튼들은 나중에 연결 예정 */}
            <div className="stickyBottom" style={{ marginTop: 24, gap: 8 }}>
                <button
                    className="primaryBtn"
                    type="button"
                    onClick={() => {
                        nav(`/summaries/${data.summary_id}/review`, {
                            state: {
                                sessionId: data.session_id, // 🔹 요약 페이지로 세션 ID 같이 전달
                            },
                        });
                    }}
                >
                    요약본 확인하기
                </button>
                <button
                    className="ghostBtn"
                    type="button"
                    onClick={() => nav(-1)}  // ← 기사 복습으로 돌아감
                >
                    ← 복습 리스트로
                </button>
            </div>
        </div>
    );
}
