"use client";

// 루트 레벨 React 렌더링 에러 바운더리. Sentry로 보고 + 분재 톤의 폴백 화면.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          background: "#efe9db",
          color: "#1c1610",
          fontFamily: "serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 26, margin: 0 }}>분재</h1>
        <p style={{ color: "#6e5e50", margin: 0 }}>
          문제가 발생했어요. 잠시 후 다시 시도해주세요.
        </p>
      </body>
    </html>
  );
}
