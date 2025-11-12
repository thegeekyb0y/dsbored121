"use client";

import useStopwatch from "@/app/hooks/useStopwatch";

export default function TestStopwatch() {
  const {
    formattedTime,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    elapsedSeconds,
  } = useStopwatch();

  return (
    <div className="p-8 bg-krakedgreen border-2 border-krakedlight">
      <h1 className="text-6xl font-bold m-0 leading-tight">{formattedTime}</h1>
      <p className="m-0 mt-2">Elapsed: {elapsedSeconds} seconds</p>

      <div className="flex gap-2 mt-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="bg-green-500 px-4 py-2 m-0 inline-flex items-center"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="bg-yellow-500 px-4 py-2 m-0 inline-flex items-center"
          >
            Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="bg-red-500 px-4 py-2 m-0 inline-flex items-center"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
