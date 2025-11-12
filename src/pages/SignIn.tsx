import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/growin-logo.png";
import { login } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();

  // 입력값
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  // 상태
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  // 간단한 유효성
  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const pwOk = pw.length > 0;
  const canSubmit = emailOk && pwOk && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
  
    setSubmitting(true);
    setServerMsg("");
  
    try {
      const res = await login({ email, password: pw });
  
      // 토큰 저장
      localStorage.setItem("access_token", res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
  
      // 로그인 응답에 포함된 유저 정보 사용
      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
  
      setServerMsg("✅ 로그인 성공");
  
      // ✅ 레벨 분기
      if (user.level === 0) {
        navigate("/level-test", { replace: true });
      } else {
        localStorage.setItem("level_done", "1"); // 다음 로그인부터 스킵
        navigate("/home", { replace: true });
      }
    } catch (err: any) {
      setServerMsg(`❌ ${err?.message ?? "로그인에 실패했습니다."}`);
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <div className="screen">
      <div className="centerCol">
        <img src={logoUrl} alt="Growin" className="logoImg" draggable={false} />
        <p className="sub">매일 조금씩 성장하는 나</p>
      </div>

      {/* 이메일/비밀번호 폼 */}
      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <div className="field">
          <label className="label">이메일</label>
          <input
            className={`input ${email ? (emailOk ? "ok" : "err") : ""}`}
            type="email"
            inputMode="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* <div className="hintRow">
            {!email ? (
              <span className="subtle">이메일을 입력해주세요</span>
            ) : emailOk ? (
              <span className="okText">형식이 올바릅니다</span>
            ) : (
              <span className="errText">올바른 이메일 형식을 입력하세요</span>
            )}
          </div> */}
        </div>

        <div className="field">
          <label className="label">비밀번호</label>
          <input
            className={`input ${pw ? (pwOk ? "ok" : "err") : ""}`}
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          {/* <div className="hintRow">
            {!pw ? (
              <span className="subtle">비밀번호를 입력해주세요</span>
            ) : pwOk ? (
              <span className="okText">확인되었습니다</span>
            ) : (
              <span className="errText">비밀번호를 입력하세요</span>
            )}
          </div> */}
        </div>

        {/* 서버 메시지 */}
        {serverMsg && <p className="hintRow" style={{ marginTop: 8 }}>{serverMsg}</p>}

        <div className="stickyBottom" style={{ marginTop: 120 }}>
          {/* (선택) 구글 로그인 자리 - 추후 실제 OAuth로 교체 */}
          {/* <button className="ghostBtn" type="button" onClick={() => navigate("/level-test")}>
            Google로 시작 (임시)
          </button> */}

          <button className="primaryBtn" type="submit" disabled={!canSubmit}>
            {submitting ? "로그인 중…" : "로그인"}
          </button>

          <button
            className="ghostBtn"
            type="button"
            onClick={() => navigate("/sign-up")}
            style={{ marginTop: -5 }}
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
}
