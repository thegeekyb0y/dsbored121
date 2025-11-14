"use client";

import { useEffect, useRef, useState } from "react";
import useStopwatch from "@/app/hooks/useStopwatch";
import { useTimer } from "@/app/hooks/useTimer";

interface UnifiedTimerProps {
  mode: "focus" | "pomodoro";
  onComplete: (durationSeconds: number) => void;
  subject: string;
}

export default function UnifiedTimer({
  mode,
  onComplete,
  subject,
}: UnifiedTimerProps) {
  const stopwatch = useStopwatch();
  const pomodoro = useTimer(25);
  const completionCalledRef = useRef(false);
  const [sessionActive, setSessionActive] = useState(false);

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

  const isInitialState =
    mode === "focus"
      ? stopwatch.elapsedSeconds === 0
      : pomodoro.timeLeft === pomodoro.initialDuration;

  const handlePause = async () => {
    pauseTimer();

    try {
      await fetch("/api/sessions/pause", { method: "POST" });
    } catch (error) {
      console.error("Failed to pause session:", error);
    }
  };

  const handleResume = async () => {
    startTimer();

    try {
      const response = await fetch("/api/sessions/resume", { method: "POST" });
      const data = await response.json();
    } catch (error) {
      console.error("Failed to resume session:", error);
    }
  };

  const handleStop = async () => {
    pauseTimer();

    const durationToSave =
      mode === "focus"
        ? stopwatch.elapsedSeconds
        : pomodoro.initialDuration - pomodoro.timeLeft;

    try {
      await fetch("/api/sessions/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to stop session:", error);
    }

    if (mode === "pomodoro") {
      completionCalledRef.current = true;
    }

    setSessionActive(false);
    onComplete(durationToSave);
    resetTimer();
  };

  const handleStart = async () => {
    startTimer();
    setSessionActive(true);

    try {
      await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: subject }),
      });
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  return (
    <div className="bg-gray-800 w-full max-w-lg p-12 text-center">
      <h1 className="text-8xl font-bold text-white mb-8">{formattedTime}</h1>

      <p className="text-gray-300 mb-4">Subject: {subject || "—"}</p>

      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button
            onClick={isInitialState ? handleStart : handleResume}
            className="bg-[#40c057] hover:bg-[#40c057]/80 border-2 border-krakedlight text-white px-8 py-4 font-semibold text-lg"
          >
            {isInitialState ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="bg-yellow-600 hover:bg-yellow-700 border-2 border-krakedlight text-white px-8 py-4 font-semibold text-lg"
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
          className="bg-blue-600 hover:bg-blue-700 border-2 border-krakedlight text-white px-8 py-4 font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Stop & Save
        </button>

        <button
          onClick={resetTimer}
          className="bg-gray-600 hover:bg-gray-700 border-2 border-krakedlight text-white px-8 py-4 font-semibold text-lg"
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
