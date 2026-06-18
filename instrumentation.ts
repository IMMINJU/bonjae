// 서버/엣지 런타임에 맞는 Sentry 설정을 로드하고, 라우트/RSC 에러 캡처 훅을 노출한다.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// 라우트 핸들러·서버 컴포넌트에서 새는(throw) 에러 자동 캡처.
export const onRequestError = Sentry.captureRequestError;
