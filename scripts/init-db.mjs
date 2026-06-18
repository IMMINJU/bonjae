// Neon에 스키마 적용. 실행: node scripts/init-db.mjs
// DATABASE_URL은 .env.local 또는 환경변수에서 읽음.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local 간단 로더
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (k && !(k in process.env)) process.env[k] = v;
  }
}
// .env.local을 먼저(우선순위 높음), 그다음 .env. (loadEnv는 first-write-wins)
loadEnv(path.resolve(__dirname, "..", ".env.local"));
loadEnv(path.resolve(__dirname, "..", ".env"));

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL 없음 (.env.local 또는 환경변수)");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

// neon http 드라이버는 태그드 템플릿으로만 호출 가능(sql.query 없음).
// 동적 문자열은 template-strings 형태로 감싸 호출한다.
function raw(queryString) {
  const tpl = Object.assign([queryString], { raw: [queryString] });
  return sql(tpl);
}

// 멀티스테이트먼트를 분리 실행
const statements = schema.split(";").map((s) => s.trim()).filter(Boolean);
for (const stmt of statements) {
  await raw(stmt);
  console.log("✅", stmt.split("\n")[0].slice(0, 60));
}
console.log("스키마 적용 완료");
