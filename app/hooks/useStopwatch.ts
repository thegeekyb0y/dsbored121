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

export default function useStopwatch(): StopwatchState {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
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
    pausedTimeRef.current = elapsedSeconds; // Remember where we paused
  };

  const resetTimer = () => {
    setElapsedSeconds(0);
    setIsRunning(false);
    startTimeRef.current = 0;
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
