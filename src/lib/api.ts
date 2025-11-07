const API_BASE_URL = "https://growin-back.onrender.com";

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