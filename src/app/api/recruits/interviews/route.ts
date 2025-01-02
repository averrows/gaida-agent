import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviews, targetRecruits } from "@/db/schema";
import { eq } from "drizzle-orm";

export type GetInterviewsPayload = typeof interviews.$inferSelect & {
  targetRecruitName: string;
};
export async function GET(req: NextRequest) {
  const dbInterviews = await db.select({
    id: interviews.id,
    targetRecruitId: interviews.targetRecruitId,
    meetingLink: interviews.meetingLink,
    targetRecruitName: targetRecruits.name,
  }).from(interviews).innerJoin(targetRecruits, eq(interviews.targetRecruitId, targetRecruits.id));
  return NextResponse.json(dbInterviews);
}
