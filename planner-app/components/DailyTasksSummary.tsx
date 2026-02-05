import React from "react";

interface Task {
  name: string;
  loggedMinutes?: number;
}

interface DailyTasksSummaryProps {
  tasks: Task[];
}

export default function DailyTasksSummary({ tasks }: DailyTasksSummaryProps) {
  const total = (tasks || []).reduce((s, t) => s + (t.loggedMinutes || 0), 0);

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Total Time Logged</p>
        <p className="text-4xl font-bold text-gray-900">
          {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
        </p>
        <p className="text-sm text-gray-500 mt-1">({total} minutes)</p>
      </div>
    </div>
  );
}
