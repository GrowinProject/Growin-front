// src/pages/LevelComplete.tsx
import { useNavigate } from "react-router-dom";

export default function LevelComplete() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div className="centerCol">
        <div style={{ fontSize: 64, lineHeight: 1 }}>👍</div>
        <h2 style={{ margin: "12px 0 8px", fontSize: 28, letterSpacing: -0.3 }}>
          레벨 테스트가 완료되었습니다!
        </h2>
        <p style={{ color: "#6b7280", margin: 0 }}>
          이제 본격적으로 문제풀이로 나가볼까요?
        </p>
      </div>

      <div className="stickyBottom">
        <button className="ghostBtn" onClick={() => navigate("/home")}>홈으로</button>
        {/* ✅ 결과 페이지로 이동 */}
        <button className="primaryBtn" onClick={() => navigate("/level-result")}>
          레벨테스트 결과 보기
        </button>
      </div>
    </div>
  );
}
