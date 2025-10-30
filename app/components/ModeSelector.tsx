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
        className={`px-8 py-3 rounded-lg font-semibold transition ${
          mode === "focus"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Focus Mode
      </button>
      <button
        onClick={() => onModeChange("pomodoro")}
        className={`px-8 py-3 rounded-lg font-semibold transition ${
          mode === "pomodoro"
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Pomodoro
      </button>
    </div>
  );
}
