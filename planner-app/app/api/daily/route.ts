import DailyLog from "@/models/DailyLog";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    let log = await DailyLog.findOne({ date }).populate("tasks.taskId");
    if (!log) {
      log = await DailyLog.create({ date, tasks: [] });
    }

    return NextResponse.json({
      _id: log._id.toString(),
      date: log.date,
      tasks: Array.isArray(log.tasks) ? log.tasks : [],
      totalLoggedMinutes: log.totalLoggedMinutes || 0,
      goalReached: log.goalReached || false,
    });
  } catch (error) {
    console.error("Error in GET /api/daily:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { date, tasks } = await req.json();

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Process tasks to preserve manually entered loggedMinutes
    // Only calculate from timeEntries if they actually exist and have data
    const processedTasks = (tasks || []).map((t: any) => {
      // Only calculate from timeEntries if array exists and has items
      if (t.timeEntries && Array.isArray(t.timeEntries) && t.timeEntries.length > 0) {
        const timeEntriesMinutes = Math.round(
          t.timeEntries.reduce((sum: number, entry: any) => {
            return sum + (entry.duration || 0);
          }, 0) / 60
        );
        return {
          ...t,
          loggedMinutes: timeEntriesMinutes,
        };
      }
      
      // Otherwise preserve the manually entered loggedMinutes
      return {
        ...t,
        loggedMinutes: t.loggedMinutes || 0,
      };
    });

    const totalLoggedMinutes = processedTasks.reduce(
      (sum: number, t: any) => sum + (t.loggedMinutes || 0),
      0
    );

    const goalReached = processedTasks.every(
      (t: any) => (t.loggedMinutes || 0) >= (t.goalMinutes || 0)
    );

    const log = await DailyLog.findOneAndUpdate(
      { date },
      { tasks: processedTasks, totalLoggedMinutes, goalReached },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      _id: log._id.toString(),
      date: log.date,
      tasks: Array.isArray(log.tasks) ? log.tasks : [],
      totalLoggedMinutes: log.totalLoggedMinutes || 0,
      goalReached: log.goalReached || false,
    });
  } catch (error) {
    console.error("Error in POST /api/daily:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
