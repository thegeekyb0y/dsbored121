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
    <div className="p-8">
      <h1 className="text-6xl font-bold">{formattedTime}</h1>
      <p>Elapsed: {elapsedSeconds} seconds</p>

      {!isRunning ? (
        <button onClick={startTimer} className="bg-green-500 p-4 m-2">
          Start
        </button>
      ) : (
        <button onClick={pauseTimer} className="bg-yellow-500 p-4 m-2">
          Pause
        </button>
      )}

      <button onClick={resetTimer} className="bg-red-500 p-4 m-2">
        Reset
      </button>
    </div>
  );
}
