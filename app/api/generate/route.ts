import { NextRequest, NextResponse } from "next/server";
import { waitUntil, ipAddress } from "@vercel/functions";
import {
  createJob,
  setError,
  countJobsByIpWithinHours,
  countJobsWithinHours,
} from "@/lib/db.mjs";
import { runPipeline } from "@/lib/pipeline.mjs";
import { looksLikeUrlOnly, URL_ONLY_MESSAGE } from "@/lib/input-checks.mjs";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
// gpt-image-2가 ~140초 걸림. Fluid Compute를 켜면 Hobby도 300초까지 → maxDuration=300 동작.
export const maxDuration = 300;

const MAX_LEN = 6000; // 입력 길이 상한 (남용/비용 방지)

// 레이트리밋(남용·비용 방지). 인증 없는 공개 이미지 생성이라 핵심 통제다.
// 별도 인프라 없이 기존 Neon으로 IP·전역 카운트. 환경변수로 튜닝 가능.
const PER_IP_PER_HOUR = Number(process.env.RL_IP_HOUR) || 5;
const PER_IP_PER_DAY = Number(process.env.RL_IP_DAY) || 20;
const GLOBAL_PER_DAY = Number(process.env.RL_GLOBAL_DAY) || 300; // 비용 서킷브레이커

export async function POST(req: NextRequest) {
  let body: { text?: string; style?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "텍스트를 입력해주세요." }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json(
      { error: `텍스트가 너무 깁니다. ${MAX_LEN}자 이내로 줄여주세요.` },
      { status: 400 }
    );
  }

  // 링크만 달랑 넣으면 모델이 못 읽어(웹 fetch 없음) 엉뚱한 경력을 지어낸다 → 사전 안내.
  if (looksLikeUrlOnly(text)) {
    return NextResponse.json({ error: URL_ONLY_MESSAGE }, { status: 400 });
  }

  const style = body.style === "ink" ? "ink" : "tint"; // 기본 수묵담채
  const lang = body.lang === "en" ? "en" : "ko";

  // ── 레이트리밋 ──────────────────────────────────────────────
  // Vercel 프록시가 넣는 클라이언트 IP. 로컬/누락 시 x-forwarded-for → 기본값.
  const ip =
    ipAddress(req) ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0";
  try {
    // 전역 일일 캡 — 청구서 폭탄 방지(서킷브레이커)
    if ((await countJobsWithinHours(24)) >= GLOBAL_PER_DAY) {
      return NextResponse.json(
        { error: "지금 요청이 많아 잠시 생성을 멈췄어요. 잠시 후 다시 시도해주세요." },
        { status: 503, headers: { "Retry-After": "3600" } }
      );
    }
    // IP당 한도 (일 → 시간 순; 먼저 걸리는 쪽에서 차단)
    if (
      (await countJobsByIpWithinHours(ip, 24)) >= PER_IP_PER_DAY ||
      (await countJobsByIpWithinHours(ip, 1)) >= PER_IP_PER_HOUR
    ) {
      return NextResponse.json(
        { error: "요청이 너무 잦아요. 잠시 후 다시 시도해주세요." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }
  } catch (err) {
    // 집계 실패가 서비스를 막지 않게 fail-open. (DB가 죽으면 아래 createJob도 어차피 실패)
    console.error("[generate] 레이트리밋 집계 실패", err);
  }

  let jobId: string;
  try {
    jobId = await createJob(text, style, lang, ip);
  } catch (err) {
    Sentry.captureException(err, { tags: { area: "generate" } });
    console.error("[generate] job 생성 실패", err);
    return NextResponse.json(
      { error: "작업을 시작하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  // 응답은 즉시 반환하고, 무거운 파이프라인은 백그라운드로.
  waitUntil(
    runPipeline(jobId, text, { style, lang }).catch(async (err: unknown) => {
      // runPipeline이 이미 안전한 메시지를 저장하지만, 그 전 단계 실패도 방어.
      // 사용자에겐 일반 메시지만(원시 에러 노출 금지). 상세는 runPipeline이 로깅함.
      try {
        const msg =
          (err as { userMessage?: string })?.userMessage ||
          "분재를 그리는 데 실패했어요. 잠시 후 다시 시도해주세요.";
        await setError(jobId, msg);
      } catch {}
    })
  );

  return NextResponse.json({ jobId }, { status: 202 });
}
