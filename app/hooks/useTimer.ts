"use client";

import { useEffect, useState, useRef } from "react";

interface PomodroState {
  timeLeft: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formattedTime: string;
  initialDuration: number;
}

export function useTimer(
  durationMinutes: number = 25,
  onComplete?: (seconds: number) => void,
): PomodroState {
  const INITIAL_TIME = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(INITIAL_TIME);
  const completedRef = useRef(false);

  useEffect(() => {
    if (isRunning) {
      // Calculate when timer should end
      endTimeRef.current = Date.now() + pausedTimeRef.current * 1000;

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.ceil((endTimeRef.current - now) / 1000),
        );

        setTimeLeft(remaining);

        if (remaining === 0) {
          setIsRunning(false);
          if (onComplete && !completedRef.current) {
            completedRef.current = true;
            onComplete(INITIAL_TIME);
          }
        }
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isRunning, onComplete, INITIAL_TIME]);

  const startTimer = () => {
    completedRef.current = false;
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    pausedTimeRef.current = timeLeft;
  };

  const resetTimer = () => {
    setTimeLeft(INITIAL_TIME);
    setIsRunning(false);
    pausedTimeRef.current = INITIAL_TIME;
    completedRef.current = false;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  return {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formattedTime: formatTime(timeLeft),
    initialDuration: INITIAL_TIME,
  };
}
