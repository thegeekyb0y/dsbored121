"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import ModeSelector from "../components/ModeSelector";
import SubjectSelect from "../components/SubjectSelect";
import UnifiedTimer from "../components/UnifiedTimer";
import { PlayIcon } from "lucide-react";

export default function TimerPage() {
  const { data: session, status } = useSession();
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

  const handleComplete = () => {
    resetState();
  };

  // Handle when a session is restored from the database (Logged in only)
  const handleSessionRestored = (restoredTag: string) => {
    setSubject(restoredTag);
    setTimerActive(true);
    setShowSubjectSelect(false);
    console.log(`Session restored with subject: ${restoredTag}`);
  };

  const resetState = () => {
    setTimerActive(false);
    setShowSubjectSelect(false);
    setSubject("");
  };

  // --- 🚀 DEFAULT LAYOUT (Guest Mode) ---
  if (status === "unauthenticated") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center border-t-3 border-krakedlight/45 min-h-[70vh] gap-4 bg-linear-to-b from-krakedblue/40 to-krakedbg/0 ">
        <div className="text-4xl font-bold pt-8 pb-4 self-center">
          {" "}
          Study Timer
        </div>
        <ModeSelector mode={mode} onModeChange={setMode} />

        <UnifiedTimer
          mode={mode}
          onComplete={() => {}}
          subject="Guest Session"
          isGuest={true}
        />
      </div>
    );
  }

  // --- 🔒 LOGGED IN LAYOUT (Unchanged) ---
  return (
    <div className="px-4 py-8 w-full  cursor-grab border-t-3 border-krakedlight/45 bg-linear-to-b from-krakedblue/30 to-krakedblue/0">
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
          <div className="w-full max-w-sm mb-6 p-6 bg-gray-800">
            <SubjectSelect value={subject} onChange={setSubject} />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubjectConfirm}
                disabled={!subject}
                className="flex-1 bg-krakedblue2 hover:bg-krakedblue2/50 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 font-semibold"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowSubjectSelect(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 font-semibold"
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
            className="bg-green-700 hover:bg-green-800 border-2 flex items-center gap-4 border-krakedlight text-white px-8 py-6 font-bold text-2xl"
          >
            <PlayIcon className="w-6 h-6" />
            Start Study Session
          </button>
        ) : (
          <>
            {/* Unified Timer with restoration callback */}
            <UnifiedTimer
              mode={mode}
              onComplete={handleComplete}
              subject={subject}
              onSessionRestored={handleSessionRestored}
            />

            {saving && (
              <p className="text-center mt-4 text-gray-400">
                Saving session...
              </p>
            )}
          </>
        )}
      </div>

      {!session && status !== "loading" && (
        <div className="mt-8 text-center text-gray-400">
          <p>💡 Login to track your study sessions and see stats!</p>
        </div>
      )}
    </div>
  );
}
