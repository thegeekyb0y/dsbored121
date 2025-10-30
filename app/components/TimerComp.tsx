"use client";
import React, { useEffect, useState } from "react";
import { useTimer } from "../hooks/useTimer";

interface TimerCompProps {
  onComplete?: (seconds: number) => void;
}

export default function TimerComp({ onComplete }: TimerCompProps) {
  const [duration, setDuration] = useState(25);
  const {
    formattedTime,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    timeLeft,
    initialDuration,
  } = useTimer(duration);

  useEffect(() => {
    if (timeLeft === 0 && onComplete) {
      onComplete(initialDuration);
    }
  }, [timeLeft, onComplete, initialDuration]);

  return (
    <div>
      <div className="bg-krakedgreen border-2 border-krakedlight pt-4 mt-12 mx-12 px-4 flex flex-col gap-2 items-start justify-center rounded-[10px]">
        Pomodro
        <div className="text-8xl text-krakedlight ">{formattedTime}</div>
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              className="p-2 m-2 rounded-md bg-krakedyellow cursor-pointer"
              onClick={startTimer}
            >
              Start
            </button>
          ) : (
            <button
              className="p-2 m-2 rounded-md bg-krakedyellow cursor-pointer"
              onClick={pauseTimer}
            >
              Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="p-2 m-2 rounded-md bg-krakedyellow cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
