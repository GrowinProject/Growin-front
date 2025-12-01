// src/pages/Home.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/growin-logo.png"; // ← 이미지 모듈로 임포트

export default function Home() {
  const nav = useNavigate();

  const userLabel = useMemo(() => {
    try {
      // ✅ localStorage에서 user 객체를 가져옴
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.username) return `${user.username}님`;
      }

      // fallback: 이전 방식 (이메일이나 이름 따로 저장돼 있을 때)
      const name = localStorage.getItem("user_name");
      const email = localStorage.getItem("user_email");
      if (name) return `${name}님`;
      if (email) return `${email.split("@")[0]}님`;

      return "사용자님";
    } catch {
      return "사용자님";
    }
  }, []);

  return (
    <div className="screen">
      {/* 상단 고정 헤더 */}
      <div className="topBar">
        <img src={logoUrl} alt="Growin" className="logoImg" draggable={false} />
      </div>

      {/* 인사 */}
      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <div className="helloTitle">{userLabel} 안녕하세요!</div>
        <div className="helloSub">오늘의 공부를 시작해볼까요?</div>
      </div>

      {/* 오늘의 기사 카드 */}
      <SectionTitle>오늘의 기사</SectionTitle>
      <Card
        tint="indigo"
        title="지금 핫한 기사를 모아봐요"
        strong="하루 3분으로 기사 읽고 문제 풀기!"
        emoji="📖"
        onClick={() => {
          const lvl = Number(localStorage.getItem("reading_level"));

          if (lvl === 1 || lvl === 3) {
            alert("아직 이 기능은 레벨 2에서만 지원됩니다! 준비 중입니다 😊");
            return;
          }

          nav("/daily");
        }}
      />

      {/* 복습 카드 */}
      <SectionTitle style={{ marginTop: 18 }}>복습</SectionTitle>
      <Card
        tint="slate"
        title="틀린문제, 다시 보고 싶은 문제 모두"
        strong="복습 시작하기"
        emoji="📚"
        onClick={() => nav("/review-history")}
      />

      {/* 키워드별 복습 리스트 */}
      <SectionTitle style={{ marginTop: 18 }}>키워드별 복습</SectionTitle>
      <div className="listCard">
        <ListItem
          icon="📘"
          title="문법"
          desc="문법이 약한것 같다면?"
          onClick={() => alert("준비중입니다 😊")}
        />
        <Divider />
        <ListItem
          icon="🗓️"
          title="단어"
          desc="단어만 집중적으로!"
          onClick={() => alert("준비중입니다 😊")}
        />
        <Divider />
        <ListItem
          icon="🌀"
          title="독해"
          desc="독해력 상승을 위해"
          onClick={() => alert("준비중입니다 😊")}
        />
      </div>

      {/* 하단 탭 */}
      <div className="bottomNav">
        {/* <button className="navBtn navBtnActive" onClick={() => nav("/home")}>
          <span className="navIcon">🏠</span>
          홈
        </button>
        <button className="navBtn" onClick={() => nav("/mypage")}>
          <span className="navIcon">🙋‍♀️</span>
          마이페이지
        </button> */}
      </div>
    </div>
  );
}

/* ---------- 작은 프리미티브 컴포넌트들 ---------- */
function SectionTitle({
  children,
  style,
}: React.PropsWithChildren<{ style?: React.CSSProperties }>) {
  return (
    <div className="sectionTitle" style={style}>
      {children}
    </div>
  );
}

function Card({
  tint,
  title,
  strong,
  emoji,
  onClick,
}: {
  tint: "indigo" | "slate";
  title: string;
  strong: string;
  emoji: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={`homeCard ${tint === "indigo" ? "tintIndigo" : "tintSlate"}`}
      onClick={onClick}
    >
      <div>
        <div className="cardBadge">{title}</div>
        <div className="cardStrong">{strong}</div>
      </div>
      <div className="cardEmoji">{emoji}</div>
    </button>
  );
}

function ListItem({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <button className="listItem" onClick={onClick}>
      <div className="listIcon">{icon}</div>
      <div className="listTexts">
        <div className="listTitle">{title}</div>
        <div className="listDesc">{desc}</div>
      </div>
      <div className="listChevron">›</div>
    </button>
  );
}

function Divider() {
  return <div className="divider" />;
}
