import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ 이미지 import (src/pages → src/imgs)
import politics_color from "../imgs/politics_color.png";
import politics_gray from "../imgs/politics_gray.png";
import economy_color from "../imgs/economy_color.png";
import economy_gray from "../imgs/economy_gray.png";
import society_color from "../imgs/society_color.png";
import society_gray from "../imgs/society_gray.png";
import sports_color from "../imgs/sports_color.png";
import sports_gray from "../imgs/sports_gray.png";
import culture_color from "../imgs/culture_color.png";
import culture_gray from "../imgs/culture_gray.png";
import science_color from "../imgs/science_color.png";
import science_gray from "../imgs/science_gray.png";

type Cat = {
  id: string;
  label: string;
  colorSrc: string;
  graySrc: string;
};

const CATEGORIES: Cat[] = [
  { id: "politics", label: "정치", colorSrc: politics_color, graySrc: politics_gray },
  { id: "economy", label: "경제", colorSrc: economy_color, graySrc: economy_gray },
  { id: "society", label: "사회·국제", colorSrc: society_color, graySrc: society_gray },
  { id: "sports", label: "스포츠", colorSrc: sports_color, graySrc: sports_gray },
  { id: "culture", label: "문화·연예·\n라이프스타일", colorSrc: culture_color, graySrc: culture_gray },
  { id: "science", label: "과학·기술", colorSrc: science_color, graySrc: science_gray },
];

export default function DailyCategory() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const onDone = () => {
    if (!selected) return;
    localStorage.setItem("daily_category", selected);
    nav("/home");
  };

  return (
    <div className="screen">
      {/* 상단 헤더 */}
      {/* <div className="pageHeader">
        <button className="iconBtn" onClick={() => nav(-1)} aria-label="뒤로가기">‹</button>
        <div className="pageTitle">오늘의 기사</div>
        <div style={{ width: 28 }} />
      </div> */}

      {/* 타이틀 */}
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="helloTitle">읽고싶은 기사의</div>
        <div className="helloTitle">
          <span className="accentBlue">카테고리</span>를 선택해주세요!
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div className="categoryGrid">
        {CATEGORIES.map((c) => {
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              className={`categoryCard ${active ? "active" : ""}`}
              onClick={() => setSelected(c.id)}
            >
              <img
                className={`catImg ${active ? "showColor" : "showGray"}`}
                src={active ? c.colorSrc : c.graySrc}
                alt={c.label}
                draggable={false}
              />
              <div className={`catLabel ${active ? "active" : ""}`}>{c.label}</div>
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="stickyBottom">
        <button
          className="primaryBtn"
          disabled={!selected}
          onClick={onDone}
          style={{ opacity: selected ? 1 : 0.5 }}
        >
          선택완료
        </button>
      </div>
    </div>
  );
}
