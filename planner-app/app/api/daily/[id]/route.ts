import DailyLog from "@/models/DailyLog";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const taskIndex = parseInt(searchParams.get("taskIndex") || "-1");

    if (!date || taskIndex < 0) {
      return NextResponse.json(
        { error: "date and taskIndex are required" },
        { status: 400 }
      );
    }

    const log = await DailyLog.findOne({ date });
    if (!log) {
      return NextResponse.json(
        { error: "Daily log not found" },
        { status: 404 }
      );
    }

    // Remove task at index
    log.tasks.splice(taskIndex, 1);

    // Recalculate totals
    log.totalLoggedMinutes = log.tasks.reduce(
      (sum: number, t: any) => sum + (t.loggedMinutes || 0),
      0
    );
    log.goalReached = log.tasks.every(
      (t: any) => t.loggedMinutes >= t.goalMinutes
    );

    await log.save();

    return NextResponse.json({
      _id: log._id.toString(),
      date: log.date,
      tasks: log.tasks || [],
      totalLoggedMinutes: log.totalLoggedMinutes || 0,
      goalReached: log.goalReached || false,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
