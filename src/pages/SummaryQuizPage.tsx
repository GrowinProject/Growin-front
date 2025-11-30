// src/pages/SummaryQuizPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuiz, submitSummaryQuiz } from "../lib/api";
import type {
    QuizAnswerPayloadItem,
    QuizSubmitResponse,
} from "../lib/api";


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

type AnswerMap = Record<number, number | null>;

export default function SummaryQuizPage() {
    const nav = useNavigate();
    const { category, articleId, level, summaryId } = useParams();

    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ 채점 결과 저장용
    const [submitResult, setSubmitResult] =
        useState<QuizSubmitResponse["data"] | null>(null);

    useEffect(() => {
        console.log("[QUIZ] summaryId param 👉", summaryId); // ✅ 디버깅용

        if (!summaryId) {
            setError("summaryId가 없습니다.");
            setLoading(false);
            return;
        }

        const idNum = Number(summaryId);
        if (Number.isNaN(idNum)) {
            setError("summaryId가 숫자가 아닙니다.");
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const json = await fetchQuiz(idNum);
                setQuiz(json.data);

                const initial: AnswerMap = {};
                json.data.questions.forEach((q: QuizQuestion) => {
                    initial[q.question_id] = null;
                });
                setAnswers(initial);
            } catch (err: any) {
                setError(err.message ?? "퀴즈를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [summaryId]);


    const handleSelectOption = (questionId: number, optionId: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    // 진행도 (선택한 문항 수)
    const answeredCount = quiz
        ? Object.values(answers).filter((v) => v !== null).length
        : 0;

    if (loading) {
        return (
            <div className="screen quizPage">
                <div className="quizCard">
                    <p>퀴즈 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="screen quizPage">
                <div className="quizCard">
                    <p className="quizError">퀴즈를 불러오는 데 실패했어요 😢</p>
                    {error && <p className="quizErrorSub">{error}</p>}
                    <button className="secondaryBtn" onClick={() => nav(-1)}>
                        ← 요약으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const onSubmitQuiz = async () => {
        try {
            if (!summaryId) {
                alert("summaryId가 없습니다. 경로를 확인해주세요.");
                return;
            }

            const numericId = Number(summaryId);
            if (Number.isNaN(numericId)) {
                alert("summaryId가 숫자가 아닙니다.");
                return;
            }

            // ✅ AnswerMap -> [{ question_id, selected_option_id }] 배열로 변환
            const payloadAnswers: QuizAnswerPayloadItem[] = Object.entries(answers)
                .filter(([, selected]) => selected != null) // null/undefined 걸러주기
                .map(([qId, selected]) => ({
                    question_id: Number(qId),
                    selected_option_id: Number(selected as number),
                }));

            if (!payloadAnswers.length) {
                alert("먼저 문제를 풀어주세요!");
                return;
            }

            const payload = { answers: payloadAnswers };

            console.log("제출 payload 👉", payload);

            const data = await submitSummaryQuiz(numericId, payload);

            console.log("채점 결과 👉", data);

            // ❗ quiz가 null이면 결과 페이지에서 질문을 못 보여주니까 체크
            if (!quiz) {
                alert("퀴즈 데이터가 없습니다.");
                return;
            }

            nav(
                `/articles/${category}/${articleId}/level/${level}/summaries/${summaryId}/quiz/result`,
                {
                    state: {
                        result: data,
                        quiz,
                        meta: {
                            category,
                            articleId,
                            level,
                        },
                    },
                }
            );

            // 나중에 화면에 쓰려고 저장
            // setSubmitResult(data); 
            // alert(`채점 완료! 점수: ${data.score} / ${data.total_questions}`);

        } catch (e) {
            console.error(e);
            alert("퀴즈 제출 중 오류가 발생했습니다.");
        }
    };


    return (
        <div className="screen quizPage">
            {/* 상단 헤더 */}
            <header className="quizHeader">
                <div style={{ fontWeight: '700', marginBottom:10, color:'#5785D5' }}>
                    LEVEL {level}
                </div>
                <div className="quizHeaderText">
                    {/* 현재 가져온 기사의 카테고리, 기사id, 요약id,  */}
                    <p className="quizMeta">
                        <span>{category}</span>  <span>Article {articleId}</span> {" "}
                        <span>Summary {quiz.summary_id}</span>
                    </p>
                </div>
            </header>

            {/* 진행도 바 */}
            <section className="quizProgressSection">
                <div className="quizProgressTop">
                    <span>
                        {answeredCount} / {quiz.question_count} 문항 선택됨
                    </span>
                </div>
                <div className="quizProgressBarWrap">
                    <div
                        className="quizProgressBarFill"
                        style={{
                            width: `${quiz.question_count === 0
                                ? 0
                                : (answeredCount / quiz.question_count) * 100
                                }%`,
                        }}
                    />
                </div>
            </section>

            {/* 문제 리스트 */}
            <main className="quizList">
                {quiz.questions.map((q, idx) => (
                    <section key={q.question_id} className="quizItem">
                        <div className="quizQHeader">
                            <span className="quizQNumber">Question
                                <span style={{ color: '#3276EB' }}> 0{idx + 1}</span></span>
                            {/* <span className="quizQType">{q.question_type}</span> */}
                        </div>
                        <div className="quizPrompt">{q.prompt}</div>

                        <div className="quizOptions">
                            {q.options.map((opt) => {
                                const selected = answers[q.question_id] === opt.option_id;
                                return (
                                    <button
                                        key={opt.option_id}
                                        type="button"
                                        className={
                                            "quizOptionBtn" +
                                            (selected ? " quizOptionBtnSelected" : "")
                                        }
                                        onClick={() =>
                                            handleSelectOption(q.question_id, opt.option_id)
                                        }
                                    >
                                        {/* 보기앞에 A,B,C 붙이고 싶으면 */}
                                        {/* <span className="quizOptionLabel">{opt.label}.</span> */}
                                        <span className="quizOptionText">{opt.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </main>

            {/* 하단 고정 버튼 (나중에 정답 제출 연결 예정) */}
            <div className="stickyBottom">
                <button
                    type="button"
                    className="primaryBtn"
                    style={{ marginTop: 30, }}
                    disabled={answeredCount === 0}
                    onClick={onSubmitQuiz}
                >
                    퀴즈 제출하기
                </button>
                {submitResult && (
                    <pre style={{ marginTop: 24, background: "#f7f7f7", padding: 12 }}>
                        {JSON.stringify(submitResult, null, 2)}
                    </pre>
                )}

            </div>
        </div>
    );
}
