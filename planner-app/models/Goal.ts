import mongoose, { Schema, models } from "mongoose";

const GoalSchema = new Schema(
  {
    dailyGoalMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.Goal || mongoose.model("Goal", GoalSchema);
