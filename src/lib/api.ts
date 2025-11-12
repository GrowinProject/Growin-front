export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://growin-back.onrender.com";

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

  const getAccessToken = () => localStorage.getItem("access_token");


export type UpdateLevelPayload = {
  user_id: number;   // ⚠️ 토큰의 사용자와 일치해야 함(백엔드가 검증)
  level: 1 | 2 | 3;  // 1=초급, 2=중급, 3=고급
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
  return r.json();
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

// ✅ 카테고리별 랜덤 기사 (slug 사용: e.g. politics)
export async function fetchRandomArticle(categorySlug: string) {
  const url = new URL(`${API_BASE_URL}/articles/random`);
  url.searchParams.set("category", categorySlug);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), { method: "GET", headers });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

// src/lib/api.ts
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
  };
};


export async function fetchArticleSummary(
  category: string,
  articleId: number,
  level: number
) {
  const token = getAccessToken();
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
  category, // 그대로 유지
};

}
