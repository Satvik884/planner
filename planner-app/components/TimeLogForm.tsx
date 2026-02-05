import React, { useState, useEffect } from "react";
import { Play, Square, Clock, Trash2 } from "lucide-react";

interface TimeEntry {
  startTime: Date | string;
  endTime?: Date | string;
  duration: number;
}

interface TimeLogFormProps {
  taskId: number;
  timeEntries: TimeEntry[];
  onAddEntry: (taskId: number, startTime: Date) => void;
  onEndEntry: (taskId: number, endTime: Date) => void;
  onDeleteEntry: (taskId: number, entryIndex: number) => void;
  onUpdateLoggedMinutes: (taskId: number, totalMinutes: number) => void;
  formatTime?: (date: Date | string) => string;
}

export default function TimeLogForm({
  taskId,
  timeEntries,
  onAddEntry,
  onEndEntry,
  onDeleteEntry,
  onUpdateLoggedMinutes,
  formatTime,
}: TimeLogFormProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Calculate total from time entries
  useEffect(() => {
    const total = timeEntries.reduce((sum, entry) => {
      return sum + entry.duration;
    }, 0);
    onUpdateLoggedMinutes(taskId, total);
  }, [timeEntries, taskId, onUpdateLoggedMinutes]);

  // Start timer
  const handleStart = () => {
    setIsRunning(true);
    onAddEntry(taskId, new Date());
  };

  // Stop timer
  const handleStop = () => {
    setIsRunning(false);
    setCurrentTime(0);
    onEndEntry(taskId, new Date());
  };

  // Timer interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeDisplay = (dateStr: Date | string) => {
    if (formatTime) {
      return formatTime(dateStr);
    }
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Handle manual entry with start and end time
  const handleAddManualEntry = () => {
    if (!startTime || !endTime) {
      alert("Please enter both start and end time");
      return;
    }

    // Parse the time inputs (format: HH:MM)
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMin);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMin);

    // Handle case where end time is next day (e.g., 23:00 to 01:00)
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    // Create the time entry
    onAddEntry(taskId, start);

    // Wait a moment then end it
    setTimeout(() => {
      onEndEntry(taskId, end);
      setStartTime("");
      setEndTime("");
    }, 100);
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
      {/* Timer Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Play size={18} />
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Square size={18} />
            Stop
          </button>
        )}
      </div>

      {/* Current Timer Display */}
      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium flex items-center justify-center gap-2">
            <Clock size={16} />
            Running: {formatDuration(currentTime)}
          </p>
        </div>
      )}

      {/* Manual Entry */}
      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-2">
        <p className="text-xs text-gray-600 font-medium">Add Time Entry Manually</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddManualEntry}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Add
          </button>
        </div>
      </div>

      {/* Time Entries List */}
      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Time Entries</p>
          {timeEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg hover:border-gray-300"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {formatTimeDisplay(entry.startTime)} - {entry.endTime ? formatTimeDisplay(entry.endTime) : "Running"}
                </p>
                <p className="text-xs text-gray-500">
                  Duration: {entry.duration}m
                </p>
              </div>
              <button
                onClick={() => onDeleteEntry(taskId, idx)}
                className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
