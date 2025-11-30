import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchRandomArticle } from "../lib/api";

export default function LoadingPage() {
  const nav = useNavigate();
  const loc = useLocation() as {
    state?: {
      categorySlug?: string;
      level?: string;     // ← 🔥 여기가 추가되는 부분!
    };
  };
  const slug = loc.state?.categorySlug;
  const level = loc.state?.level;

  useEffect(() => {
    if (!slug || !level) {
      nav("/daily", { replace: true });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // slug!, level! : 여기서는 undefined 아님을 우리가 보증해줬다는 뜻
        const res = await fetchRandomArticle(slug!, level!);
        sessionStorage.setItem("current_article", JSON.stringify(res.data));
        nav("/article", { replace: true, state: { data: res.data, level } });
      } catch (e: any) {
        console.error(e);
        alert("기사를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        nav("/daily", { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug, level, nav]);

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
