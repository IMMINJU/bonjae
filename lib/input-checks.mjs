// 입력 검증 헬퍼 — 클라이언트·서버 공용(외부/노드 의존성 없는 순수 함수).

// http(s)://… , www.… , 또는 domain.tld/경로 형태의 링크.
// (경로 없는 맨 도메인 "vercel.app", "Vue.js"는 일부러 제외 — 정상 본문 오탐 방지)
const URL_RE = /(?:https?:\/\/|www\.)\S+|[\w-]+\.[a-z]{2,}\/\S*/gi;

export const URL_ONLY_MESSAGE =
  "링크는 아직 읽지 못해요. 링크 속 내용(자기소개·경력)을 복사해서 붙여넣어 주세요.";

/**
 * 입력이 "사실상 링크뿐"인지 판별한다.
 *
 * 우리 파이프라인은 URL을 fetch하지 않으므로(웹 브라우징 없음) 링크만 넣으면
 * 모델이 못 읽고 엉뚱한 경력을 지어낸다(환각). 그런 입력을 사전에 막기 위한 검사다.
 * 정상 이력서에 섞인 github/포트폴리오 링크는 본문이 충분하므로 통과시킨다.
 *
 * 판별: URL을 제거한 뒤 남는 실질 텍스트(글자·숫자)가 거의 없으면 링크뿐으로 본다.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function looksLikeUrlOnly(text) {
  const t = (text || "").trim();
  if (!t) return false;
  const withoutUrls = t.replace(URL_RE, " ");
  const hadUrl = withoutUrls.length < t.length; // URL이 제거되어 길이가 줄었나
  const meaningful = (withoutUrls.match(/[\p{L}\p{N}]/gu) || []).length;
  return hadUrl && meaningful < 15; // 링크 빼면 실질 텍스트가 거의 없음
}
