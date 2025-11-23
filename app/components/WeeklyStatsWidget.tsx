"use client";

import { useEffect, useState } from "react";
import WeeklyChart from "./WeeklyChart";
import { RefreshCw } from "lucide-react";

export default function WeeklyStatsWidget({
  refreshTrigger,
}: {
  refreshTrigger: number;
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json.dailyData || []);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  return (
    <div className="h-full flex flex-col bg-krakedblue/20 border border-krakedlight/20 rounded-xl p-6 shadow-lg backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Weekly Progress</h3>
        <button
          onClick={fetchStats}
          className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
            loading ? "animate-spin" : ""
          }`}
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        {loading && data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : (
          <WeeklyChart data={data} />
        )}
      </div>
    </div>
  );
}
