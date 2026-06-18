// Sentry 엣지 런타임 초기화. (이 앱은 엣지를 쓰지 않지만 Next가 로드할 수 있어 둔다.)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  sendDefaultPii: false,
});
