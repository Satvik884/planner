import DailyLog from "@/models/DailyLog";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { date, taskIndex, action, startTime, endTime } = await req.json();

    if (!date || taskIndex === undefined) {
      return NextResponse.json(
        { error: "date and taskIndex are required" },
        { status: 400 }
      );
    }

    let log = await DailyLog.findOne({ date });
    if (!log) {
      log = await DailyLog.create({ date, tasks: [] });
    }

    const task = log.tasks[taskIndex];
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (!Array.isArray(task.timeEntries)) {
      task.timeEntries = [];
    }

    if (action === "start") {
      // Start a new time entry
      task.timeEntries.push({
        startTime: new Date(startTime),
        duration: 0,
      });
    } else if (action === "end") {
      // End the last running time entry
      if (task.timeEntries.length > 0) {
        const lastEntry = task.timeEntries[task.timeEntries.length - 1];
        if (!lastEntry.endTime) {
          const start = new Date(lastEntry.startTime);
          const end = new Date(endTime);
          const durationSeconds = Math.floor(
            (end.getTime() - start.getTime()) / 1000
          );
          lastEntry.endTime = end;
          lastEntry.duration = Math.round(durationSeconds / 60); // Convert to minutes
        }
      }
    } else if (action === "delete") {
      // Delete a specific time entry
      const entryIndex = parseInt(startTime as any);
      if (entryIndex >= 0 && entryIndex < task.timeEntries.length) {
        task.timeEntries.splice(entryIndex, 1);
      }
    }

    // Update loggedMinutes based on all time entries
    const totalMinutes = task.timeEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.duration || 0);
    }, 0);
    task.loggedMinutes = totalMinutes;

    // Update total and goalReached for the day
    const totalLoggedMinutes = log.tasks.reduce(
      (sum: number, t: any) => sum + (t.loggedMinutes || 0),
      0
    );
    log.totalLoggedMinutes = totalLoggedMinutes;
    log.goalReached = log.tasks.every(
      (t: any) => (t.loggedMinutes || 0) >= (t.goalMinutes || 0)
    );

    await log.save();

    return NextResponse.json({
      success: true,
      tasks: log.tasks,
      totalLoggedMinutes: log.totalLoggedMinutes,
    });
  } catch (error) {
    console.error("Error in POST /api/daily/time-entries:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
