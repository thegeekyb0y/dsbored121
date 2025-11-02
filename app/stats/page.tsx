"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import StatsChart from "@/app/components/StatsChart";

interface StatsData {
  today: {
    totalMinutes: number;
    sessionCount: number;
  };
  week: {
    totalMinutes: number;
    sessionCount: number;
  };
  bySubject: Array<{
    tag: string;
    minutes: number;
    count: number;
  }>;
  recentSessions: Array<{
    id: string;
    duration: number;
    tag: string;
    createdAt: string;
  }>;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sessions/stats");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading stats...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl">You need to login to access your stats.</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Your Study Stats</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Today Card */}
        <div className="bg-krakedblue border-3 border-krakedlight rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-krakedlight">Today</h3>
          <div className="text-4xl font-bold text-white mb-2">
            {stats.today.totalMinutes} min
          </div>
          <p className="text-krakedlight/80">
            {stats.today.sessionCount} sessions
          </p>
        </div>

        {/* This Week Card */}
        <div className="bg-krakedblue border-3 border-krakedlight rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-krakedlight">
            This Week
          </h3>
          <div className="text-4xl font-bold text-white mb-2">
            {stats.week.totalMinutes} min
          </div>
          <p className="text-krakedlight/80">
            {stats.week.sessionCount} sessions
          </p>
        </div>
      </div>
      {/* Chart + Recent Sessions side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 items-stretch">
        {/* Left: This Week by Subject (chart) */}
        <div className="bg-krakedblue border-3 border-krakedlight rounded-lg shadow p-6 w-full flex flex-col">
          {/* make chart fill its area */}
          <div className="w-full flex-1">
            <StatsChart data={stats.bySubject} />
          </div>
        </div>

        {/* Right: Recent Sessions */}
        <div className="bg-krakedblue border-3 border-krakedlight rounded-lg shadow p-6 w-full flex flex-col">
          <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>

          {stats.recentSessions.length === 0 ? (
            <p className="text-krakedlight">No sessions yet. Start studying!</p>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-krakedblue2">
                      <td className="px-4 py-3 text-sm">{session.tag}</td>
                      <td className="px-4 py-3 text-sm">
                        {Math.floor(session.duration / 60)} min
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
