import React, { useState } from "react";
import { signup } from "../lib/api"; // 방금 만든 함수 import

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("요청 중...");

    try {
      const res = await signup({ username, email, password });
      setMessage(`✅ ${res.message} / user_id: ${res.data.user_id}`);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>회원가입 테스트</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">회원가입</button>
      </form>

      <p>{message}</p>
    </div>
  );
}
