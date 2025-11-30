import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  slug: string;
  label: string;
  colorSrc: string;
  graySrc: string;
};

const CATEGORIES: Cat[] = [
  { id: "politics", slug: "politics", label: "정치", colorSrc: politics_color, graySrc: politics_gray },
  { id: "economy", slug: "economy", label: "경제", colorSrc: economy_color, graySrc: economy_gray },
  { id: "society", slug: "society", label: "사회·국제", colorSrc: society_color, graySrc: society_gray },
  { id: "sports", slug: "sports", label: "스포츠", colorSrc: sports_color, graySrc: sports_gray },
  { id: "culture", slug: "culture", label: "문화·연예·\n라이프스타일", colorSrc: culture_color, graySrc: culture_gray },
  { id: "science", slug: "science", label: "과학·기술", colorSrc: science_color, graySrc: science_gray },
];

export default function DailyCategory() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  useEffect(() => {
    // 레벨 테스트 끝나고 updateUserLevel에서 이미 localStorage에 저장해둔 값 읽기
    const savedLevel = localStorage.getItem("reading_level");
    if (savedLevel) {
      setLevel(savedLevel);
    }
  }, []);  

  const onDone = () => {
    if (!selected) return;
  
    const level = localStorage.getItem("reading_level");
    if (!level) {
      alert("레벨 정보가 없어요. 다시 로그인하거나 레벨 테스트를 진행해주세요.");
      return;
    }
  
    nav("/loading", { state: { categorySlug: selected, level } });
  };

  return (
    <div className="screen">
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="helloTitle">읽고싶은 기사의</div>
        <div className="helloTitle">
          <span className="accentBlue">카테고리</span>를 선택해주세요!
        </div>
        {/* 디버깅용으로 현재 레벨 잠깐 보여주기 */}
        <div style={{ marginTop: 8, fontSize: 14, color: "#777" }}>
          현재 레벨: {level ?? "불러오는 중..."}
        </div>
      </div>

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
