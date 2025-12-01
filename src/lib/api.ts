export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://growin-back.onrender.com";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null; // 혹시 SSR 대비용 (필수는 아님)
  return localStorage.getItem("access_token");
}

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export type SignupResponse = {
  message: string;        // "SUCCESS"
  statusCode: number;     // 201
  data: {
    user_id: number;
    username: string;
    email: string;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;    // "SUCCESS"
  statusCode: number; // 200
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      user_id: number;
      username: string;
      email: string;
      level: number; // 0: 초기 로그인 사용자
    };
  };
};

// api.ts (signup만 예시)
export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  // 성공 케이스
  if (res.ok) {
    if (isJson) return (await res.json()) as SignupResponse;
    // 혹시 성공인데 본문이 비거나 JSON이 아니면 기본 메시지로 반환
    return {
      message: "SUCCESS",
      statusCode: res.status,
      data: { user_id: 0, username: payload.username, email: payload.email },
    };
  }

  // 에러 케이스: JSON/텍스트 모두 안전 처리
  let serverMsg = "";
  try {
    serverMsg = isJson ? (await res.json())?.message : await res.text();
  } catch {
    /* 파싱 실패는 무시하고 아래에서 상태코드로 메시지 구성 */
  }
  throw new Error(serverMsg?.trim() || `회원가입 실패 (HTTP ${res.status})`);
}


export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as LoginResponse;

  if (!res.ok) {
    throw new Error(data?.message || `로그인 실패 (HTTP ${res.status})`);
  }
  return data;
}

// src/lib/api.ts

export async function fetchMe() {
  const token = getAccessToken();
  if (!token) {
    throw new Error("NO_ACCESS_TOKEN");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error(`HTTP_${res.status}`);
  }

  // 백엔드에서 {"id":..., "email":..., "reading_level": ...} 이런 형태라고 가정
  return res.json();
}


export type UpdateLevelPayload = {
  level: 1 | 2 | 3;
};

export type UpdateLevelResponse = {
  message: string;   // "LEVEL_UPDATED"
  statusCode: number; // 200
  data: {
    user_id: number;
    level: 1 | 2 | 3;
  };
};

export async function updateUserLevel(payload: UpdateLevelPayload): Promise<UpdateLevelResponse> {
  const token = getAccessToken();
  // 콘솔 확인용
  console.log("[API] updateUserLevel called:", {
    url: `${API_BASE_URL}/users/level`,
    payload,
    hasToken: !!token,
    tokenPreview: token?.slice(0, 12) + "...",
  }); // 👈 호출 여부/URL/토큰 유무 확인

  if (!token) throw new Error("NO_TOKEN");

  const r = await fetch(`${API_BASE_URL}/users/level`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ← 공백 1칸 필수
    },
    body: JSON.stringify(payload),
  });

  // 409를 특별 처리(이미 설정됨 → 성공처럼)
  if (r.status === 409) {
    const j = await r.json().catch(() => ({}));
    const e: any = new Error(j?.message || "LEVEL_ALREADY_ASSIGNED");
    e.code = 409;
    throw e;
  }
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP_${r.status}`);
  }
  
  const json = await r.json();
  
  // ✅ 응답에서 level 꺼내서 localStorage에 저장
  // 응답 형태: { message, statusCode, data: { user_id, level } }
  try {
    const levelFromResponse =
      (json as any)?.data?.level ??
      (payload as any)?.level; // 혹시 응답에 없으면, 보낸 payload.level이라도 저장
  
    if (levelFromResponse != null) {
      localStorage.setItem("reading_level", String(levelFromResponse));
      console.log("[API] updateUserLevel → 저장된 level:", levelFromResponse);
    } else {
      console.warn("[API] updateUserLevel: 응답에서 level을 찾지 못함", json);
    }
  } catch (e) {
    console.warn("[API] updateUserLevel: localStorage 저장 중 오류", e);
  }
  
  return json;
}  

export type Keyword = { word: string; translation_ko: string };
export type Article = {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  published_at?: string;
  created_at?: string;
};
export type Category = { id: number; name: string; slug: string };

export type RandomArticleResponse = {
  message: string;              // "SUCCESS"
  statusCode: number;           // 200
  data: {
    article: Article;
    category: Category;
    keywords: Keyword[];
  };
};

// ✅ 레벨까지 같이 받도록 변경
export async function fetchRandomArticle(categorySlug: string, level: string) {
  const url = new URL(`${API_BASE_URL}/articles/random`);
  url.searchParams.set("category", categorySlug);
  url.searchParams.set("level", level); // ✅ 레벨도 쿼리로 추가

  const token = getAccessToken();
  console.log("[fetchRandomArticle] getAccessToken() =>", token);

  if (!token) {
    // 토큰이 아예 없으면 여기서 바로 에러 던지기
    throw new Error("NO_ACCESS_TOKEN");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url.toString(), { method: "GET", headers });

  if (res.status === 401) {
    // 백엔드에서 UNAUTHORIZED 주는 경우
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`HTTP_${res.status}`);
  }

  return res.json();
}


export type SummaryAPIResponse = {
  message: string;
  statusCode: number;
  data: {
    article_id: number;
    summary_id: number;
    summary_text: string;
    reading_level: number;
    keywords: { word: string; translation_ko: string }[];
    // ✅ 새로 추가
    article_image_url: string;
    article_published_at: string;
    article_title: string;
  };
};

export async function fetchArticleSummary(
  category: string,
  articleId: number,
  level: number
) {
  const token = getAccessToken();
  console.log("▶ fetchArticleSummary token:", token?.slice(0, 20), "...");

  if (!token) throw new Error("로그인이 필요합니다. (토큰 없음)");

  const url = `${API_BASE_URL}/articles/${articleId}/summary` +
    `?category_slug=${encodeURIComponent(category)}` +
    `&reading_level=${level}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,   // ✅ 토큰 포함
      Accept: "application/json",
    },
    credentials: "include", // 필요 없으면 제거 가능
  });

  if (res.status === 401) throw new Error("인증 만료(401): 다시 로그인해주세요.");
  if (!res.ok) throw new Error(`요약 불러오기 실패 (${res.status})`);

  const json = (await res.json()) as SummaryAPIResponse;
  if (json.statusCode !== 200 || !json.data) {
    throw new Error("요약 데이터를 찾을 수 없습니다.");
  }

  // src/lib/api.ts
  const d = json.data;
  return {
    articleId: d.article_id,
    summaryId: d.summary_id,
    summaryText: d.summary_text,
    readingLevel: d.reading_level,
    keywords: d.keywords,
    articleImageUrl: d.article_image_url,       // ✅ 새 필드
    articlePublishedAt: d.article_published_at, // ✅ 새 필드
    articleTitle: d.article_title,
    category, // 그대로 유지
  };
}

