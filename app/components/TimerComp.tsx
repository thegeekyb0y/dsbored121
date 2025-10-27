"use client";
import React from "react";
import { useTimer } from "../hooks/useTimer";

export default function TimerComp() {
  const { formattedTime, isRunning, startTimer, pauseTimer, resetTimer } =
    useTimer();
  return (
    <div>
      <div className="bg-krakedpurple pt-8 mt-20 mx-auto flex">
        <div className="text-8xl text-krakedlight ">{formattedTime}</div>

        {!isRunning ? (
          <button
            className=" m-2 bg-krakedyellow cursor-pointer"
            onClick={startTimer}
          >
            Start
          </button>
        ) : (
          <button
            className=" m-2 bg-krakedyellow cursor-pointer"
            onClick={pauseTimer}
          >
            Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="m-2 bg-krakedyellow cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
