// 분재 스펙 → gpt-image-2 프롬프트
//
// 핵심 과제 두 가지:
//  1) 분재의 "수형(樹形)"을 은유에 맞게 묘사 (갈지자 = 옆으로 뻗은 가지)
//  2) 어노테이션 텍스트(라벨)를 이미지에 정확히 그리게 하기
//     — 이미지 모델은 텍스트, 특히 한글을 잘 깨뜨린다.
//       대응: 라벨을 따옴표로 격리 + "정확히 이 글자" 강조 + 개수 제한.

const STYLE = {
  ink: {
    base:
      "Traditional East Asian ink-wash painting (sumi-e / 수묵화) of a single bonsai tree. " +
      "Soft monochrome ink gradients, visible brush strokes, subtle bleed on textured hanji (Korean mulberry paper) background. " +
      "Muted, elegant, lots of negative space. A faint vermilion seal stamp in a corner.",
    labelStyle:
      "Labels are written in clean small black brush-style calligraphy on thin cream paper tags (지편) tied to each part, " +
      "or as neat handwritten annotations with thin leader lines pointing to the part.",
  },
  illustration: {
    base:
      "Clean modern flat vector illustration of a single bonsai tree, soft pastel palette, " +
      "gentle 3D depth, smooth shapes, minimal and friendly. Plain soft-gradient background.",
    labelStyle:
      "Labels are crisp sans-serif text in small rounded label chips connected by thin leader lines to each part.",
  },
  watercolor: {
    base:
      "Soft watercolor illustration of a single bonsai tree, warm gentle washes, " +
      "light paper texture, cozy and personal like a profile card. Plenty of white space.",
    labelStyle:
      "Labels are tidy handwritten-style text on small watercolor tags with thin leader lines to each part.",
  },
  // 수묵담채(水墨淡彩) — 수묵의 절제·여백·붓맛은 그대로, 옅은 채색만 은은하게 얹는다.
  // 순수 수묵(ink)보다 화사하지만 분재의 기품을 1도 버리지 않는 외부 어필용.
  tint: {
    base:
      "Traditional East Asian ink-and-light-color painting (수묵담채, ink-wash with delicate watercolor tint) of a single bonsai tree. " +
      "Built on soft monochrome ink brushwork with visible strokes and gentle ink bleed, then lightly tinted with SUBTLE, MUTED washes of color: " +
      "soft sage/celadon green in the foliage, a faint warm earth-brown on the trunk and bark, a pale slate-blue or terracotta pot, " +
      "and gentle muted vermilion/orange on the fruit. " +
      "The color is restrained and translucent — like Korean/Chinese literati painting — never saturated, never neon. " +
      "Textured hanji (Korean mulberry paper) background with LOTS of calm negative space and air. " +
      "Elegant, refined, quietly striking. A small vermilion seal stamp in a corner.",
    labelStyle:
      "Labels are clean, legible small calligraphic text on thin cream paper tags (지편) tied to each part, " +
      "with thin leader lines pointing to the part. Crisp enough to read clearly, but in keeping with the painting's calm refinement.",
  },
};

