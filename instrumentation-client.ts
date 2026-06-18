// Sentry 클라이언트(브라우저) 초기화. (Next 15.3+ 의 instrumentation-client 규약)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  sendDefaultPii: false,
  // ⚠️ 세션 리플레이는 의도적으로 켜지 않음 —
  //    랜딩 textarea의 이력서 입력이 캡처될 위험(PII). replayIntegration() 추가 금지.
});

// 클라이언트 라우터 전환 트레이싱
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
