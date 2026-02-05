import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function GET() {
  await connectDB();
  const goal = await Goal.findOne();
  return NextResponse.json(goal);
}

export async function POST(req: Request) {
  await connectDB();
  const { dailyGoalMinutes } = await req.json();

  let goal = await Goal.findOne();

  if (goal) {
    goal.dailyGoalMinutes = dailyGoalMinutes;
    await goal.save();
  } else {
    goal = await Goal.create({ dailyGoalMinutes });
  }

  return NextResponse.json(goal);
}
