"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Link2, RefreshCw } from "lucide-react";
import { FilmGrain, SealStamp, BonsaiIllustration } from "../../components/BonsaiArt";

type JobStatus = "pending" | "processing" | "done" | "error";
type Job = {
  id: string;
  status: JobStatus;
  imageUrl: string | null;
  error: string | null;
  style: string;
  profile: { displayName?: string; role?: string; motto?: string } | null;
};

const LEGEND = [
  { key: "줄기", val: "핵심 정체성" },
  { key: "가지", val: "옆 역량" },
  { key: "뿌리", val: "깊이" },
  { key: "열매", val: "성과" },
];

export default function ResultClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [copied, setCopied] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 폴링 — done/error면 멈춤
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/job/${jobId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) throw new Error("작업을 찾을 수 없어요.");
          throw new Error("상태 조회 실패");
        }
        const data: Job = await res.json();
        if (!alive) return;
        setJob(data);
        if (data.status !== "done" && data.status !== "error") {
          timer = setTimeout(poll, 3000); // 3초 간격 폴링
        }
      } catch (e) {
        if (!alive) return;
        setFetchError((e as Error).message);
        timer = setTimeout(poll, 5000);
      }
    }
    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [jobId]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  async function handleDownload() {
    if (!job?.imageUrl) return;
    try {
      const res = await fetch(job.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${job.profile?.displayName || "bonsai"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(job.imageUrl, "_blank");
    }
  }

  const status = job?.status ?? "pending";
  const displayName = job?.profile?.displayName || "당신";
  const motto = job?.profile?.motto;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const socials = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${displayName}의 분재`)}&url=${encodeURIComponent(shareUrl)}` },
    { label: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { label: "@", href: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${displayName}의 분재 ${shareUrl}`)}` },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <FilmGrain />

      {/* Header */}
      <header className="px-8 pt-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-60 transition-opacity">
          <SealStamp size={26} />
          <span className="text-foreground font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            분재
          </span>
        </Link>
        <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
          A Bonjae of — <span className="text-foreground">{displayName}</span>
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-8 pt-8 pb-16 flex flex-col items-center gap-7">
        {/* Identity */}
        <div className="text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {job?.style === "ink" ? "수묵" : "수묵담채"}
          </p>
          <h1 className="text-3xl lg:text-[2.2rem] text-foreground leading-tight" style={{ fontFamily: "var(--font-serif)", fontWeight: 700 }}>
            {displayName}의 분재
          </h1>
          {motto && (
            <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              &ldquo;{motto}&rdquo;
            </p>
          )}
        </div>

        {/* Gallery frame */}
        <div className="relative w-full">
          <div className="absolute -top-px left-0 right-0 flex justify-center gap-28 pointer-events-none">
            <div className="w-px h-5" style={{ background: "var(--foreground)", opacity: 0.18 }} />
            <div className="w-px h-5" style={{ background: "var(--foreground)", opacity: 0.18 }} />
          </div>

          <div
            className="w-full bg-card"
            style={{
              padding: "44px 52px 36px",
              border: "1px solid rgba(28,22,16,0.14)",
              boxShadow: "0 2px 24px rgba(28,22,16,0.07), 0 8px 48px rgba(28,22,16,0.05), inset 0 0 0 6px rgba(28,22,16,0.025)",
            }}
          >
            {/* 상태별 본문 */}
            {status === "done" && job?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.imageUrl} alt={`${displayName}의 분재`} className="w-full h-auto" />
            ) : status === "error" ? (
              <div className="py-16 flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-accent" style={{ fontFamily: "var(--font-sans-kr)" }}>
                  분재를 그리는 데 실패했어요.
                </p>
                <p className="text-xs text-muted-foreground max-w-sm" style={{ fontFamily: "var(--font-sans-kr)" }}>
                  {job?.error || "잠시 후 다시 시도해주세요."}
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-2 px-6 py-2.5 text-xs tracking-[0.12em] uppercase text-primary-foreground"
                  style={{ fontFamily: "var(--font-display)", backgroundColor: "#7A9E8B", border: "1.5px solid rgba(28,22,16,0.10)" }}
                >
                  다시 만들기
                </button>
              </div>
            ) : (
              // 로딩 — 분재가 먹으로 그려지는 애니메이션
              <div className="py-6 flex flex-col items-center gap-5">
                <div className="w-full max-w-[320px] ink-breathe">
                  <BonsaiIllustration showAnnotations={false} className="w-full h-auto" animate />
                </div>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-serif)" }}>
                  {status === "processing" ? "분재를 그리는 중…" : "준비하는 중…"}
                </p>
                <p className="text-[11px] text-muted-foreground opacity-60" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
                  약 1–2분 걸려요. 이 페이지를 떠나도 결과는 저장됩니다.
                </p>
              </div>
            )}

            {/* Frame footer brand */}
            <div className="mt-6 pt-4 flex justify-between items-center" style={{ borderTop: "1px solid rgba(28,22,16,0.10)" }}>
              <div className="flex items-center gap-2">
                <SealStamp size={18} />
                <span className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  Bonjae · 분재
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em", opacity: 0.6 }}>
                {job?.style === "ink" ? "수묵" : "수묵담채"}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {LEGEND.map((item, i) => (
            <span key={item.key} className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-foreground" style={{ fontFamily: "var(--font-sans-kr)" }}>
                {item.key}
              </span>
              <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans-kr)" }}>
                ={item.val}
              </span>
              {i < LEGEND.length - 1 && <span className="text-muted-foreground opacity-30 ml-2 text-xs">·</span>}
            </span>
          ))}
        </div>

        {/* Action bar — done일 때만 공유/저장 활성 */}
        {status === "done" && (
          <div className="flex flex-wrap gap-2.5 justify-center items-center pt-1">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 text-xs tracking-[0.12em] uppercase text-primary-foreground hover:opacity-88 transition-opacity"
              style={{ fontFamily: "var(--font-display)", backgroundColor: "#7A9E8B", border: "1.5px solid rgba(28,22,16,0.10)" }}
            >
              <Download size={13} strokeWidth={1.5} />
              이미지 저장
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-3 text-xs tracking-[0.10em] uppercase text-foreground transition-colors hover:bg-muted"
              style={{ fontFamily: "var(--font-display)", border: "1px solid rgba(28,22,16,0.18)" }}
            >
              <Link2 size={13} strokeWidth={1.5} />
              {copied ? "복사됨!" : "링크 복사"}
            </button>
            <div className="flex items-center gap-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: "var(--font-display)", border: "1px solid rgba(28,22,16,0.16)", letterSpacing: "0.04em" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Redo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.09em" }}
        >
          <RefreshCw size={12} strokeWidth={1.5} />
          다시 만들기
        </button>

        {/* Footer brand */}
        <footer className="mt-2 pt-5 w-full flex items-center justify-center gap-3" style={{ borderTop: "1px solid rgba(28,22,16,0.10)" }}>
          <SealStamp size={18} />
          <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
            분재로 만들어졌습니다 · Bonjae
          </p>
          <SealStamp size={18} />
        </footer>
      </main>
    </div>
  );
}
