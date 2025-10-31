"use client";

interface ModeSelectorProps {
  mode: "focus" | "pomodoro";
  onModeChange: (mode: "focus" | "pomodoro") => void;
}

export default function ModeSelector({
  mode,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => onModeChange("focus")}
        className={`px-4 py-3 rounded-lg font-semibold transition ${
          mode === "focus"
            ? "bg-[#3B82C6] text-white border-2 border-krakedlight"
            : "bg-[#3B82C6]/20 text-gray-300 hover:bg-[#3B82C6]/30"
        }`}
      >
        🔥 Focus Mode
      </button>
      <button
        onClick={() => onModeChange("pomodoro")}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          mode === "pomodoro"
            ? "bg-[#3B82C6] text-white border-2 border-krakedlight"
            : "bg-[#3B82C6]/20 text-gray-300 hover:bg-[#3B82C6]/30"
        }`}
      >
        ⌛ Pomodoro
      </button>
    </div>
  );
}
