"use client";

import { useState } from "react";

import TimerPage from "@/app/(main)/timer/page";
import TodoList from "@/app/components/TodoList";
import WeeklyStatsWidget from "@/app/components/WeeklyStatsWidget";
import AuthGate from "@/app/components/AuthGate";

export default function Home() {
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  return (
    <main className="relative min-h-screen overflow-x-hidden pb-12 px md:px-4">
      <section className="relative z-10 w-full mb-6 sm:mb-8 pt-6 sm:pt-10 sm:px-4 md:px-6">
        <TimerPage />
      </section>

      <section className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-fit">
        <div className="lg:col-span-2 h-full min-h-fit max-h-[500px]">
          <AuthGate
            title="Unlock Tasks"
            description="Track your assignments and deadlines."
          >
            <TodoList />
          </AuthGate>
        </div>

        <div className="lg:col-span-1 min-h-fit max-h-[500px]">
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
