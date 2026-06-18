import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// 배포 도메인은 Vercel이 주입(프로덕션 고정 URL). 로컬은 폴백.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const DESC =
  "내 이야기를 붙여넣으면, 가지·뿌리·열매로 자란 나만의 분재가 됩니다. 커리어를 수묵담채 분재 그림으로.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "분재 — 당신의 커리어를 분재로",
  description: DESC,
  applicationName: "분재",
  openGraph: {
    type: "website",
    siteName: "분재 (Bonjae)",
    locale: "ko_KR",
    url: "/",
    title: "분재 — 당신의 커리어를 분재로",
    description: "커리어를 수묵담채 분재 그림으로 그려주는 서비스",
  },
  twitter: {
    card: "summary_large_image",
    title: "분재 — 당신의 커리어를 분재로",
    description: "커리어를 수묵담채 분재 그림으로 그려주는 서비스",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;700&family=Noto+Sans+KR:wght@300;400;500&family=Josefin+Sans:ital,wght@0,300;0,400;0,600;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
