// 백그라운드 파이프라인: 텍스트 → 추출 → 매핑 → 프롬프트 → 이미지 → Blob → DB
// POST /api/generate에서 waitUntil로 호출된다.
import * as Sentry from "@sentry/nextjs";
import { put } from "@vercel/blob";
import { getOpenAI, generateImage, moderateText } from "./openai.mjs";
import { extractProfile } from "./extract.mjs";
import { mapProfileToBonsai } from "./mapping.mjs";
import { buildPrompt } from "./prompt-builder.mjs";
import { setProcessing, setProfile, setDone, setError } from "./db.mjs";

export async function runPipeline(jobId, text, { style = "tint", lang = "ko" } = {}) {
  try {
    await setProcessing(jobId);

    // ⓪ 입력 모더레이션 — 결과물이 공개·공유되므로 부적절 입력을 먼저 거른다.
    const flagged = await moderateText(text);
    if (flagged) {
      const cats = Object.entries(flagged.categories || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ");
      const e = new Error(`moderation flagged: ${cats || "unknown"}`);
      e.userMessage = "입력에 부적절한 내용이 있어 분재를 만들 수 없어요.";
      throw e;
    }

    // ① LLM 추출: 자유 텍스트 → 공통 스키마
    const client = getOpenAI();
    const profile = await extractProfile(client, text);
    await setProfile(jobId, profile); // 이미지 전이라도 추출 결과 먼저 저장(프론트가 미리 표시 가능)

    // ② 매핑 → ③ 프롬프트
    const spec = mapProfileToBonsai(profile);
    const { prompt } = buildPrompt(spec, { style, lang });

    // ④ 이미지 생성
    const { buffer } = await generateImage(prompt, { size: "1024x1536", quality: "high" });

    // ⑤ Vercel Blob 업로드 → 공개 URL
    const { url } = await put(`bonsai/${jobId}.png`, buffer, {
      access: "public",
      contentType: "image/png",
    });

    // ⑥ 완료 기록
    await setDone(jobId, url, profile);
    return { url, profile, spec };
  } catch (err) {
    // 모더레이션 차단(userMessage 있음)은 정상 거절이라 제외, 진짜 시스템 에러만 Sentry로.
    if (!err?.userMessage) {
      Sentry.captureException(err, { tags: { area: "pipeline" }, extra: { jobId } });
    }
    // 상세(스택·내부 에러)는 서버 로그로만. 사용자에겐 안전한 일반 메시지만 저장.
    console.error("[pipeline] 실패", jobId, err);
    const userMsg =
      err?.userMessage || "분재를 그리는 데 실패했어요. 잠시 후 다시 시도해주세요.";
    await setError(jobId, userMsg);
    throw err;
  }
}
