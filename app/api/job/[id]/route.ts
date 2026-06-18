import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 폴링이므로 캐시 금지

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let job;
  try {
    job = await getJob(id);
  } catch (err) {
    console.error("[job] 조회 실패", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ error: "작업을 찾을 수 없습니다." }, { status: 404 });
  }

  const profile = job.profile_json || null;
  return NextResponse.json({
    id: job.id,
    status: job.status, // pending | processing | done | error
    imageUrl: job.image_url || null,
    error: job.error || null,
    style: job.style,
    // 결과 페이지 표시용 요약 (추출 단계 끝나면 이미지 전이라도 채워짐)
    profile: profile
      ? {
          displayName: profile.displayName,
          role: profile.identity?.role,
          motto: profile.character?.motto,
        }
      : null,
  });
}
