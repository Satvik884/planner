"use client";

import { useEffect, useState, useCallback } from "react";
import DateSelector from "@/components/DateSelector";
import GlobalTasksSection from "@/components/GlobalTasksSection";
import DailyTasksSummary from "@/components/DailyTasksSummary";
import TaskCard from "@/components/TaskCard";
import SaveButton from "@/components/SaveButton";
import DailyStats from "@/components/DailyStats";

interface TimeEntry {
  startTime: Date | string;
  endTime?: Date | string;
  duration: number;
}

interface Task {
  _id: string;
  name: string;
  defaultGoalMinutes: number;
}

interface DailyTask {
  taskId: string;
  name: string;
  goalMinutes: number;
  loggedMinutes: number;
  timeEntries: TimeEntry[];
}

export default function Planner() {
  const getTodayDate = () => {
    const now = new Date();
    // Get local date in YYYY-MM-DD format
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState<string>("");

  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  
  const [showGlobalTasks, setShowGlobalTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("30");
  const [selectedTaskToAdd, setSelectedTaskToAdd] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<"today" | "stats" | "tasks">("today");

  // Set date to today on mount
  useEffect(() => {
    setDate(getTodayDate());
  }, []);

  // Fetch daily tasks and global tasks
  useEffect(() => {
    if (!date) return; // Don't fetch if date is empty
    fetchDailyTasks();
    fetchGlobalTasks();
  }, [date]);

  const fetchDailyTasks = async () => {
    try {
      const response = await fetch(`/api/daily?date=${date}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTasks(
        (data.tasks || []).map((t: any) => ({
          ...t,
          timeEntries: Array.isArray(t.timeEntries) ? t.timeEntries : [],
        }))
      );
    } catch (err) {
      console.error("Error fetching daily tasks:", err);
      setTasks([]);
    }
  };

  const fetchGlobalTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setGlobalTasks(data);
    } catch (err) {
      console.error("Error fetching global tasks:", err);
      setGlobalTasks([]);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Format time in IST with 12-hour format
  const formatTimeIST = (dateStr: Date | string) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Add new global task
  const handleAddGlobalTask = async () => {
    if (!newTaskName.trim()) return;
    
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTaskName,
          defaultGoalMinutes: parseInt(newTaskTime),
          color: "#000000",
        }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newTask = await res.json();
      setGlobalTasks([...globalTasks, newTask]);
      setNewTaskName("");
      setNewTaskTime("30");
      setShowAddTask(false);
    } catch (err) {
      console.error("Error adding global task:", err);
      alert("Failed to add task");
    }
  };

  // Add task to today
  const handleAddTaskToDay = async (task: Task) => {
    if (tasks.some((t) => t.taskId === task._id)) return;
    
    const newTask: DailyTask = {
      taskId: task._id,
      name: task.name,
      goalMinutes: task.defaultGoalMinutes,
      loggedMinutes: 0,
      timeEntries: [],
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setSelectedTaskToAdd("");
    
    // Immediately save to database
    try {
      await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, tasks: updatedTasks }),
      });
    } catch (err) {
      console.error("Error saving task to database:", err);
    }
  };

  // Update task field
  const handleUpdateTask = (index: number, field: string, value: any) => {
    const copy = [...tasks];
    copy[index] = {
      ...copy[index],
      [field]: field === "goalMinutes" || field === "loggedMinutes" ? Math.max(0, value) : value,
    };
    setTasks(copy);
  };

  // Remove task from today
  const handleRemoveTask = async (index: number) => {
    try {
      await fetch(`/api/daily/delete?date=${date}&taskIndex=${index}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((_, idx) => idx !== index));
    } catch (err) {
      console.error("Error deleting task:", err);
      setTasks(tasks.filter((_, idx) => idx !== index));
    }
  };

  // Add time entry (start timer)
  const handleAddTimeEntry = async (taskIndex: number, startTime: Date) => {
    try {
      const response = await fetch("/api/daily/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          taskIndex,
          action: "start",
          startTime: startTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // Update local state with new tasks
      setTasks(
        data.tasks.map((t: any) => ({
          ...t,
          timeEntries: Array.isArray(t.timeEntries) ? t.timeEntries : [],
        }))
      );
    } catch (err) {
      console.error("Error adding time entry:", err);
      alert("Failed to start timer");
    }
  };

  // End time entry (stop timer)
  const handleEndTimeEntry = async (taskIndex: number, endTime: Date) => {
    try {
      const response = await fetch("/api/daily/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          taskIndex,
          action: "end",
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      setTasks(
        data.tasks.map((t: any) => ({
          ...t,
          timeEntries: Array.isArray(t.timeEntries) ? t.timeEntries : [],
        }))
      );
    } catch (err) {
      console.error("Error ending time entry:", err);
      alert("Failed to stop timer");
    }
  };

  // Delete time entry
  const handleDeleteTimeEntry = async (taskIndex: number, entryIndex: number) => {
    try {
      const response = await fetch("/api/daily/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          taskIndex,
          action: "delete",
          startTime: entryIndex,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      setTasks(
        data.tasks.map((t: any) => ({
          ...t,
          timeEntries: Array.isArray(t.timeEntries) ? t.timeEntries : [],
        }))
      );
    } catch (err) {
      console.error("Error deleting time entry:", err);
      alert("Failed to delete time entry");
    }
  };

  // Update logged minutes (called from TimeLogForm)
  const handleUpdateLoggedMinutes = useCallback(
    (taskIndex: number, totalMinutes: number) => {
      setTasks((prevTasks) => {
        const copy = [...prevTasks];
        copy[taskIndex] = {
          ...copy[taskIndex],
          loggedMinutes: totalMinutes,
        };
        return copy;
      });
    },
    []
  );

  // Delete global task
  const handleDeleteGlobalTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP ${res.status}`);
      }
      setGlobalTasks(globalTasks.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting global task:", err);
      alert("Failed to delete task. Check console for details.");
    }
  };

  // Save day
  const handleSaveDay = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, tasks }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      alert("Day saved successfully!");
    } catch (err) {
      console.error("Error saving day:", err);
      alert("Failed to save day");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle selecting a date from statistics
  const handleSelectDateFromStats = (selectedDate: string) => {
    setDate(selectedDate);
    setView("today");
  };

  return (
    <main className="min-h-screen bg-white p-6 sm:p-8 mx-auto">
      {/* View Toggle */}
      <div className="mb-8">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setView("today")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              view === "today"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setView("tasks")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              view === "tasks"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setView("stats")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              view === "stats"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* Today View */}
      {view === "today" && (
        <>
          {/* Date Selector */}
          <DateSelector
            date={date}
            onDateChange={setDate}
            formatDate={formatDate}
          />

      {/* Daily Tasks Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Tasks</h2>

        {/* Summary Card */}
        <DailyTasksSummary tasks={tasks} />

        {/* Add Task from Existing */}
        {globalTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2">
              <select
                value={selectedTaskToAdd}
                onChange={(e) => {
                  const task = globalTasks.find((t) => t._id === e.target.value);
                  if (task) handleAddTaskToDay(task);
                }}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
              >
                <option value="">+ Add task to today</option>
                {globalTasks
                  .filter((t) => !tasks.some((task) => task.taskId === t._id))
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks added yet. Add one to get started!</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <TaskCard
                key={index}
                index={index}
                task={task}
                onUpdateTask={handleUpdateTask}
                onRemoveTask={handleRemoveTask}
                onAddTimeEntry={handleAddTimeEntry}
                onEndTimeEntry={handleEndTimeEntry}
                onDeleteTimeEntry={handleDeleteTimeEntry}
                onUpdateLoggedMinutes={handleUpdateLoggedMinutes}
                formatTime={formatTimeIST}
              />
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      <SaveButton show={tasks.length > 0} onClick={handleSaveDay} isLoading={isSaving} />
        </>
      )}

      {/* Tasks View */}
      {view === "tasks" && (
        <>
          <GlobalTasksSection
            globalTasks={globalTasks}
            tasks={[]}
            showGlobalTasks={false}
            showAddTask={showAddTask}
            newTaskName={newTaskName}
            newTaskTime={newTaskTime}
            selectedTaskToAdd=""
            onToggleGlobalTasks={() => {}}
            onToggleAddTask={() => setShowAddTask(!showAddTask)}
            onNewTaskNameChange={setNewTaskName}
            onNewTaskTimeChange={setNewTaskTime}
            onAddGlobalTask={handleAddGlobalTask}
            onSelectTaskToAdd={() => {}}
            onAddTaskToDay={() => {}}
            onDeleteGlobalTask={handleDeleteGlobalTask}
            onCancelAdd={() => {
              setShowAddTask(false);
              setNewTaskName("");
              setNewTaskTime("30");
            }}
          />
        </>
      )}

      {/* Stats View */}
      {view === "stats" && <DailyStats onSelectDate={handleSelectDateFromStats} />}
    </main>
  );
}
