import React, { useEffect } from "react";
import "../mobile.css"; // 스타일 통합
import { useNavigate } from "react-router-dom";

export default function LoadingPage() {
  const navigate = useNavigate();

  // 1초 뒤 ArticleRead 페이지로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/article"); // ArticleRead가 연결된 경로
    }, 1000);

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 해제
  }, [navigate]);

  return (
    <div className="screen centerCol">
      <div className="loader"></div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          기사를 불러오고 있어요…
        </h2>
        <p style={{ color: "#555" }}>잠시만 기다려 주세요</p>
      </div>
    </div>
  );
}