// 사람마다 결정적 시드(이름·역할·연차). 같은 발산도여도 휨 방향/굽이 수를 흔들어 안 똑같게.
function seedFrom(spec) {
  const s = `${spec.displayName || ""}|${spec.trunk?.label || ""}|${spec.years ?? ""}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 수형(樹形): "직무가 서로 얼마나 다른가"(divergence 1~10)가 줄기 휨·가지 펼침의 양을 정한다.
//   낮으면 곧게(외길), 높으면 갈지자로 크게. 시드는 방향(좌/우)·굽이 수만 흔든다.
function shapeFrom(divergence, seed) {
  const d = Math.max(1, Math.min(10, divergence || 5));
  const lean = seed % 2 ? "left" : "right";
  const back = lean === "left" ? "right" : "left";
  if (d <= 3) {
    return (
      `TREE FORM (low divergence — one focused path): a FORMAL-UPRIGHT (chokkan) bonsai. ` +
      `The trunk rises almost STRAIGHT and tall with a clean taper, only a subtle lean to the ${lean}. ` +
      `Branches stay close to the trunk, short and tiered, fanning NARROWLY. Calm, vertical, disciplined.`
    );
  }
  if (d <= 6) {
    return (
      `TREE FORM (medium divergence — adjacent fields): an INFORMAL-UPRIGHT (moyogi) bonsai with MODERATE movement. ` +
      `The trunk makes a gentle S-curve leaning toward the ${lean}, then settles upright. ` +
      `Branches fan out to BOTH sides at moderate angles — balanced but organic.`
    );
  }
  const bends = 3 + (seed % 2); // 3~4 굽이
  return (
    `TREE FORM (high divergence — very different fields): a WINDSWEPT / SLANTING bonsai that ZIG-ZAGS DRAMATICALLY. ` +
    `The trunk makes ${bends} sharp directional changes, swinging FAR to the ${lean} then back to the ${back} as it climbs. ` +
    `Branches fork out WIDE and far at strong angles, asymmetric and characterful — a career that grew laterally, yet all ONE connected tree.`
  );
}

// 생애 단계 — 연차에 따른 "원숙함"의 차이.
// ⚠️ 의도적으로 줄기를 굵히지 않는다: 연차가 쌓여도 분재는 "굵은 나무"가 되지 않는다.
//    분재의 기품은 굵기가 아니라 가지의 분기·수형의 원숙함·여백의 깊이로 표현한다.
//    세 단계 모두 줄기 굵기는 동일(가늘고 단정한 한 줄기)하게 유지하고,
//    차이는 가지 수 / 수형의 다듬어짐 / 잔가지의 섬세함 / 여백의 깊이로만 둔다.
const TRUNK_RULE =
  "TRUNK THICKNESS — IMPORTANT: keep the trunk SLENDER and refined regardless of age. " +
  "This is a bonsai, NOT a full-grown tree: the trunk stays thin and elegant, never thickening into a stout, " +
  "heavy, log-like trunk. Do NOT make it gnarled, swollen, or massive with age — seniority shows in poise, not girth.";

const MATURITY = {
  sapling:
    "MATURITY: This is a YOUNG bonsai sapling — early in its life. " +
    TRUNK_RULE + " " +
    "It has only a few short, simple branches and a sparse, light canopy with few leaves; the silhouette is plain and unrefined. " +
    "The tree occupies the lower-center of the pot and leaves a LOT of empty space and air around and above it. " +
    "Keep the pot modest. The whole tree reads as fresh, simple, and still finding its form — yet already slender and graceful.",
  young:
    "MATURITY: This is a MID-LIFE bonsai — established and gaining character. " +
    TRUNK_RULE + " " +
    "The SAME slender trunk now carries a richer, more articulated branch structure: more branches forking at considered angles, " +
    "finer twigs, and a fuller (but still airy, never dense) canopy. The form is becoming intentional and balanced. " +
    "Generous open space remains around it.",
  old:
    "MATURITY: This is a MATURE, REFINED bonsai with many years of careful cultivation — venerable in BEARING, not in bulk. " +
    TRUNK_RULE + " " +
    "Its dignity comes from REFINEMENT, not size: the same slim trunk traces an elegant, well-resolved line; " +
    "the branch structure is intricate and beautifully ramified with delicate twigs and a graceful, harmonious silhouette. " +
    "The roots spread tidily over the soil (subtle nebari) without thickening into heavy buttresses. " +
    "The composition is calm, masterful, and deeply composed, with serene negative space — clearly an accomplished, senior bonsai, " +
    "yet still a small, slender, exquisitely kept tree.",
};

// 라벨 텍스트를 안전하게 만든다.
// ko: 부위명(한글) + ': ' + 항목 라벨
// en: 부위명(영문) + ': ' + 항목 라벨 (한글 항목은 그대로 두되 영문 부위명으로 깨짐 위험 분산)
const PART_NAMES = {
  ko: { fruit: "열매", branch: "가지", trunk: "줄기", root: "뿌리" },
  en: { fruit: "Fruit", branch: "Branch", trunk: "Trunk", root: "Root" },
};

function thicknessWord(t) {
  return ["very thin", "thin", "medium", "thick", "very thick"][clampIdx(t)] || "medium";
}
function clampIdx(t) {
  return Math.max(0, Math.min(4, (t || 3) - 1));
}

// ⚠️ 프롬프트 인젝션 방어 (이미지 단계).
// 사용자 텍스트는 추출(extract.mjs)을 거쳐도 label/motto/displayName 같은 "내용"으로
// 이 프롬프트에 흘러든다. 이 값들은 따옴표로 감싸 슬롯에 넣는데, 큰따옴표나 개행이
// 섞이면 슬롯("...")을 깨고 빠져나와 gpt-image-2에 대한 자유 지시문이 될 수 있다.
// → 큰따옴표류/백틱을 제거하고, 개행·탭 등 모든 공백류를 단일 공백으로 접고, 길이를 클램프해
//   슬롯 탈출과 분량 폭주를 막는다.
//   (어포스트로피 '는 "L'Oréal" 같은 정상 라벨을 위해 보존; 슬롯은 "..."이라 깨지지 않는다.)
function clean(s, max = 80) {
  return String(s ?? "")
    .replace(/["“”„`]/g, "") // 슬롯을 감싼 큰따옴표/백틱 제거 (슬롯 탈출 방지)
    .replace(/\s+/g, " ")    // 개행·탭 등 공백류 → 단일 공백 (개행 인젝션 차단)
    .trim()
    .slice(0, max);
}

