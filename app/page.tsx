"use client";

import { useState } from "react";
import TimerPage from "./timer/page";
import TodoList from "./components/TodoList";
import WeeklyStatsWidget from "./components/WeeklyStatsWidget";
import AuthGate from "./components/AuthGate";

export default function Home() {
  // This state forces the chart to re-fetch when the timer finishes
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  const handleSessionComplete = () => {
    setRefreshStatsTrigger((prev) => prev + 1);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden pb-12 px-4">
      {/* 1. Timer Section */}
      <section className="relative z-10 w-full mb-8">
        <TimerPage onSessionComplete={handleSessionComplete} />
      </section>

      {/* 2. Split Layout Section (2/3 Todo, 1/3 Chart) */}
      <section className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
        {/* Left: Todo List (Takes 2/3 of space) */}
        <div className="lg:col-span-2 h-full min-h-[500px]">
          <AuthGate
            title="Unlock Tasks"
            description="Track your assignments and deadlines."
          >
            <TodoList />
          </AuthGate>
        </div>

        {/* Right: Weekly Chart (Takes 1/3 of space) */}
        <div className="lg:col-span-1 h-full min-h-[300px]">
          <AuthGate
            title="Unlock Insights"
            description="See your weekly study progress visualized."
          >
            <WeeklyStatsWidget refreshTrigger={refreshStatsTrigger} />
          </AuthGate>
        </div>
      </section>
    </main>
  );
}
