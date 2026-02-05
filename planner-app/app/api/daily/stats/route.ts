import DailyLog from "@/models/DailyLog";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Fetch all daily logs, sorted by date descending
    const logs = await DailyLog.find({}).sort({ date: -1 }).lean();

    return NextResponse.json({
      logs: logs.map((log: any) => ({
        _id: log._id.toString(),
        date: log.date,
        totalLoggedMinutes: log.totalLoggedMinutes || 0,
        goalReached: log.goalReached || false,
        tasks: Array.isArray(log.tasks) ? log.tasks : [],
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/daily/stats:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