// 한 줄 라벨 문자열 (따옴표로 감쌀 원문) — 정제 후 반환
function labelText(partKey, itemLabel, lang) {
  const part = PART_NAMES[lang][partKey];
  return `${part}: ${clean(itemLabel, 48)}`;
}

export function buildPrompt(spec, { style = "ink", lang = "ko" } = {}) {
  const S = STYLE[style] || STYLE.ink;
  const seed = seedFrom(spec);
  const shape = shapeFrom(spec.divergence, seed);
  const maturity = MATURITY[spec.maturity] || MATURITY.young;
  const P = PART_NAMES[lang];

  // ---- 각 부위 묘사 + 라벨 수집 ----
  const labels = []; // 정확히 그려야 할 라벨 문자열 모음 (검수/강조용)

  // ⚠️ 단일 연결 나무 제약 — 부위를 따로 묘사하면 모델이 조각낸다.
  //    모든 부위가 물리적으로 하나로 이어진 나무임을 최우선으로 못박는다.
  const unityRule =
    `CRITICAL STRUCTURE: This is ONE single continuous bonsai tree. ` +
    `The roots rise into one solid unbroken trunk, and EVERY branch physically grows OUT OF that same trunk. ` +
    `There must be NO floating, detached, or disconnected parts: no leaf clusters hovering in the air, ` +
    `no branch separated from the trunk, no gap or break anywhere along the tree. ` +
    `Trace from any leaf down through its branch, into the trunk, down to the roots — the line is always unbroken.`;

  // 커리어 일관성 — 추출된 핵심 정체성(spine)을 나무 전체의 "주제 앵커"로 주입한다.
  // 물리적 연결(unityRule)에 더해, 의미적으로도 "한 사람의 일관된 커리어"로 묶는다.
  // spine은 사용자 파생이라 clean()으로 정제하고, 라벨이 아니라 구성 지침으로만 쓴다(이미지에 글자로 그리지 않게 명시).
  const spine = clean(spec.trunk.caption || "", 160);
  const coherenceRule =
    `CAREER COHERENCE: this whole tree portrays ONE person` +
    (spine ? ` whose core identity is — ${spine}` : "") +
    `. The branches (side competencies), roots (depth) and fruits (achievements) are all different facets of that SAME identity; ` +
    `compose them as one coherent career told as a single connected story, not a set of unrelated tags. ` +
    `(This is guidance for the composition and mood only — do NOT render this sentence as text in the image.)`;

  // 줄기 (연결의 중심축)
  const trunkLabel = labelText("trunk", spec.trunk.label || spec.displayName, lang);
  labels.push(trunkLabel);
  const trunkDesc =
    `THE TRUNK: one continuous main stem rising from the roots up to the crown, representing the core identity. ` +
    `All branches fork off from this single trunk. Tag the trunk with the label "${trunkLabel}".`;

  // 가지 (줄기에서 갈라져 나옴)
  const branchLines = spec.branches.map((b, i) => {
    const lbl = labelText("branch", b.label, lang);
    labels.push(lbl);
    // 가지 위치도 사람마다 다르게: 시드로 시작 방향을 흔든다.
    const side = (i + seed) % 2 === 0 ? "left" : "right";
    return `one ${thicknessWord(b.thickness)}, ${b.length} branch that grows out of the trunk and reaches to the ${side} ` +
      `in the ${b.height} area, ending in about ${b.twigCount} small leafy twigs, tagged "${lbl}"`;
  });
  const branchDesc =
    `THE BRANCHES (lateral competencies grown out to the side), each one clearly attached to the trunk: ` +
    branchLines.join("; ") + ".";

  // 열매 (그 가지 끝에 매달림 — 가지에 종속)
  const fruitLines = spec.fruits.map((f) => {
    // badge가 라벨에 이미 포함됐거나(중복) 순수 숫자면(날조 의심) 무시한다.
    const b = (f.badge || "").trim();
    const badge = b && !/^\d+$/.test(b) && !f.label.includes(b) ? b : null;
    const text = badge ? `${f.label} ${badge}` : f.label;
    const lbl = labelText("fruit", text, lang);
    labels.push(lbl);
    return `a ${f.size} ripe fruit hanging from the tip of one of the tree's branches, tagged "${lbl}"`;
  });
  const fruitDesc = spec.fruits.length
    ? `THE FRUITS (external achievements), each hanging from a branch (never floating free): ` +
      fruitLines.join("; ") + "."
    : "";

  // 뿌리 (줄기 밑동에서 뻗어나옴)
  const rootLines = spec.roots.map((r) => {
    const lbl = labelText("root", r.label, lang);
    labels.push(lbl);
    const depthWord =
      r.depth === "deep" ? "deep, thick" : r.depth === "medium" ? "medium-depth" : "shallow";
    const reachWord =
      (r.reach || "").includes("long") ? "flaring WIDE and far across the soil"
      : (r.reach || "").includes("medium") ? "spreading moderately"
      : "compact and close to the trunk";
    return `a ${depthWord} root ${reachWord}, tagged "${lbl}"`;
  });
  const rootDesc =
    `THE ROOTS (the depth that followed), all flaring out from the base of the same trunk and partly exposed ` +
    `over the bonsai pot soil (nebari): ` +
    rootLines.join("; ") + ".";

  // 화분 + 제목 — displayName도 사용자 파생이라 정제해서 슬롯에 넣는다.
  const safeName = clean(spec.displayName, 48);
  const potDesc =
    `The bonsai sits in a simple ceramic bonsai pot. ` +
    `At the top, a title reads "${safeName}의 분재" ${
      lang === "en" ? `(also acceptable: "${safeName}'s Bonsai")` : ""
    }.`;

  // ---- 텍스트 정확도 지시 ----
  const exactList = labels.map((l) => `"${l}"`).join(", ");
  const textRule =
    `\nTEXT ACCURACY (critical): The image MUST contain these annotation labels, spelled EXACTLY, ` +
    `each connected to the correct part: ${exactList}. ` +
    (lang === "ko"
      ? `The labels are in KOREAN (Hangul). Render every Hangul character precisely and legibly; ` +
        `do NOT invent, distort, or use fake/garbled Korean-looking glyphs. `
      : `Render every character precisely and legibly. `) +
    `${S.labelStyle} Keep labels tidy and readable so they don't overwhelm the image. ` +
    (style === "ink" || style === "tint"
      ? `No extra text, no watermark, no signature other than the seal stamp.`
      : `No extra text, no watermark, no signature.`);

  // ---- 최종 조립 ----
  // unityRule을 스타일 바로 뒤(부위 묘사 앞)에 둬서 "하나의 나무"를 먼저 각인.
  const prompt = [
    S.base,
    shape,
    maturity,
    unityRule,
    coherenceRule,
    trunkDesc,
    branchDesc,
    fruitDesc,
    rootDesc,
    potDesc,
    spec.motto ? `Overall mood: "${clean(spec.motto, 120)}".` : "",
    `Composition: ONE complete bonsai tree shown whole and unbroken — connected roots, trunk, branches and leaves — ` +
      `with the pot and exposed roots fully visible, centered, leaving margin around the edges for the labels. Portrait orientation.`,
    textRule,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { prompt, labels };
}
