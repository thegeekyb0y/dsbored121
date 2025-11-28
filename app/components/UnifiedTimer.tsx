"use client";

import { useEffect, useRef, useState } from "react";
import useStopwatch from "@/app/hooks/useStopwatch";
import { useTimer } from "@/app/hooks/useTimer";
import { PauseIcon, PlayIcon, RedoIcon, SaveAllIcon } from "lucide-react";

interface UnifiedTimerProps {
  mode: "focus" | "pomodoro";
  onComplete: (durationSeconds: number) => void;
  subject: string;
  onSessionRestored?: (tag: string) => void;
  isGuest?: boolean;
}

export default function UnifiedTimer({
  mode,
  onComplete,
  subject,
  onSessionRestored,
  isGuest = false,
}: UnifiedTimerProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [restoredElapsed, setRestoredElapsed] = useState(0);

  const stopwatch = useStopwatch(restoredElapsed);
  const pomodoro = useTimer(25);
  const completionCalledRef = useRef(false);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (isGuest) {
      setIsInitializing(false);
      return;
    }

    const fetchAndRestoreSession = async () => {
      try {
        const response = await fetch("/api/sessions/active");
        const data = await response.json();

        if (data.activeSession) {
          const { startedAt, tag, isPaused, pausedAt } = data.activeSession;
          let elapsed: number;

          if (isPaused && pausedAt) {
            elapsed = Math.floor(
              (new Date(pausedAt).getTime() - new Date(startedAt).getTime()) /
                1000
            );
          } else {
            elapsed = Math.floor(
              (Date.now() - new Date(startedAt).getTime()) / 1000
            );
          }

          setRestoredElapsed(elapsed);
          setSessionActive(true);
          hasRestoredRef.current = true;

          if (onSessionRestored) {
            onSessionRestored(tag);
          }

          if (!isPaused) {
            setTimeout(() => {
              stopwatch.startTimer();
            }, 100);
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchAndRestoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isGuest) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (sessionActive) {
        e.preventDefault();
        e.returnValue = "";
        const blob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/sessions/stop", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionActive, isGuest]);

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
    if (isGuest) return;
    try {
      await fetch("/api/sessions/pause", { method: "POST" });
    } catch (error) {
      console.error("Failed to pause session:", error);
    }
  };

  const handleResume = async () => {
    startTimer();
    if (isGuest) return;
    try {
      await fetch("/api/sessions/resume", { method: "POST" });
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

    if (!isGuest) {
      try {
        await fetch("/api/sessions/stop", { method: "POST" });
      } catch (error) {
        console.error("Failed to stop session:", error);
      }
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
    if (isGuest) return;
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

  if (isInitializing) {
    return (
      <div className="bg-krakedblue/40 w-fit max-w-lg p-2 text-center ">
        <p className="text-gray-400">Loading session...</p>
      </div>
    );
  }
  const renderButtons = () => (
    <>
      {!isRunning ? (
        <button
          onClick={isInitialState ? handleStart : handleResume}
          className="bg-[#40c057] hover:bg-[#40c057]/80 border-2 flex items-center justify-center gap-2 border-krakedlight text-white p-3 md:px-4 md:py-4 font-semibold text-lg transition-transform active:scale-95  shadow-lg"
          title="Start"
        >
          <PlayIcon className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline">
            {isInitialState ? "Start" : "Resume"}
          </span>
        </button>
      ) : (
        <button
          onClick={handlePause}
          className="bg-yellow-600 hover:bg-yellow-700 border-2 flex items-center justify-center gap-2 border-krakedlight text-white p-3 md:px-4 md:py-4 font-semibold text-lg transition-transform active:scale-95 shadow-lg"
          title="Pause"
        >
          <PauseIcon className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline">Pause</span>
        </button>
      )}

      <button
        onClick={handleStop}
        disabled={
          (mode === "focus" && stopwatch.elapsedSeconds === 0) ||
          (mode === "pomodoro" &&
            pomodoro.timeLeft === pomodoro.initialDuration)
        }
        className="bg-blue-600 hover:bg-blue-700 border-2 flex items-center justify-center gap-2 border-krakedlight text-white p-3 md:px-4 md:py-4 font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-lg"
        title="Stop & Save"
      >
        <SaveAllIcon className="w-6 h-6 md:w-5 md:h-5" />
        <span className="hidden md:inline">
          {isGuest ? "Stop" : "Stop & Save"}
        </span>
      </button>

      <button
        onClick={resetTimer}
        className="bg-gray-600 hover:bg-gray-700 border-2 border-krakedlight flex items-center justify-center gap-2 text-white p-3 md:px-4 md:py-4 font-semibold text-lg transition-transform active:scale-95 shadow-lg"
        title="Reset"
      >
        <RedoIcon className="w-6 h-6 md:w-5 md:h-5" />
        <span className="hidden md:inline">Reset</span>
      </button>
    </>
  );

  return (
    <div className="bg-krakedblue/40 w-full max-w-lg p-6 md:p-8 transition-all duration-500 ease-in-out rounded-xl flex flex-col justify-between min-h-[350px] md:min-h-0 md:block relative overflow-hidden">
      {/* --- Mobile Header (Corners) --- */}
      <div className="flex md:hidden justify-between items-start mb-4 z-10">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Study Timer
        </h2>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
          {mode === "focus" ? "Focus Mode" : "Pomodoro"}
        </span>
      </div>

      {/* --- Timer Display (Center) --- */}
      <div className="flex-1 flex items-center justify-center z-10">
        <h1 className="text-8xl font-bold text-white tracking-wider tabular-nums drop-shadow-2xl md:pb-8">
          {formattedTime}
        </h1>
      </div>

      {/* --- Desktop Subject (Centered Below Timer) --- */}
      {!isGuest && (
        <p className="hidden md:block text-gray-300 mb-4 text-center mt-4">
          Subject: {subject || "—"}
        </p>
      )}

      {/* --- Bottom Section --- */}
      <div className="flex items-end justify-between md:justify-center w-full z-10 mt-auto md:mt-0">
        {/* Controls (Left on Mobile, Center on Desktop) */}
        <div className="flex gap-3 md:gap-4">{renderButtons()}</div>

        {/* Mobile Subject (Right Corner) */}
        {!isGuest && (
          <div className="block md:hidden text-right max-w-[140px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
              Studying
            </p>
            <p className="text-white text-md font-bold truncate leading-tight">
              {subject || "No Subject"}
            </p>
          </div>
        )}
      </div>

      {mode === "focus" && (
        <p className="hidden md:block text-gray-400 mt-4 text-center text-sm">
          {stopwatch.elapsedSeconds} seconds elapsed
        </p>
      )}
    </div>
  );
}
