import { ImageResponse } from "next/og";

// 랜딩(및 별도 OG 미지정 페이지)의 기본 공유 카드. 1200×630.
// 한글 폰트(대용량)를 OG 라우트에서 받지 않도록 텍스트는 라틴으로, 분위기는
// 앱과 동일한 수묵 톤(한지색 배경·얇은 프레임·낙관)으로 잡는다.
export const alt = "분재 — 당신의 커리어를 분재로";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#efe9db",
          color: "#1c1610",
          position: "relative",
        }}
      >
        {/* 얇은 프레임 */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "1px solid rgba(28,22,16,0.18)",
          }}
        />
        {/* 낙관(인장) */}
        <div
          style={{
            position: "absolute",
            top: 74,
            left: 74,
            width: 46,
            height: 46,
            background: "#b5482f",
            borderRadius: 6,
          }}
        />

        {/* 미니 분재 모티프 (순수 CSS) */}
        <div style={{ display: "flex", position: "relative", width: 260, height: 180, marginBottom: 14 }}>
          <div style={{ position: "absolute", top: 0, left: 70, width: 120, height: 120, borderRadius: 999, background: "rgba(122,158,139,0.5)" }} />
          <div style={{ position: "absolute", top: 30, left: 20, width: 90, height: 90, borderRadius: 999, background: "rgba(122,158,139,0.42)" }} />
          <div style={{ position: "absolute", top: 28, left: 150, width: 86, height: 86, borderRadius: 999, background: "rgba(122,158,139,0.42)" }} />
          <div style={{ position: "absolute", top: 96, left: 124, width: 12, height: 70, background: "#5a4632" }} />
          <div style={{ position: "absolute", top: 162, left: 92, width: 76, height: 18, borderRadius: 5, background: "#8a98a0" }} />
        </div>

        <div style={{ fontSize: 22, letterSpacing: 10, textTransform: "uppercase", color: "#6e5e50", marginBottom: 18 }}>
          Career · Bonjae
        </div>
        <div style={{ fontSize: 116, fontWeight: 700, lineHeight: 1 }}>Bonjae</div>
        <div style={{ fontSize: 33, color: "#3a322a", marginTop: 26, maxWidth: 860, textAlign: "center" }}>
          Your career, drawn as an ink-wash bonsai
        </div>
        <div style={{ fontSize: 21, color: "#7a9e8b", marginTop: 30, letterSpacing: 3 }}>
          trunk · branches · roots · fruit · light
        </div>
      </div>
    ),
    { ...size }
  );
}
