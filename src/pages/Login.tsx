import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/growin-logo.png"; // ← 이미지 모듈로 임포트

export default function Login() {
    const navigate = useNavigate();
    const handleGoogleLogin = () => navigate("/level-test");

    return (
        <div className="screen">
            {/* 중앙 정렬되는 콘텐츠는 centerCol로 감싸기 */}
            <div className="centerCol">
                <img src={logoUrl} alt="Growin" className="logoImg" draggable={false} />
                <p className="sub">매일 조금씩 성장하는 나</p>
            </div>

            <div className="stickyBottom" style={{ marginTop: 24 }}>
                <button className="ghostBtn" onClick={() => navigate("/sign-up")}>
                    회원가입
                </button>
                <button className="primaryBtn" onClick={() => navigate("/sign-in")}>
                    로그인
                </button>
            </div>
        </div>
    );
}
