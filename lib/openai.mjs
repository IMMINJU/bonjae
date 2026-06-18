// OpenAI 클라이언트 + gpt-image-2 헬퍼 (서버 전용)
import OpenAI from "openai";

let _client = null;
export function getOpenAI() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY 누락");
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * 프롬프트로 gpt-image-2 이미지를 생성해 PNG Buffer로 반환.
 * @param {string} prompt
 * @param {object} [opts] { size, quality }
 * @returns {Promise<{buffer: Buffer, usage: object}>}
 */
export async function generateImage(prompt, opts = {}) {
  const client = getOpenAI();
  const size = opts.size || "1024x1536";
  const quality = opts.quality || "high";
  const res = await client.images.generate({
    model: "gpt-image-2",
    prompt,
    n: 1,
    size,
    quality,
  });
  const b64 = res?.data?.[0]?.b64_json;
  if (!b64) throw new Error("이미지 응답 비어 있음");
  return { buffer: Buffer.from(b64, "base64"), usage: res.usage };
}

/**
 * 입력 텍스트 모더레이션. 결과가 공개·공유되므로 부적절 입력을 사전 차단한다.
 * 무료 엔드포인트(omni-moderation-latest).
 * @param {string} text
 * @returns {Promise<object|null>} flagged면 결과 객체(categories 포함), 아니면 null
 */
export async function moderateText(text) {
  const client = getOpenAI();
  const res = await client.moderations.create({
    model: "omni-moderation-latest",
    input: String(text || "").slice(0, 6000),
  });
  const r = res?.results?.[0];
  return r?.flagged ? r : null;
}
