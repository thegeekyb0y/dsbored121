"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WeeklyChart from "../components/WeeklyChart";
import SubjectPieChart from "../components/SubjectPie";
import ActivityHeatmap from "../components/ActivityComponent";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import { DUMMY_STATS, StatsData } from "@/lib/dummystats";

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    } else if (status === "unauthenticated") {
      setStats(DUMMY_STATS);
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

  const isGuest = status === "unauthenticated";

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading stats...</div>
      </div>
    );
  }

  if (error && !isGuest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="relative min-h-screen">
      {isGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
            onClick={() => signIn()}
          />

          {/* Floating Glass Card */}
          <div className="relative bg-krakedblue/20  backdrop-blur-xl p-8 border-t-3 border-x-krakedlight/20 shadow-2xl max-w-md text-center transform transition-all hover:scale-105">
            <div className="flex">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>

              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-left pl-6 text-white mb-2">
                  Unlock Your Insights
                </h2>

                <p className="text-gray-300 mb-8 pl-6 text-left">
                  Analyse study patterns, track progress and streaks!
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn()}
                className="w-full bg-green-600 hover:bg-green-500 cursor-pointer text-white font-bold py-3 px-6  flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Login to View Stats
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full cursor-pointer hover:bg-white/15 bg-white/5 text-gray-400 font-semibold py-3 px-6  transition-colors"
              >
                Back to Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Blurred if Guest */}
      <div
        className={`max-w-7xl mx-auto px-12 py-12 transition-all duration-500 ${
          isGuest ? "blur-md opacity-60 pointer-events-none select-none" : ""
        }`}
      >
        {/* Top Section: Heading + Stats Cards + Image */}
        <div className="flex gap-6 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-4xl font-bold">Your Study Stats</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-krakedblue/20 shadow p-6 border border-white/5">
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
              <div className="bg-krakedblue/20 shadow p-6 border border-white/5">
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
          <div className="w-64 shrink-0 md:block hidden">
            <Image
              src="/statsfocus.jpg"
              alt="Focus Character"
              width={400}
              height={400}
              className="rounded-lg grayscale opacity-80"
            />
          </div>
        </div>

        {/* Weekly Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <WeeklyChart data={stats.dailyData || []} />
          <SubjectPieChart data={stats.bySubject} />
        </div>

        <ActivityHeatmap
          data={stats.monthActivity || []}
          insights={stats.insights}
        />
      </div>
    </div>
  );
}
