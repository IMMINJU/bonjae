"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { FilmGrain, SealStamp, BonsaiIllustration } from "./components/BonsaiArt";
import { looksLikeUrlOnly, URL_ONLY_MESSAGE } from "@/lib/input-checks.mjs";

const EXAMPLES: Record<string, string> = {
  developer:
    "5년차 프론트엔드 개발자입니다. React와 TypeScript를 주로 쓰고, 스타트업에서 0→1 제품을 세 번 만들었습니다. 최근엔 디자인 시스템 구축에 빠져서 독학으로 Figma를 배웠습니다. 오픈소스 기여 경험 있고, 기술 블로그를 꾸준히 운영합니다.",
  designer:
    "UX/UI 디자이너로 7년 일했습니다. 앱 리디자인으로 전환율 40% 개선한 프로젝트가 가장 기억에 남습니다. 요즘은 모션 디자인과 프로토타이핑에 빠져 있고, 사용자 인터뷰를 직접 진행해 제품에 반영하는 과정을 즐깁니다.",
  nurse:
    "응급실 간호사 8년차입니다. 중환자 케어와 빠른 판단이 필요한 상황에 강합니다. 신규 간호사 교육을 맡으며 리더십을 쌓았고, 심폐소생술 강사 자격도 있습니다. 환자와 보호자 소통을 잘한다는 이야기를 자주 듣습니다.",
};

export default function LandingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setError("PDF는 현재 텍스트 추출이 제한적이에요. 내용을 복사해 붙여넣어 주세요.");
      return;
    }
    try {
      const t = await file.text();
      setText(t.slice(0, 6000));
    } catch {
      setError("파일을 읽지 못했어요. 텍스트를 직접 붙여넣어 주세요.");
    }
  }

  async function submit() {
    if (!text.trim() || submitting) return;
    // 링크만 넣은 경우: 모델이 링크를 못 읽으니 미리 안내(서버에서도 동일 검증).
    if (looksLikeUrlOnly(text)) {
      setError(URL_ONLY_MESSAGE);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), style: "tint" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "생성을 시작하지 못했어요.");
      router.push(`/result/${data.jobId}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <FilmGrain />

      {/* Header */}
      <header className="px-8 pt-8 flex items-center gap-3">
        <SealStamp size={32} />
        <div className="flex items-center gap-3">
          <span className="text-foreground text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            분재
          </span>
          <span
            className="text-[10px] tracking-[0.26em] text-muted-foreground uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Career · Bonjae
          </span>
        </div>
      </header>

      {/* Two-column */}
      <main className="max-w-7xl mx-auto px-8 pt-10 pb-16 grid grid-cols-1 lg:grid-cols-[52%_48%] gap-10 lg:gap-6 items-center min-h-[calc(100vh-80px)]">
        {/* LEFT: copy + input */}
        <div className="flex flex-col gap-5 max-w-lg">
          <p
            className="text-[10px] tracking-[0.30em] uppercase text-muted-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            나만의 커리어 초상
          </p>
          <h1
            className="text-[2.6rem] leading-[1.25] text-foreground"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 700, wordBreak: "keep-all", letterSpacing: "-0.01em" }}
          >
            당신의 커리어를<br />분재로 그립니다
          </h1>
          <p
            className="text-[0.94rem] text-muted-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-sans-kr)", wordBreak: "keep-all" }}
          >
            내 이야기를 붙여넣으면, 가지·뿌리·열매로<br className="hidden lg:block" />자란 나만의 분재가 됩니다.
          </p>

          {/* Textarea */}
          <div className="relative mt-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="내 경력, 한 일, 자신 있는 분야, 성과를 자유롭게 적어주세요. (이력서를 붙여넣어도 좋아요)"
              rows={9}
              maxLength={6000}
              className="w-full resize-none text-[0.9rem] text-foreground bg-transparent outline-none leading-loose block"
              style={{
                fontFamily: "var(--font-sans-kr)",
                borderTop: "1.5px solid rgba(28,22,16,0.22)",
                borderBottom: "1.5px solid rgba(28,22,16,0.22)",
                padding: "18px 0",
                wordBreak: "keep-all",
                caretColor: "#C15A3A",
                borderRadius: 0,
              }}
            />
            <div
              className="absolute bottom-4 right-0 text-[11px] opacity-35"
              style={{ fontFamily: "var(--font-display)", color: "#6E5E50" }}
            >
              {text.length > 0 ? `${text.length}자` : ""}
            </div>
          </div>

          {/* File upload */}
          <label
            className={`flex items-center gap-2 text-xs cursor-pointer transition-opacity w-fit ${
              isDragging ? "opacity-100" : "opacity-55 hover:opacity-90"
            }`}
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.07em", color: "#6E5E50" }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <Upload size={12} strokeWidth={1.5} />
            또는 파일 업로드 (txt)
            <input
              type="file"
              accept=".txt,.md,.pdf"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {/* CTA */}
          <button
            onClick={submit}
            disabled={!text.trim() || submitting}
            className="mt-1 px-8 py-3.5 text-xs tracking-[0.18em] uppercase text-primary-foreground transition-opacity w-fit flex items-center gap-2"
            style={{
              fontFamily: "var(--font-display)",
              backgroundColor: !text.trim() ? "#A8C0B4" : "#7A9E8B",
              border: "1.5px solid rgba(28,22,16,0.14)",
              cursor: !text.trim() || submitting ? "not-allowed" : "pointer",
              opacity: !text.trim() ? 0.55 : 1,
            }}
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? "시작하는 중…" : "분재 만들기"}
          </button>

          {error && (
            <p className="text-xs text-accent" style={{ fontFamily: "var(--font-sans-kr)" }}>
              {error}
            </p>
          )}

          {/* Example chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "개발자 예시", key: "developer" },
              { label: "디자이너 예시", key: "designer" },
              { label: "간호사 예시", key: "nurse" },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => setText(EXAMPLES[chip.key])}
                className="px-3.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "var(--font-display)", border: "1px solid rgba(28,22,16,0.18)", letterSpacing: "0.06em" }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <p
            className="text-[11px] opacity-55"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.10em", color: "#6E5E50" }}
          >
            텍스트만 있으면 됩니다 · 약 1–2분 소요 · 결과는 이미지로
          </p>
          <p
            className="text-[11px] opacity-45 leading-relaxed"
            style={{ fontFamily: "var(--font-sans-kr)", color: "#6E5E50", wordBreak: "keep-all" }}
          >
            입력한 원문은 그림이 완성되면 삭제돼요. 다만 완성된 결과(이미지·요약)는 링크를 아는 사람이면 볼 수 있으니, 민감한 개인정보는 넣지 말아주세요.
          </p>
        </div>

        {/* RIGHT: hero illustration */}
        <div className="flex items-center justify-center lg:justify-end overflow-visible">
          <div className="w-full max-w-[400px] lg:max-w-none lg:w-[88%] overflow-visible">
            <BonsaiIllustration showAnnotations={true} className="w-full h-auto" />
          </div>
        </div>
      </main>
    </div>
  );
}
