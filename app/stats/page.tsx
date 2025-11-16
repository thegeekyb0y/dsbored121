"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import WeeklyChart from "../components/WeeklyChart";
import SubjectPieChart from "../components/SubjectPie";
import ActivityHeatmap from "../components/ActivityComponent";

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
  dailyData: Array<{
    date: string;
    day: string;
    minutes: number;
  }>;
  monthActivity: Array<{
    date: string;
    minutes: number;
  }>;
  insights: {
    currentStreak: number;
    longestStreak: number;
    longestStreakDate: string;
    mostActiveDay: string;
    mostActiveTime: string;
    mostStudiedSubject: string;
  };
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
      const response = await fetch(`/api/sessions/stats`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setStats(data);
    } catch {
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
          className="bg-blue-600 text-white px-6 py-3"
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
    <div className="max-w-7xl mx-auto px-12 py-12">
      {/* Top Section: Heading + Stats Cards + Image */}
      <div className="flex gap-6 mb-12">
        {/* Left side: Heading + Stats Cards */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-8">Your Study Stats</h1>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today Card */}
            <div className="bg-krakedblue/20 hover:bg-krakedblue/45 ease-in transition-all duration-300 shadow p-6">
              <h3 className="text-lg font-semibold mb-2 text-krakedlight">
                Today
              </h3>
              <div className="text-4xl font-bold text-white mb-2">
                {stats.today.totalMinutes} min
              </div>
              <p className="text-krakedlight/80">
                {stats.today.sessionCount} sessions
              </p>
            </div>
            {/* This Week Card */}
            <div className="bg-krakedblue/20 hover:bg-krakedblue/45 ease-in transition-all duration-300 shadow p-6">
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
        </div>
        {/* Right side: Image spanning full height */}
        <div className="w-64 shrink-0">
          <Image
            src="/statsfocus.jpg"
            alt="A detailed pencil sketch of a character by a fire."
            layout="responsive"
            width={400}
            height={400}
          />
        </div>
      </div>

      {/* Weekly Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Weekly Overview Chart */}
        <WeeklyChart data={stats.dailyData || []} />

        {/* Pie Chart */}
        <SubjectPieChart data={stats.bySubject} />
      </div>

      {/* Activity Heatmap with Insights */}
      <ActivityHeatmap
        data={stats.monthActivity || []}
        insights={stats.insights}
      />
    </div>
  );
}
