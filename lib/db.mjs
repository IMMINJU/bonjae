// Neon (serverless Postgres) 클라이언트 + jobs 헬퍼 (서버 전용)
import { neon } from "@neondatabase/serverless";

let _sql = null;
export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL 누락");
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// 작업 생성 → id 반환
// 🔒 PII: 원문(이력서)은 DB에 저장하지 않는다. 파이프라인은 원문을 함수 인자(메모리)로
//    받으므로 DB에 보관할 필요가 없다. input_text를 비워 두면 보관 위험 자체가 없어지고,
//    함수가 도중에 죽어 setDone/setError에 못 닿는 "크래시 갭"도 사라진다.
//    (inputText 인자는 호출부 호환을 위해 받기만 하고 저장하지 않는다.)
/**
 * @param {string} _inputText - 받기만 하고 저장하지 않음(PII 미보관)
 * @param {string} [style]
 * @param {string} [lang]
 * @param {string|null} [ip]
 * @returns {Promise<string>}
 */
export async function createJob(_inputText, style = "tint", lang = "ko", ip = null) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO jobs (status, style, lang, ip)
    VALUES ('pending', ${style}, ${lang}, ${ip})
    RETURNING id
  `;
  return rows[0].id;
}

// ── 레이트리밋(남용·비용 방지) ───────────────────────────────────────────────
// 별도 스토어 없이 기존 jobs 테이블로 집계한다. make_interval(hours => N)으로
// 윈도우를 파라미터화해 SQL 인젝션 없이 동적 기간을 쓴다.

// 특정 IP가 최근 N시간 동안 만든 작업 수
export async function countJobsByIpWithinHours(ip, hours) {
  if (!ip) return 0; // ip 없으면(로컬 등) IP 한도 집계 불가 → 0
  const sql = getSql();
  const rows = await sql`
    SELECT count(*)::int AS n FROM jobs
    WHERE ip = ${ip} AND created_at > now() - make_interval(hours => ${hours})
  `;
  return rows[0]?.n ?? 0;
}

// 전체 작업 수(최근 N시간) — 전역 일일 캡(서킷브레이커)용
export async function countJobsWithinHours(hours) {
  const sql = getSql();
  const rows = await sql`
    SELECT count(*)::int AS n FROM jobs
    WHERE created_at > now() - make_interval(hours => ${hours})
  `;
  return rows[0]?.n ?? 0;
}

export async function setProcessing(id) {
  const sql = getSql();
  await sql`UPDATE jobs SET status='processing', updated_at=now() WHERE id=${id}`;
}

export async function setProfile(id, profile) {
  const sql = getSql();
  await sql`UPDATE jobs SET profile_json=${JSON.stringify(profile)}, updated_at=now() WHERE id=${id}`;
}

export async function setDone(id, imageUrl, profile) {
  const sql = getSql();
  // input_text(이력서 원문=PII)는 이후 쓰지 않으므로 완료 시 비워 보관을 최소화한다.
  await sql`
    UPDATE jobs
    SET status='done', image_url=${imageUrl}, profile_json=${JSON.stringify(profile)},
        input_text=NULL, updated_at=now()
    WHERE id=${id}
  `;
}

export async function setError(id, message) {
  const sql = getSql();
  // 실패 시에도 원문 PII는 남기지 않는다(모더레이션에 걸린 입력 포함).
  await sql`UPDATE jobs SET status='error', error=${String(message).slice(0, 1000)}, input_text=NULL, updated_at=now() WHERE id=${id}`;
}

export async function getJob(id) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, status, image_url, profile_json, error, style, created_at
    FROM jobs WHERE id=${id}
  `;
  return rows[0] || null;
}
