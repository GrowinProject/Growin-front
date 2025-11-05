// src/components/KeywordHighlighter.tsx
import React, { useMemo, useState } from "react";

type Keyword = {
  term: string;       // 표시할 단어 (예: "parachuters")
  meaning: string;    // 설명 텍스트
};

type Props = {
  text: string;           // 한 단락 텍스트
  keywords: Keyword[];    // 키워드 목록
};

type TipState = {
  visible: boolean;
  x: number;
  y: number;
  text: string;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 한 단락 텍스트에서 키워드를 하이라이트된 <mark>로 치환
 */
export default function KeywordHighlighter({ text, keywords }: Props) {
  const [tip, setTip] = useState<TipState>({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  // term -> meaning 매핑
  const dict = useMemo(() => {
    const map = new Map<string, string>();
    for (const k of keywords) map.set(k.term.toLowerCase(), k.meaning);
    return map;
  }, [keywords]);

  // 모든 키워드로 묶은 단일 정규식
  const regex = useMemo(() => {
    if (keywords.length === 0) return null;
    const union = keywords.map(k => escapeRegExp(k.term)).join("|");
    // 단어 경계 기준으로 매칭을 권하면 \b 사용 (영문 위주일 때)
    return new RegExp(`(${union})`, "gi");
  }, [keywords]);

  const parts = useMemo(() => {
    if (!regex) return [text];
    return text.split(regex);
  }, [text, regex]);

  const onWordTap = (e: React.MouseEvent, raw: string) => {
    const meaning = dict.get(raw.toLowerCase());
    if (!meaning) return;

    const { clientX, clientY } = e;
    // 팝업 위치(화면 밖으로 안 나가도록 가드 처리)
    const x = Math.min(window.innerWidth - 16, Math.max(16, clientX));
    const y = Math.min(window.innerHeight - 16, Math.max(60, clientY));

    setTip({ visible: true, x, y, text: meaning });
  };

  const hide = () => setTip(p => ({ ...p, visible: false }));

  return (
    <>
      <span onClick={hide}>
        {parts.map((chunk, i) => {
          // 키워드에 해당하는 조각이면 mark로 표시
          if (regex && chunk.match(regex)) {
            return (
              <mark
                key={i}
                className="kw"
                onClick={(e) => {
                  e.stopPropagation();
                  onWordTap(e, chunk);
                }}
              >
                {chunk}
              </mark>
            );
          }
          return <span key={i}>{chunk}</span>;
        })}
      </span>

      {tip.visible && (
        <div
          className="kwTip"
          style={{ left: tip.x, top: tip.y }}
          onClick={hide}
        >
          {tip.text}
        </div>
      )}
    </>
  );
}