// 요약페이지 -> 문제페이지에서 문제 불러오는 api
export async function fetchQuiz(summaryId: number) {
  const token = localStorage.getItem("access_token"); // ⬅ 추가

  const res = await fetch(`${API_BASE_URL}/summaries/${summaryId}/quiz`, {
    headers: {
      Authorization: `Bearer ${token}`, // ⬅ 여기 추가!
    },
  });

  if (!res.ok) {
    throw new Error(`퀴즈 요청 실패 (HTTP ${res.status})`);
  }

  return res.json();
}

// 퀴즈 제출 후 정답 불러오기
export type QuizAnswerPayloadItem = {
  question_id: number;
  selected_option_id: number;
};

export type QuizSubmitPayload = {
  answers: QuizAnswerPayloadItem[];
};

export type QuizSubmitResultItem = {
  question_id: number;
  correct_option_id: number;
  selected_option_id: number;
  is_correct: boolean;
  explanation: string;
};

export type QuizSubmitResponse = {
  message: string;
  statusCode: number;
  data: {
    session_id: number;
    quiz_id: number;
    score: number;
    total_questions: number;
    results: QuizSubmitResultItem[];
  };
};

// ✅ 요약 퀴즈 제출 API
export async function submitSummaryQuiz(
  summaryId: number,
  payload: QuizSubmitPayload
): Promise<QuizSubmitResponse["data"]> {
  const token = localStorage.getItem("access_token"); // ⬅ fetchQuiz와 동일하게 토큰 가져오기

  const res = await fetch(
    `${API_BASE_URL}/summaries/${summaryId}/quiz/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ⬅ 여기도 토큰 붙이기
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(`퀴즈 제출 실패 (HTTP ${res.status})`);
  }

  const body: QuizSubmitResponse = await res.json();

  if (body.statusCode !== 200) {
    throw new Error(body.message || "퀴즈 채점 요청 실패");
  }

  return body.data; // ✅ SummaryQuizPage에서 받는 data
}

// 🧠 복습 히스토리 아이템 타입
export type ReviewHistoryItem = {
  article_id: number;
  summary_id: number;
  quiz_id: number;
  title: string;
  image_url: string | null;
  last_reviewed_at: string; // ISO 문자열
  score: number;
  total_questions: number;
};

// 전체 응답 타입 (필요하면)
export type ReviewHistoryResponse = {
  message: string;
  statusCode: number;
  data: {
    items: ReviewHistoryItem[];
  };
};

export async function getReviewHistory(): Promise<ReviewHistoryItem[]> {
  // 1) 토큰 가져오기
  const token = localStorage.getItem("access_token"); // 네가 로그인 때 쓰는 키 그대로

  if (!token) {
    // 아예 토큰이 없으면 바로 에러
    throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
  }

  // 2) Bearer 토큰을 Authorization 헤더에 넣어서 호출
  const res = await fetch(`${API_BASE_URL}/users/me/review/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 3) 응답 체크
  if (!res.ok) {
    console.error("[review history] status =", res.status);

    if (res.status === 401) {
      throw new Error("로그인이 만료되었어요. 다시 로그인해 주세요.");
    }

    let msg = "복습 히스토리를 불러오지 못했습니다.";
    try {
      const errJson = await res.json();
      if (errJson?.message) msg = errJson.message;
    } catch (e) {
      // JSON 파싱 실패하면 무시하고 기본 msg 사용
    }

    throw new Error(msg);
  }

  // 4) 정상 응답 파싱
  const json: ReviewHistoryResponse = await res.json();
  return json.data.items;

}

