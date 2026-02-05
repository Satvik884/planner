import React, { useEffect, useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";

interface DailyLog {
  _id: string;
  date: string;
  totalLoggedMinutes: number;
  tasks: Array<{
    name: string;
    goalMinutes: number;
    loggedMinutes: number;
  }>;
}

interface DailyStatsProps {
  onSelectDate?: (date: string) => void;
}

export default function DailyStats({ onSelectDate }: DailyStatsProps) {
  const [stats, setStats] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      // Fetch stats for last 30 days
      const response = await fetch("/api/daily/stats");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data.logs || []);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (log: DailyLog) => {
    if (!log.tasks || log.tasks.length === 0) return 0;
    
    const totalGoal = log.tasks.reduce((sum, task) => sum + task.goalMinutes, 0);
    const totalLogged = log.tasks.reduce((sum, task) => sum + task.loggedMinutes, 0);
    
    if (totalGoal === 0) return 0;
    return Math.min(100, Math.round((totalLogged / totalGoal) * 100));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading stats...</div>;
  }

  const sortedStats = [...stats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-gray-900" />
        <h2 className="text-2xl font-bold text-gray-900">Daily Statistics</h2>
      </div>

      {sortedStats.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No data yet. Start logging your work!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedStats.map((log) => {
            const completion = calculateCompletion(log);
            const isCompleted = completion >= 100;

            return (
              <div
                key={log._id}
                onClick={() => onSelectDate?.(log.date)}
                className="bg-white border border-gray-200 p-4 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 hover:text-blue-600">{formatDate(log.date)}</p>
                    <p className="text-sm text-gray-500">
                      {log.tasks.length} task{log.tasks.length !== 1 ? "s" : ""} • {log.totalLoggedMinutes}m logged
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${isCompleted ? "text-green-600" : "text-gray-900"}`}>
                      {completion}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCompleted ? "bg-green-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
