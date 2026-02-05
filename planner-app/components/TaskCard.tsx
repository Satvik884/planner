import React from "react";
import { Trash2, Check } from "lucide-react";
import TimeLogForm from "./TimeLogForm";

interface TimeEntry {
  startTime: Date | string;
  endTime?: Date | string;
  duration: number;
}

interface TaskCardProps {
  index: number;
  task: {
    name: string;
    goalMinutes: number;
    loggedMinutes: number;
    timeEntries?: TimeEntry[];
  };
  onUpdateTask: (index: number, field: string, value: any) => void;
  onRemoveTask: (index: number) => void;
  onAddTimeEntry: (taskId: number, startTime: Date) => void;
  onEndTimeEntry: (taskId: number, endTime: Date) => void;
  onDeleteTimeEntry: (taskId: number, entryIndex: number) => void;
  onUpdateLoggedMinutes: (taskId: number, totalMinutes: number) => void;
  formatTime?: (date: Date | string) => string;
}

export default function TaskCard({
  index,
  task,
  onUpdateTask,
  onRemoveTask,
  onAddTimeEntry,
  onEndTimeEntry,
  onDeleteTimeEntry,
  onUpdateLoggedMinutes,
  formatTime,
}: TaskCardProps) {
  const progress = Math.min(100, (task.loggedMinutes / task.goalMinutes) * 100);
  const goalReached = task.loggedMinutes >= task.goalMinutes;

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{task.name}</h3>
          <p className="text-sm text-gray-500">
            Goal: {task.goalMinutes} min • Logged: {task.loggedMinutes} min
          </p>
        </div>
        {goalReached && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Check size={16} />
            Done
          </div>
        )}
        <button
          onClick={() => onRemoveTask(index)}
          className="ml-3 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              goalReached ? "bg-green-500" : "bg-gray-900"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Goal Time and Logged Time */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 font-medium mb-2">
            Goal Time (min)
          </label>
          <input
            type="number"
            min="1"
            value={task.goalMinutes}
            onChange={(e) => onUpdateTask(index, "goalMinutes", +e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 font-medium"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 font-medium mb-2">
            Logged Time (min)
          </label>
          <div className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-50 text-gray-900 font-medium">
            {task.loggedMinutes}
          </div>
        </div>
      </div>

      {/* Time Log Form */}
      <TimeLogForm
        taskId={index}
        timeEntries={task.timeEntries || []}
        onAddEntry={onAddTimeEntry}
        onEndEntry={onEndTimeEntry}
        onDeleteEntry={onDeleteTimeEntry}
        onUpdateLoggedMinutes={onUpdateLoggedMinutes}
        formatTime={formatTime}
      />
    </div>
  );
}
