"use client";

import { useEffect, useState } from "react";

interface LiveTimerProps {
  startedAt: string;
  completedToday: number;
  className?: string;
}

export default function LiveTimer({
  startedAt,
  completedToday,
  className = "",
}: LiveTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      const currentSessionSeconds = Math.floor((now - startTime) / 1000);
      const totalSeconds = completedToday + currentSessionSeconds;
      setElapsed(totalSeconds);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startedAt, completedToday]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")} : ${minutes
      .toString()
      .padStart(2, "0")} : ${secs.toString().padStart(2, "0")}`;
  };

  return (
    <span className={`font-mono ${className}`}>{formatTime(elapsed)}</span>
  );
}