// 📰 복습용 기사 상세 타입
export type ArticleReviewData = {
  article_id: number;
  title: string;
  image_url: string | null;
  content: string;
  published_at: string;
  article_keywords: {
    word: string;
    translation_ko: string;
  }[];
  summary_id: number;
  quiz_id: number;
  session_id: number;
  last_reviewed_at: string;
};

export type ArticleReviewResponse = {
  message: string;
  statusCode: number;
  data: ArticleReviewData;
};

// 🧠 복습용 기사 상세 조회 API
export async function getArticleReview(
  articleId: number
): Promise<ArticleReviewData> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
  }

  const res = await fetch(`${API_BASE_URL}/articles/${articleId}/review`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("[article review] status =", res.status);

    if (res.status === 401) {
      throw new Error("로그인이 만료되었어요. 다시 로그인해 주세요.");
    }

    let msg = "복습용 기사 정보를 불러오지 못했습니다.";
    try {
      const errJson = await res.json();
      if (errJson?.message) msg = errJson.message;
    } catch (e) { }

    throw new Error(msg);
  }

  const json: ArticleReviewResponse = await res.json();
  return json.data;
}

// 📝 요약 상세 타입
export type SummaryDetail = {
  summary_id: number;
  article_id: number;
  image_url: string | null; // 또는 string
  level: string; // "beginner" | "intermediate" | "advanced" 같은 값
  summary_text: string;
  title: string;
  published_at: string;
  keywords: {
    word: string;
    translation_ko: string;
  }[];
};

export type SummaryDetailResponse = {
  message: string;
  statusCode: number;
  data: SummaryDetail;
};

// 🧠 요약 상세 조회 API
export async function getSummaryDetail(
  summaryId: number
): Promise<SummaryDetail> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
  }

  const res = await fetch(`${API_BASE_URL}/summaries/${summaryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("[summary detail] status =", res.status);

    if (res.status === 401) {
      throw new Error("로그인이 만료되었어요. 다시 로그인해 주세요.");
    }

    let msg = "요약 정보를 불러오지 못했습니다.";
    try {
      const errJson = await res.json();
      if (errJson?.message) msg = errJson.message;
    } catch (e) { }
    throw new Error(msg);
  }

  const json: SummaryDetailResponse = await res.json();
  return json.data;
}

// 🧪 퀴즈 세션 결과 타입들
export type QuizSessionOption = {
  option_id: number;
  label: string; // "A", "B", ...
  text: string;
};

export type QuizSessionQuestion = {
  question_id: number;
  question_type: string; // "vocab" | "grammar" 등
  prompt: string;
  options: QuizSessionOption[];
  correct_option_id: number;
  selected_option_id: number | null;
  is_correct: boolean;
  explanation: string | null;
};

export type QuizSessionResult = {
  session_id: number;
  quiz_id: number;
  summary_id: number;
  article_id: number;
  score: number;
  total_questions: number;
  questions: QuizSessionQuestion[];
};

export type QuizSessionResultResponse = {
  message: string;
  statusCode: number;
  data: QuizSessionResult;
};

// 🧠 퀴즈 세션 결과 조회 API
export async function getQuizSessionResult(
  sessionId: number
): Promise<QuizSessionResult> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
  }

  const res = await fetch(`${API_BASE_URL}/quiz-sessions/${sessionId}/results`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("[quiz session result] status =", res.status);

    if (res.status === 401) {
      throw new Error("로그인이 만료되었어요. 다시 로그인해 주세요.");
    }

    let msg = "퀴즈 결과를 불러오지 못했습니다.";
    try {
      const errJson = await res.json();
      if (errJson?.message) msg = errJson.message;
    } catch (e) { }
    throw new Error(msg);
  }

  const json: QuizSessionResultResponse = await res.json();
  return json.data;
}
