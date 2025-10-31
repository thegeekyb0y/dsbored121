"use client";

import { useState, useEffect, useRef } from "react";
import useStopwatch from "@/app/hooks/useStopwatch";
import { useTimer } from "@/app/hooks/useTimer";

interface UnifiedTimerProps {
  mode: "focus" | "pomodoro";
  onComplete: (durationSeconds: number) => void;
}

export default function UnifiedTimer({ mode, onComplete }: UnifiedTimerProps) {
  // Stopwatch for Focus Mode
  const stopwatch = useStopwatch();

  // Countdown for Pomodoro Mode (useTimer accepts an optional duration in minutes)
  const pomodoro = useTimer(25);

  // call onComplete when pomodoro finishes (only once per cycle)
  const completionCalledRef = useRef(false);

  useEffect(() => {
    if (mode !== "pomodoro") return;

    // reset the flag when timer is reset or a new session starts
    if (pomodoro.timeLeft === pomodoro.initialDuration) {
      completionCalledRef.current = false;
    }

    if (pomodoro.timeLeft === 0 && !completionCalledRef.current) {
      completionCalledRef.current = true;
      onComplete(pomodoro.initialDuration);
    }
  }, [mode, pomodoro.timeLeft, pomodoro.initialDuration, onComplete]);

  // Use the appropriate timer based on mode
  const { formattedTime, isRunning, startTimer, pauseTimer, resetTimer } =
    mode === "focus" ? stopwatch : pomodoro;

  // Stop button (only for Focus Mode)
  const handleStop = () => {
    pauseTimer();
    if (mode === "focus") {
      onComplete(stopwatch.elapsedSeconds);
    }
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

        {mode === "focus" && (
          <button
            onClick={handleStop}
            disabled={!isRunning && stopwatch.elapsedSeconds === 0}
            className="bg-blue-600 hover:bg-blue-700 border-2 border-krakedlight text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Stop & Save
          </button>
        )}

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
