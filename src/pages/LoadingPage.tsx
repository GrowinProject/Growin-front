import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchRandomArticle } from "../lib/api";

export default function LoadingPage() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { categorySlug?: string } };
  const slug = loc.state?.categorySlug;

  useEffect(() => {
    if (!slug) {
      nav("/daily", { replace: true });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchRandomArticle(slug);
        // 세션 스토리지에도 백업 (새로고침 대비)
        sessionStorage.setItem("current_article", JSON.stringify(res.data));
        nav("/article", { replace: true, state: { data: res.data } });
      } catch (e: any) {
        console.error(e);
        alert("기사를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        nav("/daily", { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug, nav]);

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
