import mongoose, { Schema, models } from "mongoose";

const TimeEntrySchema = new Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  createdAt: { type: Date, default: Date.now },
});

const TaskEntrySchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  name: { type: String, required: true },
  goalMinutes: { type: Number, required: true },
  loggedMinutes: { type: Number, default: 0 },
  timeEntries: [TimeEntrySchema],
});

const DailyLogSchema = new Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    tasks: [TaskEntrySchema],
    totalLoggedMinutes: { type: Number, default: 0 },
    goalReached: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.DailyLog || mongoose.model("DailyLog", DailyLogSchema);
