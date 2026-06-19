// 프로필 → 분재 스펙
// 은유의 핵심. 어떤 직군의 프로필이든 이 함수를 통과하면 분재 한 그루가 된다.
//
// 진유림 발표 매핑 (직군 중립):
//   줄기 = 핵심 정체성       "나는 무엇을 하는 사람인가"
//   가지 = 옆으로 뻗은 역량   곁다리로 키운 것들
//   열매 = 외부 검증된 성과   남들이 인정한 결과물
//   뿌리 = 따라온 깊이        파고든 전문 영역
//
// 공통 추상 스키마: 모든 항목은 { label, weight(1~10), note }.
//   weight는 직군 무관한 "비중/굵기" 단위.
//   - 개발자: 글 수·★ 개수를 1~10으로 환산
//   - 요리사: 수상 경력·담당 메뉴 비중 등
//   - 간호사: 담당 환자군·자격증 깊이 등
//   매핑 로직은 weight만 본다. 의미 부여는 프로필 작성자의 몫.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// weight(1~10)를 1~5 굵기 등급으로 정규화.
function toThickness(weight) {
  const w = clamp(weight ?? 5, 1, 10);
  return clamp(Math.round((w / 10) * 5), 1, 5);
}

// weight(1~10)를 깊이/크기 단계로.
function toDepth(weight) {
  const w = clamp(weight ?? 5, 1, 10);
  if (w >= 7) return "deep";
  if (w >= 4) return "medium";
  return "shallow";
}
function toSize(weight) {
  const w = clamp(weight ?? 5, 1, 10);
  if (w >= 8) return "large";
  if (w >= 4) return "medium";
  return "small";
}
// weight(1~10) → 길이/뻗음 (가지가 얼마나 길게, 뿌리가 얼마나 멀리 뻗는지).
function toReach(weight) {
  const w = clamp(weight ?? 5, 1, 10);
  if (w >= 8) return "long, far-reaching";
  if (w >= 5) return "medium-length";
  return "short";
}
// weight(1~10) → 잎/잔가지 수 (비중 큰 역량일수록 잎이 무성).
function toLeafiness(weight) {
  const w = clamp(weight ?? 5, 1, 10);
  return clamp(Math.round(w / 1.8), 2, 6);
}

export function mapProfileToBonsai(profile) {
  const {
    branches = [],
    roots = [],
    fruits = [],
    identity,
    character = {},
  } = profile;

  // 가지: 비중 큰 것부터. 최대 4개(그림이 복잡해지지 않게).
  const mappedBranches = [...branches]
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 4)
    .map((b, i) => ({
      label: b.label,
      note: b.note,
      thickness: toThickness(b.weight),
      length: toReach(b.weight), // 비중 큰 역량 = 길고 멀리 뻗는 가지
      // 좌우 번갈아 뻗기 — 갈지자 느낌
      side: i % 2 === 0 ? "left" : "right",
      // 위에서부터 아래로 배치 (굵은 게 위쪽 = 주력)
      height: ["upper", "mid-upper", "mid", "lower"][i] || "mid",
      // 잎/잔가지 수: 비중 클수록 무성 (twigs 힌트 있으면 우선)
      twigCount: clamp((b.twigs || []).length || toLeafiness(b.weight), 2, 6),
    }));

  // 뿌리: 깊은 것부터. 최대 4개.
  const mappedRoots = [...roots]
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 4)
    .map((r) => ({
      label: r.label,
      note: r.note,
      depth: toDepth(r.weight),
      reach: toReach(r.weight), // 비중 큰 전문성 = 멀리·많이 뻗는 뿌리
    }));

  // 열매: 비중 큰 것부터. 최대 3개.
  // 선택적 badge(예: "★10", "대상")가 있으면 라벨에 덧붙일 수 있게 보존.
  const mappedFruits = [...fruits]
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 3)
    .map((f) => ({
      label: f.label,
      badge: f.badge || null,
      note: f.note,
      size: toSize(f.weight),
    }));

  // 거쳐온 직군 목록(roleFamilies)의 '개수'로 줄기 휨 강도(divergence 1~10) 결정.
  // LLM은 직군을 "나열"만 하고(열거가 단일 숫자보다 안정적), 스케일은 코드가:
  // 1직군→곧게, 2→S자, 3→갈지자, 4+→큰 갈지자.
  const rf = clamp(
    (Array.isArray(character.roleFamilies) ? character.roleFamilies.length : 0) || 1,
    1,
    6
  );
  const divergence = rf >= 4 ? 9 : rf === 3 ? 8 : rf === 2 ? 5 : 2;

  // 생애 단계(maturity): 나무 전체의 크기·굵기·수령을 결정.
  // 주니어면 작고 가는 묘목, 시니어면 크고 굵은 노목.
  // ⚠️ 연차(years)가 주 신호다. 시각적 수령이 연차를 배신하면 안 된다
  //    (예전엔 5년차가 항목이 적으면 묘목으로 그려졌다 — 모순).
  const years = identity?.years ?? 5;
  const itemCount =
    mappedBranches.length + mappedRoots.length + mappedFruits.length;

  // 1) 연차 기반 바닥: >=10 노목, >=4 중간(established), 그 미만 묘목.
  const byYears = years >= 10 ? "old" : years >= 4 ? "young" : "sapling";
  // 2) 항목 풍부함(가지+뿌리+열매)은 보조 신호 — 위로만 부스트한다.
  const yearScore = clamp(years / 15, 0, 1);
  const itemScore = clamp(itemCount / 11, 0, 1);
  const maturityScore = clamp(yearScore * 0.7 + itemScore * 0.3, 0, 1);
  const byScore =
    maturityScore < 0.35 ? "sapling" :
    maturityScore < 0.7 ? "young" :
    "old";
  // 연차 바닥과 점수 중 더 성숙한 쪽: 성과가 많으면 한 단계 올라가되, 연차보다 어려지진 않는다.
  const STAGES = ["sapling", "young", "old"];
  const maturity =
    STAGES[Math.max(STAGES.indexOf(byYears), STAGES.indexOf(byScore))];

  return {
    id: profile.id,
    displayName: profile.displayName || profile.id,
    trunk: {
      label: identity?.role,
      years: identity?.years,
      caption: identity?.spine,
    },
    branches: mappedBranches,
    roots: mappedRoots,
    fruits: mappedFruits,
    divergence,      // 1~10 (직무 발산도 → 줄기 휨·가지 펼침)
    maturity,        // "sapling" | "young" | "old"
    maturityScore,   // 0~1 (디버그/표시용)
    years,
    motto: character.motto,
  };
}
