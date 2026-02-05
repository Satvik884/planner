import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface Task {
  _id: string;
  name: string;
  defaultGoalMinutes: number;
}

interface GlobalTasksSectionProps {
  globalTasks: Task[];
  tasks: any[];
  showGlobalTasks: boolean;
  showAddTask: boolean;
  newTaskName: string;
  newTaskTime: string;
  selectedTaskToAdd: string;
  onToggleGlobalTasks: () => void;
  onToggleAddTask: () => void;
  onNewTaskNameChange: (name: string) => void;
  onNewTaskTimeChange: (time: string) => void;
  onAddGlobalTask: () => void;
  onSelectTaskToAdd: (taskId: string) => void;
  onAddTaskToDay: (task: Task) => void;
  onDeleteGlobalTask: (taskId: string) => void;
  onCancelAdd: () => void;
}

export default function GlobalTasksSection({
  globalTasks,
  newTaskName,
  newTaskTime,
  showAddTask,
  onToggleAddTask,
  onNewTaskNameChange,
  onNewTaskTimeChange,
  onAddGlobalTask,
  onDeleteGlobalTask,
  onCancelAdd,
}: GlobalTasksSectionProps) {
  return (
    <div className="mb-8">
      {!showAddTask ? (
        <button
          onClick={onToggleAddTask}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Create Task
        </button>
      ) : (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-3 mb-6">
          <input
            type="text"
            placeholder="Task name"
            value={newTaskName}
            onChange={(e) => onNewTaskNameChange(e.target.value)}
            className="w-full border text-black border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <input
            type="number"
            min="1"
            value={newTaskTime}
            onChange={(e) => onNewTaskTimeChange(e.target.value)}
            className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Default goal time (minutes)"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={onAddGlobalTask}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Add
            </button>
            <button
              onClick={onCancelAdd}
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h3>
        <div className="space-y-3">
          {globalTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks yet. Create one to get started!</p>
            </div>
          ) : (
            globalTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{task.name}</p>
                  <p className="text-sm text-gray-500">
                    {task.defaultGoalMinutes} min default goal
                  </p>
                </div>
                <button
                  onClick={() => onDeleteGlobalTask(task._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors px-3 py-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
