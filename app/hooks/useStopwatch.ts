"use client";

import { useEffect, useState, useRef } from "react";

interface StopwatchState {
  elapsedSeconds: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formattedTime: string;
}

export default function useStopwatch(
  initialSeconds: number = 0
): StopwatchState {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(initialSeconds);

  // --- FIX START: Sync internal state when initialSeconds changes (e.g. after restore) ---
  useEffect(() => {
    setElapsedSeconds(initialSeconds);
    pausedTimeRef.current = initialSeconds;
  }, [initialSeconds]);
  // --- FIX END ---

  useEffect(() => {
    // Set initial start time ref on mount
    startTimeRef.current = Date.now() - initialSeconds * 1000;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunning) {
      // When starting, calculate the "start time" by subtracting the accumulated elapsed time from "now"
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;

      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    pausedTimeRef.current = elapsedSeconds;
  };

  const resetTimer = () => {
    setElapsedSeconds(0);
    setIsRunning(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(remainingSeconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return {
    elapsedSeconds,
    isRunning,
    pauseTimer,
    startTimer,
    resetTimer,
    formattedTime: formatTime(elapsedSeconds),
  };
}
