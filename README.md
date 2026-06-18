# 🌳 분재 · Bonjae

> 자기소개나 이력서를 붙여넣으면, 당신의 커리어를 **수묵담채 분재 한 그루**로 그려드립니다.
> _Paste your story — get your career drawn as an ink‑wash bonsai._

![license](https://img.shields.io/badge/license-PolyForm%20Noncommercial-c15a3a)
![Next.js](https://img.shields.io/badge/Next.js-15-111)
![AI](https://img.shields.io/badge/AI-gpt--image--2-7a9e8b)

**🔗 [bonjae.vercel.app](https://bonjae.vercel.app) 에서 직접 해보세요**

커리어는 한 그루의 나무처럼 자랍니다. 곧게 오른 줄기, 빛을 향해 뻗은 가지, 깊이 파고든 뿌리, 그리고 맺은 열매. **분재**는 당신이 걸어온 길을 한 폭의 그림으로 압축합니다.

---

## ✨ 어떻게 동작하나요

자유롭게 쓴 글(자기소개·이력서·경력 요약 무엇이든)을 넣으면:

1. **읽기** — AI가 글에서 커리어를 읽어 공통 *분재 스키마*로 구조화합니다.
2. **빚기** — 정체성·역량·성과·연차를 한 그루의 분재 모양으로 매핑합니다.
3. **그리기** — 수묵담채 화풍으로 그려, 이름과 라벨이 붙은 **공유 가능한 이미지**로 돌려줍니다.

약 1~2분이면 나만의 커리어 초상이 완성됩니다.

## 🌲 분재라는 은유

당신의 커리어가 나무의 각 부위로 번역됩니다:

| 부위        | 뜻                                          |
| ----------- | ------------------------------------------- |
| 🪵 **줄기** | 핵심 정체성 — "나는 무엇을 하는 사람인가"   |
| 🌿 **가지** | 빛을 향해 뻗은 옆 역량 (곁가지로 키운 것들) |
| 🍂 **뿌리** | 파고든 전문성의 깊이                        |
| 🍑 **열매** | 외부에서 검증된 성과 (수상·자격·출간…)      |
| ☀️ **빛**   | 향해 자라는 환경·시장                       |

나무의 **모양과 나이**까지 커리어를 닮습니다 — 한 길을 곧게 걸어온 주니어는 *곧게 자란 작은 묘목*으로, 여러 직무·도메인을 갈아탄 시니어는 *옆으로 뻗은 갈지자 노목*으로 그려집니다.

## 🛠 기술 스택

- **Next.js 15** (App Router) · React 18 · Tailwind CSS 4 · TypeScript
- **OpenAI** — `gpt-4.1-mini`(커리어 추출) + `gpt-image-2`(이미지 생성)
- **Neon** (서버리스 Postgres) — 작업 상태
- **Vercel Blob**(이미지 저장) · **Vercel Functions**(Fluid Compute, 백그라운드 생성)

## ⚙️ 동작 방식

이미지 생성이 오래 걸려서(~140초), 요청을 즉시 받아 백그라운드로 처리하고 프론트가 폴링합니다:

```
텍스트 입력
  → POST /api/generate   (레이트리밋·링크검증 → 작업 생성, 202)
       └ 백그라운드(waitUntil):
           ⓪ 모더레이션          부적절 입력 차단
           ① 추출 (gpt-4.1-mini)  글 → 분재 스키마
           ② 매핑                스키마 → 분재 spec
           ③ 프롬프트 빌드        spec → 이미지 프롬프트
           ④ 이미지 (gpt-image-2)
           ⑤ Vercel Blob 업로드
           ⑥ 완료 기록            (원문 PII는 저장 안 함)
  → /result/[id]   (폴링 → 완성되면 이미지 표시·공유)
```

## 🔒 보안 · 프라이버시

인증 없이 누구나 쓰는 공개 입력이라, 다음을 적용했습니다:

- **레이트리밋·비용 캡** — IP별/전역 한도로 남용과 과금 폭주를 막습니다.
- **입력 모더레이션** — 결과가 공개·공유되므로 부적절 입력을 사전 차단.
- **프롬프트 인젝션 방어** — 구조화 출력 + 길이 제한 + "입력은 데이터" 규칙, 이미지 프롬프트 정제.
- **PII 최소화** — 이력서 원문은 DB에 저장하지 않습니다. 결과는 추측 불가한 UUID 링크로만 접근.
- **보안 헤더** — CSP·X-Frame-Options·HSTS 등.

## 🚀 로컬에서 실행

```bash
npm install
cp .env.example .env.local   # OPENAI_API_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN 채우기
npm run db:init              # Neon에 jobs 테이블 생성
npm run dev                  # http://localhost:3000
```

> 로컬 Blob 토큰은 `vercel env pull .env.local`로 받는 게 편합니다.

## ▲ 배포 (Vercel)

1. 저장소를 Vercel 프로젝트로 연결.
2. **Storage**: Neon Postgres + Blob 스토어 연결 → 환경변수 자동 주입.
3. `OPENAI_API_KEY` 환경변수 추가.
4. **Fluid Compute 켜기** — `gpt-image-2`가 ~140초라, Fluid Compute가 켜져 있어야 함수 실행시간이 300초까지 늘어 정상 동작합니다(끄면 60초에 타임아웃).
5. 첫 배포 후 `npm run db:init` 1회 실행.

## 📄 라이선스

[PolyForm Noncommercial License 1.0.0](LICENSE.md)
