"use client";

import { useState } from "react";
import TimerPage from "./timer/page";
import TodoList from "./components/TodoList";
import WeeklyStatsWidget from "./components/WeeklyStatsWidget";
import AuthGate from "./components/AuthGate";

export default function Home() {
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  // Note: We can't pass props to TimerPage anymore since it's a Next.js page component
  // If you need to trigger stats refresh, consider using a global state management solution
  // or event emitter pattern

  return (
    <main className="relative min-h-screen overflow-x-hidden pb-12 px-4">
      <section className="relative z-10 w-full mb-8 pt-10 px-6">
        <TimerPage />
      </section>

      <section className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-fit">
        <div className="lg:col-span-2 h-full  min-h-fit max-h-[500px]">
          <AuthGate
            title="Unlock Tasks"
            description="Track your assignments and deadlines."
          >
            <TodoList />
          </AuthGate>
        </div>

        <div className="lg:col-span-1 min-h-fit max-h-[500px]  ">
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
