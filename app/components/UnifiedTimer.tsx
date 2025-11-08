"use client";

import { useEffect, useRef } from "react";
import useStopwatch from "@/app/hooks/useStopwatch";
import { useTimer } from "@/app/hooks/useTimer";

interface UnifiedTimerProps {
  mode: "focus" | "pomodoro";
  onComplete: (durationSeconds: number) => void;
}

export default function UnifiedTimer({ mode, onComplete }: UnifiedTimerProps) {
  const stopwatch = useStopwatch();
  const pomodoro = useTimer(25);
  const completionCalledRef = useRef(false);

  // Auto-complete for Pomodoro when reaches 00:00
  useEffect(() => {
    if (mode !== "pomodoro") return;

    // Reset flag when timer is reset
    if (pomodoro.timeLeft === pomodoro.initialDuration) {
      completionCalledRef.current = false;
    }

    // Call onComplete only once when timer finishes
    if (pomodoro.timeLeft === 0 && !completionCalledRef.current) {
      completionCalledRef.current = true;
      onComplete(pomodoro.initialDuration);
    }
  }, [mode, pomodoro.timeLeft, pomodoro.initialDuration, onComplete]);

  const { formattedTime, isRunning, startTimer, pauseTimer, resetTimer } =
    mode === "focus" ? stopwatch : pomodoro;

  const handleStop = () => {
    const durationToSave =
      mode === "focus"
        ? stopwatch.elapsedSeconds
        : pomodoro.initialDuration - pomodoro.timeLeft;
    if (mode === "pomodoro") {
      completionCalledRef.current = true;
    }
    onComplete(durationToSave);
    resetTimer();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-12 text-center">
      <h1 className="text-8xl font-bold text-white mb-8">{formattedTime}</h1>

      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="bg-[#40c057] hover:bg-[#40c057]/80 border-2 border-krakedlight text-white px-8 py-4 rounded-lg font-semibold text-lg"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="bg-yellow-600 hover:bg-yellow-700 border-2 border-krakedlight text-white px-8 py-4 rounded-lg font-semibold text-lg"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={
            (mode === "focus" && stopwatch.elapsedSeconds === 0) ||
            (mode === "pomodoro" &&
              pomodoro.timeLeft === pomodoro.initialDuration)
          }
          className="bg-blue-600 hover:bg-blue-700 border-2 border-krakedlight text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Stop & Save
        </button>

        <button
          onClick={resetTimer}
          className="bg-gray-600 hover:bg-gray-700 border-2 border-krakedlight text-white px-8 py-4 rounded-lg font-semibold text-lg"
        >
          Reset
        </button>
      </div>

      {mode === "focus" && (
        <p className="text-gray-400 mt-4">
          {stopwatch.elapsedSeconds} seconds elapsed
        </p>
      )}
    </div>
  );
}
