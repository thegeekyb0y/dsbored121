"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import ModeSelector from "../components/ModeSelector";
import SubjectSelect from "../components/SubjectSelect";
import UnifiedTimer from "../components/UnifiedTimer";

export default function TimerPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<"focus" | "pomodoro">("focus");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);

  const handleStartClick = () => {
    setShowSubjectSelect(true);
  };

  const handleSubjectConfirm = () => {
    if (!subject) {
      alert("Please select a subject");
      return;
    }
    setShowSubjectSelect(false);
    setTimerActive(true);
  };

  const handleComplete = async (durationSeconds: number) => {
    if (!session?.user) {
      alert("Great work! Login to track your progress.");
      resetState();
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: durationSeconds,
          tag: subject,
        }),
      });

      if (response.ok) {
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        alert(`Session saved! ✅\nYou studied for ${minutes}m ${seconds}s`);
      } else {
        alert("Failed to save session. Please try again.");
      }
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Error saving session. Please try again.");
    } finally {
      setSaving(false);
      resetState();
    }
  };

  const resetState = () => {
    setTimerActive(false);
    setShowSubjectSelect(false);
    setSubject("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-krakedblue cursor-grab border-4 border-krakedlight rounded-xl">
      <h1 className="text-4xl font-bold text-center mb-8">Study Timer</h1>

      <div className="flex flex-col items-center">
        {/* Mode Selector - Always visible */}
        <ModeSelector
          mode={mode}
          onModeChange={(newMode) => {
            if (!timerActive) {
              setMode(newMode);
            }
          }}
        />

        {/* Subject Selection Modal/Dropdown */}
        {showSubjectSelect && (
          <div className="w-full max-w-md mb-6 p-6 bg-gray-800 rounded-lg">
            <SubjectSelect value={subject} onChange={setSubject} />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubjectConfirm}
                disabled={!subject}
                className="flex-1 bg-krakedblue2 hover:bg-krakedblue2/50 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowSubjectSelect(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Timer or Start Button */}
        {!timerActive ? (
          <button
            onClick={handleStartClick}
            className="bg-green-700 hover:bg-green-800 border-2 border-krakedlight text-white px-12 py-6 rounded-lg font-bold text-2xl"
          >
            Start Study Session
          </button>
        ) : (
          <>
            {/* Show selected subject */}
            <div className="mb-4 text-center">
              <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {subject}
              </span>
            </div>

            {/* Unified Timer */}
            <UnifiedTimer mode={mode} onComplete={handleComplete} />

            {saving && (
              <p className="text-center mt-4 text-gray-400">
                Saving session...
              </p>
            )}
          </>
        )}
      </div>

      {!session && (
        <div className="mt-8 text-center text-gray-400">
          <p>💡 Login to track your study sessions and see stats!</p>
        </div>
      )}
    </div>
  );
}
