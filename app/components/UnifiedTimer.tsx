"use client";

import { useEffect, useRef, useState } from "react";
import useStopwatch from "@/app/hooks/useStopwatch";
import { useTimer } from "@/app/hooks/useTimer";
import { PauseIcon, PlayIcon, RedoIcon, SaveAllIcon } from "lucide-react";

interface UnifiedTimerProps {
  mode: "focus" | "pomodoro";
  onComplete: (durationSeconds: number) => void;
  subject: string;
  onSessionRestored?: (tag: string) => void; // Callback when session is restored
}

export default function UnifiedTimer({
  mode,
  onComplete,
  subject,
  onSessionRestored,
}: UnifiedTimerProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [restoredElapsed, setRestoredElapsed] = useState(0);

  const stopwatch = useStopwatch(restoredElapsed);
  const pomodoro = useTimer(25);
  const completionCalledRef = useRef(false);
  const hasRestoredRef = useRef(false);

  // 🔥 STEP A: Fetch and restore active session on mount
  useEffect(() => {
    const fetchAndRestoreSession = async () => {
      try {
        const response = await fetch("/api/sessions/active");
        const data = await response.json();

        if (data.activeSession) {
          const { startedAt, tag, isPaused, pausedAt } = data.activeSession;

          // Calculate elapsed time
          let elapsed: number;

          if (isPaused && pausedAt) {
            // If paused, calculate time from start to pause
            elapsed = Math.floor(
              (new Date(pausedAt).getTime() - new Date(startedAt).getTime()) /
                1000
            );
          } else {
            // If running, calculate time from start to now
            elapsed = Math.floor(
              (Date.now() - new Date(startedAt).getTime()) / 1000
            );
          }

          // Set the restored elapsed time
          setRestoredElapsed(elapsed);
          setSessionActive(true);
          hasRestoredRef.current = true;

          // Notify parent component to update subject
          if (onSessionRestored) {
            onSessionRestored(tag);
          }

          // If session was running (not paused), auto-start the timer
          if (!isPaused) {
            setTimeout(() => {
              stopwatch.startTimer();
            }, 100);
          }

          console.log(
            `✅ Session restored: ${elapsed}s elapsed, tag: ${tag}, paused: ${isPaused}`
          );
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchAndRestoreSession();
  }, []); // Run once on mount

  // 🔥 STEP B: Auto-stop and save on page unload (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (sessionActive) {
        // Show browser warning
        e.preventDefault();
        e.returnValue =
          "You have an active study session. It will be stopped and saved automatically.";

        // Stop and save the session using sendBeacon (more reliable than fetch on unload)
        const blob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/sessions/stop", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionActive]);

  // Pomodoro completion logic
  useEffect(() => {
    if (mode !== "pomodoro") return;

    if (pomodoro.timeLeft === pomodoro.initialDuration) {
      completionCalledRef.current = false;
    }

    if (pomodoro.timeLeft === 0 && !completionCalledRef.current) {
      completionCalledRef.current = true;
      onComplete(pomodoro.initialDuration);
    }
  }, [mode, pomodoro.timeLeft, pomodoro.initialDuration, onComplete]);

  const { formattedTime, isRunning, startTimer, pauseTimer, resetTimer } =
    mode === "focus" ? stopwatch : pomodoro;

  const isInitialState =
    mode === "focus"
      ? stopwatch.elapsedSeconds === 0 && !hasRestoredRef.current
      : pomodoro.timeLeft === pomodoro.initialDuration;

  const handlePause = async () => {
    pauseTimer();

    try {
      await fetch("/api/sessions/pause", { method: "POST" });
      console.log("✅ Session paused");
    } catch (error) {
      console.error("Failed to pause session:", error);
    }
  };

  const handleResume = async () => {
    startTimer();

    try {
      await fetch("/api/sessions/resume", { method: "POST" });
      console.log("✅ Session resumed");
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
      await fetch("/api/sessions/stop", { method: "POST" });
      console.log(`✅ Session stopped and saved: ${durationToSave}s`);
    } catch (error) {
      console.error("Failed to stop session:", error);
    }

    if (mode === "pomodoro") {
      completionCalledRef.current = true;
    }

    setSessionActive(false);
    hasRestoredRef.current = false;
    setRestoredElapsed(0);
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
      console.log(`✅ Session started: ${subject}`);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  // Show loading state while checking for active session
  if (isInitializing) {
    return (
      <div className="bg-krakedblue/40 w-full max-w-lg p-8 text-center">
        <p className="text-gray-400">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="bg-krakedblue/40 w-full max-w-lg p-8 text-center">
      <h1 className="text-8xl font-bold text-white mb-8">{formattedTime}</h1>

      <p className="text-gray-300 mb-4">Subject: {subject || "—"}</p>

      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button
            onClick={isInitialState ? handleStart : handleResume}
            className="bg-[#40c057] hover:bg-[#40c057]/80 border-2 flex items-center gap-3 border-krakedlight text-white px-4 py-4 font-semibold text-lg"
          >
            <PlayIcon width={20} height={20} />
            {isInitialState ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="bg-yellow-600 hover:bg-yellow-700 border-2 flex items-center gap-3 border-krakedlight text-white px-4 py-4 font-semibold text-lg"
          >
            <PauseIcon width={20} height={20} />
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
          className="bg-blue-600 hover:bg-blue-700 border-2 flex items-center gap-2 border-krakedlight text-white px-2 py-4 font-semibold text-md disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <SaveAllIcon width={20} height={20} />
          Stop & Save
        </button>

        <button
          onClick={resetTimer}
          className="bg-gray-600 hover:bg-gray-700 border-2 border-krakedlight flex items-center gap-2 text-white px-4 py-4 font-semibold text-md"
        >
          <RedoIcon width={20} height={20} />
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
