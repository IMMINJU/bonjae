import type { Metadata } from "next";
import ResultClient from "./ResultClient";
import { getJob } from "@/lib/db.mjs";

// 공유 카드(OG) — 완료된 분재면 이미지·이름을 카드에 박는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await getJob(id);
    const name = job?.profile_json?.displayName || "누군가";
    const title = `${name}의 분재`;
    const description = job?.profile_json?.character?.motto || "커리어를 수묵담채 분재로.";
    return {
      title: `${title} — 분재`,
      description,
      openGraph: {
        title,
        description,
        images: job?.image_url ? [{ url: job.image_url }] : undefined,
      },
      twitter: {
        card: job?.image_url ? "summary_large_image" : "summary",
        title,
        description,
        images: job?.image_url ? [job.image_url] : undefined,
      },
    };
  } catch {
    return { title: "분재" };
  }
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResultClient jobId={id} />;
}
