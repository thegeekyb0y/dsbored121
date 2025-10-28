"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

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
  };

  const resetTimer = () => {
    setElapsedSeconds(0);
    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
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
