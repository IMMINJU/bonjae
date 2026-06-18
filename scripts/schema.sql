-- 분재 jobs 테이블
-- status: pending → processing → done | error
CREATE TABLE IF NOT EXISTS jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status      text NOT NULL DEFAULT 'pending',
  -- input_text(원문=PII)는 더 이상 저장하지 않는다(항상 NULL). 컬럼은 호환 위해 유지.
  -- createJob이 원문을 넣지 않고, setDone/setError도 NULL을 보장(방어).
  input_text  text,
  style       text NOT NULL DEFAULT 'tint',
  lang        text NOT NULL DEFAULT 'ko',
  -- ip: 레이트리밋(IP당 한도) 집계용. 신뢰 프록시(Vercel)가 넣는 클라이언트 IP.
  ip          text,
  profile_json jsonb,
  image_url   text,
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 기존 테이블 마이그레이션(이미 만들어진 DB에도 안전하게 적용)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ip text;
ALTER TABLE jobs ALTER COLUMN input_text DROP NOT NULL;

CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs (created_at DESC);
-- 레이트리밋 카운트 쿼리(WHERE ip=? AND created_at > now()-interval)용 복합 인덱스
CREATE INDEX IF NOT EXISTS jobs_ip_created_at_idx ON jobs (ip, created_at DESC);
