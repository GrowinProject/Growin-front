import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../lib/api"; // ✅ 추가
import "../mobile.css";

type DupStatus = "idle" | "checking" | "ok" | "dup" | "error";

export default function SignUp() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [dup, setDup] = useState<DupStatus>("idle");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [nick, setNick] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string>("");

  // ✅ 유효성 검증
  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const pwOk = pw.length >= 7;
  const pwSame = pw && pw2 && pw === pw2;
  const nickOk = nick.trim().length >= 4;

  // 이메일 중복확인 (더미)
  const checkDup = async () => {
    if (!emailOk) return;
    try {
      setDup("checking");
      await new Promise((r) => setTimeout(r, 700));
      if (email.toLowerCase().startsWith("growin")) setDup("dup");
      else setDup("ok");
    } catch {
      setDup("error");
    }
  };

  const canSubmit =
    emailOk && dup === "ok" && pwOk && pwSame && nickOk;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setServerMsg("");

    try {
      // 백엔드 스펙: { username, email, password }
      const res = await signup({ username: nick, email, password: pw });

      // 성공 메시지 노출 (예: "SUCCESS", 201, user_id 등)
      setServerMsg(`✅ ${res.message} (user_id: ${res.data.user_id})`);

      // 필요 시 바로 이동
      nav("/login", { replace: true });
    } catch (err: any) {
      // 에러 메시지 표시
      setServerMsg(`❌ ${err?.message ?? "회원가입에 실패했습니다."}`);
    } finally {
      setSubmitting(false);
    }

  };

  const onEmailChange = (v: string) => {
    setEmail(v);
    setDup("idle");
  };

  return (
    <div className="screen signScreen">
      <h1 className="signupTitle">회원가입</h1>

      <form onSubmit={onSubmit} noValidate>
        {/* 이메일 */}
        <div className="field">
          <label className="label">아이디</label>

          <div className="row">
            <input
              className={`input ${email ? (emailOk ? "ok" : "err") : ""}`}
              type="email"
              inputMode="email"
              placeholder="growin123@gmail.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />

            <button
              type="button"
              className="miniBtn"
              onClick={checkDup}
              disabled={!emailOk || dup === "checking"}
            >
              {dup === "checking" ? "확인중…" : "중복확인"}
            </button>
          </div>

          <div className="hintRow">
            {!email ? null : emailOk ? (
              dup === "ok" ? (
                <span className="okText">사용 가능한 이메일입니다.</span>
              ) : dup === "dup" ? (
                <span className="errText">이미 사용 중인 이메일입니다.</span>
              ) : dup === "error" ? (
                <span className="errText">확인 실패, 다시 시도해주세요.</span>
              ) : null
            ) : (
              <span className="errText">올바른 이메일 형식을 입력해주세요.</span>
            )}
          </div>
        </div>

        {/* 비밀번호 */}
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
          <input
            className={`input ${pw2 ? (pwSame ? "ok" : "err") : ""}`}
            type="password"
            placeholder="비밀번호 확인"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
          />
          <div className="hintRow">
            {!pw ? (
              <span className="subtle">7자 이상 입력해주세요</span>
            ) : pwOk ? (
              <span className="okText">사용 가능한 비밀번호입니다.</span>
            ) : (
              <span className="errText">7자 이상 입력해야 합니다.</span>
            )}
            {pw2 && !pwSame && (
              <span className="errText" style={{ marginLeft: 8 }}>
                비밀번호가 일치하지 않습니다.
              </span>
            )}
          </div>
        </div>

        {/* 닉네임 */}
        <div className="field">
          <label className="label">닉네임</label>
          <input
            className={`input ${nick ? (nickOk ? "ok" : "err") : ""}`}
            type="text"
            placeholder="매일성장하는수정이"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            required
          />
          <div className="hintRow">
            {!nick ? (
              <span className="subtle">4자 이상 입력해주세요</span>
            ) : nickOk ? (
              <span className="okText">좋은 닉네임이에요!</span>
            ) : (
              <span className="errText">4자 이상 입력해야 합니다.</span>
            )}
          </div>
        </div>

        <div className="stickyBottom">
          <button className="primaryBtn" 
          type="submit" 
          style={{marginTop:40}}
          disabled={!canSubmit || submitting}>
            {submitting ? "가입 중…" : "회원가입"}
          </button>
        </div>
      </form>
    </div>
  );
}
