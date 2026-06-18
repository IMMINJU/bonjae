// Sentry 서버(Node 런타임) 초기화. instrumentation.ts가 로드한다.
// 백그라운드 파이프라인 실패(이미지 생성/추출/모더레이션) 캡처가 핵심 가치.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1, // 저트래픽이라 전량 트레이싱. 트래픽 늘면 낮추기.
  // 이력서(PII)를 다루므로 기본 PII 전송 끔(IP·헤더·쿠키·요청 바디 미수집).
  sendDefaultPii: false,
});
