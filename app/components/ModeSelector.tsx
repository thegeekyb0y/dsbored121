"use client";

import { FlameIcon, HourglassIcon } from "lucide-react";

interface ModeSelectorProps {
  mode: "focus" | "pomodoro";
  onModeChange: (mode: "focus" | "pomodoro") => void;
}

export default function ModeSelector({
  mode,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="flex gap-4 mb-3 sm:mb-8 ">
      <button
        onClick={() => onModeChange("focus")}
        className={`px-3 md:px-4 py-3  font-semibold transition flex cursor-pointer items-center gap-3 ${
          mode === "focus"
            ? "bg-[#26659f] text-white border-2 border-krakedlight"
            : "bg-[#3B82C6]/20 text-gray-300 hover:bg-[#3B82C6]/30"
        }`}
      >
        <FlameIcon width={20} height={20} className="fill-current" />
        Focus Mode
      </button>
      <button
        onClick={() => onModeChange("pomodoro")}
        className={`px-3 md:px-6 py-3 font-semibold transition flex cursor-pointer items-center gap-3 ${
          mode === "pomodoro"
            ? "bg-[#26659f] text-white border-2 border-krakedlight"
            : "bg-[#3B82C6]/20 text-gray-300 hover:bg-[#3B82C6]/30"
        }`}
      >
        <HourglassIcon height={20} width={20} className="fill-current" />{" "}
        Pomodoro
      </button>
    </div>
  );
}
