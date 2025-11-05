// src/pages/ArticleRead.tsx
import React from "react";
import KeywordHighlighter from '../components/KeywordHighlighter'
import { IoMdTime } from "react-icons/io";
import "@/mobile.css";

export default function ArticleRead() {
  // 임시 기사 데이터
  const title =
    "An air display and bagpipes to welcome Trump to Chequers";
  const date = "17 September 2025";

  // ✅ 여기를 원하시는 이미지 URL로 변경
  const imageUrl =
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1600&auto=format&fit=crop";

  // 단락 단위 본문
  const paragraphs: string[] = [
    "As we've been reporting, US President Donald Trump will soon be meeting Prime Minster Keir Starmer.",
    "He will travel to Chequers - the PM's country residence - from Windsor, where he will be welcomed by Starmer and his wife.",
    "Upon arrival, Trump will be treated to an air display by British Army parachuters and a bagpipers' performance.",
    "As we've been reporting, US President Donald Trump will soon be meeting Prime Minster Keir Starmer."
  ];

  // 하이라이트할 키워드(예시)
  const keywords = [
    { term: "parachuters", meaning: "낙하산병(공수부대원)" },
    { term: "Chequers", meaning: "영국 총리의 교외 별장 이름" },
    { term: "bagpipers", meaning: "백파이프(관악기) 연주자" },
  ];

  return (
    <div className="screen">
      <article className="articleWrap">
        <h1 className="articleTitle">{title}</h1>
        <div className="articleMeta">
          <IoMdTime />
          <div>{date}</div>
          </div>
        <div className="articleImageWrap">
          <img src={imageUrl} className="articleImage" alt="" />
        </div>

        <div className="articleBody">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="articleP">
              <KeywordHighlighter text={p} keywords={keywords} />
            </p>
          ))}
        </div>
      </article>

      <div className="stickyBottom">
        <button className="primaryBtn">요약하기</button>
      </div>
    </div>
  );
}
