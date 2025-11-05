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

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as SignupResponse;

  if (!res.ok) {
    // 서버가 에러시에도 JSON 형태로 message를 주지 않으면 대비
    throw new Error(data?.message || `회원가입 실패 (HTTP ${res.status})`);
  }
  return data;
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