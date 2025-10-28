"use client";
import React from "react";
import { useTimer } from "../hooks/useTimer";

export default function TimerComp() {
  const { formattedTime, isRunning, startTimer, pauseTimer, resetTimer } =
    useTimer();
  return (
    <div>
      <div className="bg-krakedpurple pt-4 mt-12 mx-12 px-4 flex flex-col gap-2 items-start justify-center rounded-[10px]">
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
