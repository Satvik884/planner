import mongoose, { Schema, models } from "mongoose";

const TaskSchema = new Schema({
  name: String,
  color: String,
  defaultGoalMinutes: Number,
});


export default models.Task || mongoose.model("Task", TaskSchema);
