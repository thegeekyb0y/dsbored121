"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Clock, BarChart2, Users } from "lucide-react"; // Make sure you have lucide-react or use your own icons

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Navbar Placeholder (Or import a simplified AppBar) */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="text-2xl font-bold tracking-tighter">Kraked.</div>
        <div className="flex gap-4">
          {!session && (
            <Link
              href="/login"
              className="text-gray-400 hover:text-white transition"
            >
              Login
            </Link>
          )}
          <Link
            href={session ? "/dashboard" : "/signup"}
            className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition"
          >
            {session ? "Go to App" : "Sign Up"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 mt-10 md:mt-0">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400">
          Study Together.
          <br /> Stay Focused.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          Join thousands of students tracking their progress, competing in study
          rooms, and mastering their time with Kraked.
        </p>

        <Link
          href={session ? "/dashboard" : "/login"}
          className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition active:scale-95"
        >
          {session ? "Open Dashboard" : "Start Studying Now"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full text-left">
          <FeatureCard
            icon={<Clock className="w-6 h-6 text-purple-400" />}
            title="Focus Timer"
            desc="Customizable Pomodoro timers to keep your study sessions productive."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6 text-blue-400" />}
            title="Multiplayer Rooms"
            desc="Study with friends in real-time rooms. See who is focused and who is slacking."
          />
          <FeatureCard
            icon={<BarChart2 className="w-6 h-6 text-green-400" />}
            title="Weekly Analytics"
            desc="Visual charts that track your study habits and improvements over time."
          />
        </div>
      </main>

      <footer className="p-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Kraked. All rights reserved.
      </footer>
    </div>
  );
}

// Simple Helper Component for the grid
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
