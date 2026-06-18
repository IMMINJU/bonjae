import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy
// 앱이 실제로 쓰는 출처만 허용한다:
//  - Google Fonts: fonts.googleapis.com(CSS) / fonts.gstatic.com(폰트)  ← layout.tsx의 <link>
//  - 생성 이미지: *.public.blob.vercel-storage.com  (img + 다운로드용 fetch)
//  - 인라인 스타일: React inline style + styled-jsx → 'unsafe-inline'
//  - 스크립트: Next 부트스트랩 인라인 스크립트 → 'unsafe-inline'
//    (개발 모드는 HMR이 eval을 써서 'unsafe-eval'도 필요)
// 참고: 더 강하게 가려면 미들웨어로 per-request nonce를 붙여 'unsafe-inline'을 제거할 수 있다.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Vercel Analytics/Speed Insights 스크립트(va.vercel-scripts.com). 비콘은 same-origin(resilient intake)이라 connect-src 'self'로 충분.
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.public.blob.vercel-storage.com",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // HSTS — Vercel은 HTTPS로 서빙. 프로덕션에서만.
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig = {
  // 생성 이미지는 Vercel Blob에 저장 → 외부 도메인 허용
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI, // 빌드 로그 조용히 (CI에선 출력)
  // 클라이언트 Sentry 이벤트를 same-origin(/monitoring)으로 터널링 →
  // CSP(connect-src 'self')로 충분하고 광고차단도 우회. 소스맵 업로드는 SENTRY_AUTH_TOKEN 있을 때만.
  tunnelRoute: "/monitoring",
});
