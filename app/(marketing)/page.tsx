"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { LandingAppBar } from "../components/LandingAppBar";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { StickyScroll } from "../components/StickyScroll";

// Define the content for the Sticky Scroll here
const featuresContent = [
  {
    title: "Real-Time Study Rooms",
    description:
      "Join or create virtual study sessions with friends. See who's actively studying, track collective focus time, and hold each other accountable in real-time.",
    content: (
      <div className="h-full w-full bg-linear-to-br from-krakedblue to-purple-900 flex items-center justify-center text-white rounded-md">
        <Image
          src="/features/feature1.png"
          width={400}
          height={400}
          className="h-full w-full object-cover opacity-90"
          alt="Kraked Analytics Dashboard"
        />
      </div>
    ),
  },
  {
    title: "Progress Analytics",
    description:
      "Visualize your study patterns with detailed charts and insights. Track daily streaks, total focus hours, subject breakdowns, and productivity trends over weeks and months.",
    content: (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <Image
          src="/features/feature3.png"
          width={400}
          height={400}
          className="h-full w-full object-cover opacity-90"
          alt="Kraked Analytics Dashboard"
        />
      </div>
    ),
  },
  {
    title: "Two Modes, One Goal",
    description:
      "Focus Mode for deep work. Pomodoro Mode for structured sprints. Switch anytime, study your way.",
    content: (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <Image
          src="/features/feature4.png"
          width={400}
          height={400}
          className="h-full w-full object-cover opacity-80"
          alt="Focus Mode Interface"
        />
      </div>
    ),
  },
  {
    title: "Task Management",
    description:
      "Organize your study goals with built-in to-do lists. Break down large projects into manageable tasks and check them off as you make progress during focused sessions.",
    content: (
      <div className="h-full w-full bg-linear-to-br from-emerald-800 to-krakedgreen flex items-center justify-center text-white rounded-md">
        <Image
          src="/features/feature5.png"
          width={400}
          height={400}
          className="h-full w-full object-cover opacity-90"
          alt="Kraked Analytics Dashboard"
        />
      </div>
    ),
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const { scrollY } = useScroll();

  const rotateX = useTransform(scrollY, [0, 300], [15, 0]);
  const scale = useTransform(scrollY, [0, 300], [0.9, 1]);
  const opacity = useTransform(scrollY, [0, 300], [0.8, 1]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      {/* Background linear Effect */}
      <div className="absolute top-0 left-0 w-full h-96 bg-krakedblue/20 blur-[100px] rounded-full pointer-events-none" />

      <LandingAppBar />

      {/* Hero Section with overflow control */}
      <div className="overflow-x-hidden">
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 md:pt-36 z-10 pb-24">
          {/* Hero Section */}
          <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400">
            Study Together.
            <br /> Stay Focused.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
            Join thousands of students tracking their progress, competing in
            study rooms, and mastering their time with Kraked.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 bg-white text-black px-6 py-3 md:px-8 md:py-4 text-lg font-bold hover:bg-gray-200 transition active:scale-95 rounded-sm"
            >
              Start Studying
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="group flex items-center gap-2 border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 text-lg font-bold hover:bg-white/10 transition active:scale-95 rounded-sm"
            >
              Create a Room
            </Link>
          </div>

          {/* Hero Image with 3D Effect */}
          <div className="relative w-full max-w-5xl mx-auto mt-12 md:mt-24 px-2 perspective-[2000px]">
            <motion.div
              style={{
                rotateX,
                scale,
                opacity,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full h-auto 
                        mask-b-from-35% mask-b-to-90%
                        rounded-xl overflow-hidden shadow-2xl shadow-krakedblue/10 border-2 border-krakedlight/70"
            >
              <Image
                src="/heroimg2.png"
                alt="background"
                className="size-full object-cover"
                width="3276"
                height="4095"
                priority
              />
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay" />
            </motion.div>
          </div>
        </main>
      </div>

      <section id="features" className="w-full py-6 md:py-32 scroll-mt-28">
        <div className="mb-16 md:mb-20 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Everything you need to master your workflow, built right into
            Kraked.
          </p>
        </div>

        <StickyScroll content={featuresContent} />
      </section>

      <section id="how-to-use" className="w-full py-20 md:py-32 scroll-mt-28">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">
            How to Use
          </h2>
        </div>
      </section>

      <footer className="p-8 text-center text-gray-600 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} Kraked. All rights reserved.
      </footer>
    </div>
  );
}
