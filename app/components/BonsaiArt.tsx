"use client";

// boon(Figma Make)에서 이식한 비주얼 컴포넌트들.
// FilmGrain(A24 그레인), SealStamp(낙관), BonsaiIllustration(인라인 SVG 수묵담채 분재).
// 결과 이미지가 준비되기 전 로딩/플레이스홀더와 랜딩 히어로에 쓰인다.

export function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        opacity: 0.045,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23g)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

export function SealStamp({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" fill="none" stroke="#B81C1C" strokeWidth="2.5" />
      <rect x="5.5" y="5.5" width="29" height="29" fill="none" stroke="#B81C1C" strokeWidth="0.75" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fill="#B81C1C"
        fontSize="13"
        fontFamily="'Noto Serif KR', serif"
        fontWeight="700"
      >
        분재
      </text>
    </svg>
  );
}

export function BonsaiIllustration({
  showAnnotations = true,
  className = "",
  animate = false,
}: {
  showAnnotations?: boolean;
  className?: string;
  animate?: boolean;
}) {
  const ink = "#221810";
  const inkMid = "#3A2A1C";
  const sage = "#7A9E8B";
  const sagePale = "#9AB5A5";
  const fruit = "#C15A3A";
  const annotCol = "#7A6A5A";

  return (
    <svg
      viewBox="0 0 440 520"
      className={`${className} ${animate ? "ink-draw" : ""}`}
      aria-label="수묵담채 스타일의 분재 그림"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="inkwash" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.026 0.031" numOctaves="3" seed="9" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feGaussianBlur in="disp" stdDeviation="0.7" />
        </filter>
        <filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055 0.08" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id="lgLight" cx="80%" cy="10%" r="58%">
          <stop offset="0%" stopColor="#A8C4B2" stopOpacity="0.24" />
          <stop offset="60%" stopColor="#BCD0C5" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#A8C4B2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lgCanopy" cx="52%" cy="38%" r="52%">
          <stop offset="0%" stopColor={sage} stopOpacity="0.10" />
          <stop offset="100%" stopColor={sage} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 분위기 */}
      <ellipse cx="360" cy="75" rx="175" ry="155" fill="url(#lgLight)" />
      <ellipse cx="210" cy="185" rx="190" ry="165" fill="url(#lgCanopy)" />

      {/* 잎 색 워시 */}
      <path d="M 48 228 C 30 206 32 176 52 158 C 72 140 106 136 132 150 C 158 164 164 192 156 216 C 148 240 124 254 96 254 C 68 254 66 250 48 228 Z" fill={sage} opacity="0.13" filter="url(#inkwash)" />
      <path d="M 34 142 C 22 116 30 86 54 70 C 78 54 112 58 134 78 C 156 98 158 130 144 152 C 130 174 102 180 76 168 C 50 156 46 168 34 142 Z" fill={sage} opacity="0.15" filter="url(#inkwash)" />
      <path d="M 304 194 C 290 168 296 138 318 124 C 342 110 374 118 388 142 C 402 166 392 198 370 210 C 348 222 318 220 304 194 Z" fill={sage} opacity="0.13" filter="url(#inkwash)" />
      <path d="M 298 116 C 284 90 294 62 318 50 C 342 38 370 48 380 72 C 390 96 378 126 356 136 C 334 146 312 142 298 116 Z" fill={sagePale} opacity="0.12" filter="url(#inkwash)" />
      <path d="M 182 106 C 172 82 180 56 202 45 C 224 34 250 42 260 64 C 270 86 260 114 242 124 C 224 134 192 130 182 106 Z" fill={sage} opacity="0.16" filter="url(#inkwash)" />
      <path d="M 256 174 C 246 152 256 128 278 120 C 302 112 326 124 330 148 C 334 172 318 192 296 196 C 274 200 266 196 256 174 Z" fill={sagePale} opacity="0.10" filter="url(#inkwash)" />

      {/* 잎 먹선 */}
      <path d="M 54 222 C 38 202 40 172 60 155 C 80 138 112 134 136 148 C 160 162 164 190 156 214 C 148 238 125 252 98 252 C 72 252 70 242 54 222 Z" fill="none" stroke={ink} strokeWidth="1.3" opacity="0.48" filter="url(#inkwash)" />
      <path d="M 40 138 C 28 112 36 84 60 70 C 84 56 116 60 136 80 C 156 100 158 130 144 152 C 130 173 104 178 78 166 C 52 154 52 164 40 138 Z" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.44" filter="url(#inkwash)" />
      <path d="M 310 190 C 296 166 302 136 324 122 C 348 108 378 117 390 142 C 402 167 390 198 368 210 C 346 222 324 214 310 190 Z" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.44" filter="url(#inkwash)" />
      <path d="M 303 112 C 290 87 300 60 325 48 C 350 36 376 47 384 72 C 392 97 380 128 357 138 C 334 148 316 137 303 112 Z" fill="none" stroke={ink} strokeWidth="1.1" opacity="0.40" filter="url(#inkwash)" />
      <path d="M 186 102 C 175 78 184 53 206 43 C 228 33 254 42 263 66 C 272 90 261 118 242 128 C 223 138 196 126 186 102 Z" fill="none" stroke={ink} strokeWidth="1.1" opacity="0.42" filter="url(#inkwash)" />
      <path d="M 260 171 C 250 149 260 125 282 118 C 306 111 328 124 332 148 C 336 172 320 192 298 196 C 276 200 270 193 260 171 Z" fill="none" stroke={ink} strokeWidth="1.0" opacity="0.36" filter="url(#inkwash)" />

      {/* 가지 */}
      <path d="M 211 260 C 186 245 158 233 128 222 C 106 214 82 208 58 206" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" opacity="0.82" filter="url(#brush)" />
      <path d="M 105 218 C 88 210 72 204 56 202" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" opacity="0.64" filter="url(#brush)" />
      <path d="M 213 234 C 240 216 268 198 298 182 C 322 168 346 156 368 146" fill="none" stroke={ink} strokeWidth="5.2" strokeLinecap="round" opacity="0.80" filter="url(#brush)" />
      <path d="M 332 162 C 348 150 362 140 374 130" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" opacity="0.60" filter="url(#brush)" />
      <path d="M 213 202 C 188 185 158 168 128 153 C 104 140 80 130 56 124" fill="none" stroke={ink} strokeWidth="3.8" strokeLinecap="round" opacity="0.78" filter="url(#brush)" />
      <path d="M 214 192 C 242 172 272 154 304 138 C 328 124 352 112 372 102" fill="none" stroke={ink} strokeWidth="3.4" strokeLinecap="round" opacity="0.76" filter="url(#brush)" />
      <path d="M 215 168 C 216 150 218 130 220 108 C 221 90 222 76 224 62" fill="none" stroke={ink} strokeWidth="3.0" strokeLinecap="round" opacity="0.74" filter="url(#brush)" />

      {/* 줄기 */}
      <path d="M 204 438 C 206 392 209 348 212 304 C 215 262 213 232 213 198 C 213 172 213 158 214 142" fill="none" stroke={ink} strokeWidth="15" strokeLinecap="round" opacity="0.90" filter="url(#brush)" />
      <path d="M 209 438 C 211 392 213 348 215 304 C 217 262 216 232 216 198 C 216 172 217 158 218 142" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" opacity="0.65" filter="url(#brush)" />
      <path d="M 206 395 C 208 375 210 355 211 334" fill="none" stroke={inkMid} strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />

      {/* 뿌리 */}
      <path d="M 206 438 C 190 447 174 456 155 462" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" opacity="0.65" />
      <path d="M 202 440 C 176 450 158 462 138 470" fill="none" stroke={ink} strokeWidth="1.0" strokeLinecap="round" opacity="0.36" />
      <path d="M 216 438 C 232 447 248 456 268 462" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" opacity="0.65" />
      <path d="M 220 440 C 242 450 264 462 284 470" fill="none" stroke={ink} strokeWidth="1.0" strokeLinecap="round" opacity="0.36" />

      {/* 화분 */}
      <ellipse cx="212" cy="438" rx="68" ry="5" fill={inkMid} opacity="0.18" />
      <path d="M 150 438 L 274 438 L 263 476 L 161 476 Z" fill="#C8B59A" opacity="0.55" />
      <path d="M 150 438 L 274 438 L 263 476 L 161 476 Z" fill="none" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" opacity="0.72" />
      <line x1="145" y1="438" x2="279" y2="438" stroke={ink} strokeWidth="2.2" strokeLinecap="round" opacity="0.76" />

      {/* 열매 */}
      <circle cx="62" cy="204" r="4.8" fill={fruit} opacity="0.70" />
      <circle cx="108" cy="152" r="4.2" fill={fruit} opacity="0.65" />
      <circle cx="226" cy="54" r="4.6" fill={fruit} opacity="0.68" />
      <circle cx="370" cy="142" r="4.2" fill={fruit} opacity="0.65" />
      <circle cx="300" cy="182" r="3.5" fill={fruit} opacity="0.60" />

      {/* 어노테이션 */}
      {showAnnotations && (
        <g fontFamily="'Josefin Sans', 'Noto Sans KR', sans-serif" fontSize="10" fill={annotCol} opacity="0.82">
          <circle cx="212" cy="330" r="2.2" fill={annotCol} />
          <line x1="212" y1="330" x2="148" y2="355" stroke={annotCol} strokeWidth="0.75" strokeDasharray="3 3" />
          <text x="143" y="359" textAnchor="end" letterSpacing="0.5">줄기</text>
          <circle cx="326" cy="172" r="2.2" fill={annotCol} />
          <line x1="326" y1="172" x2="392" y2="184" stroke={annotCol} strokeWidth="0.75" strokeDasharray="3 3" />
          <text x="397" y="188" textAnchor="start" letterSpacing="0.5">가지</text>
          <circle cx="198" cy="452" r="2.2" fill={annotCol} />
          <line x1="198" y1="452" x2="130" y2="468" stroke={annotCol} strokeWidth="0.75" strokeDasharray="3 3" />
          <text x="124" y="472" textAnchor="end" letterSpacing="0.5">뿌리</text>
          <circle cx="370" cy="142" r="2.2" fill={annotCol} />
          <line x1="370" y1="142" x2="404" y2="122" stroke={annotCol} strokeWidth="0.75" strokeDasharray="3 3" />
          <text x="409" y="120" textAnchor="start" letterSpacing="0.5">열매</text>
          <text x="366" y="42" textAnchor="end" fill="#9A8540" opacity="0.72" letterSpacing="0.5">빛</text>
          <line x1="370" y1="44" x2="388" y2="52" stroke="#C4A855" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.55" />
        </g>
      )}
    </svg>
  );
}
