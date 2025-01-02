import { NextResponse } from "next/server";
import { db } from "@/db";
import { targetRecruits } from "@/db/schema";

export type GetTargetRecruitPayload = typeof targetRecruits.$inferSelect;
export async function GET(request: Request) {
  const recruits: GetTargetRecruitPayload[] = await db.select().from(targetRecruits);
  return NextResponse.json(recruits);
}


export type CreateTargetRecruitPayload = typeof targetRecruits.$inferInsert;
export async function POST(request: Request) {
  const body: CreateTargetRecruitPayload = await request.json();
  const recruit = await db.insert(targetRecruits).values(body);
  return NextResponse.json(recruit);
}