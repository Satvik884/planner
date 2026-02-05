import React from "react";

interface DateSelectorProps {
  date: string;
  onDateChange: (date: string) => void;
  formatDate: (dateStr: string) => string;
}

export default function DateSelector({
  date,
  onDateChange,
  formatDate,
}: DateSelectorProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Planner</h1>

      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <p className="text-sm text-gray-500 mb-1">Selected Date</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(date)}</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
    </div>
  );
}
