"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import ModeSelector from "../components/ModeSelector";
import SubjectSelect from "../components/SubjectSelect";
import UnifiedTimer from "../components/UnifiedTimer";
import { PlayIcon } from "lucide-react";

export default function TimerPage() {
  const { status } = useSession();
  const [mode, setMode] = useState<"focus" | "pomodoro">("focus");
  const [subject, setSubject] = useState("");
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
    setTimerActive(false);
    setShowSubjectSelect(false);
    setSubject("");
  };

  const handleSessionRestored = (restoredTag: string) => {
    setSubject(restoredTag);
    setTimerActive(true);
    setShowSubjectSelect(false);
  };

  // Allow mode change even if subject is selected, but not when timer is actively running
  const handleModeChange = (newMode: "focus" | "pomodoro") => {
    if (!timerActive) {
      setMode(newMode);
    } else {
      // Show confirmation dialog when timer is running
      if (confirm("Changing modes will stop your current session. Continue?")) {
        // Stop current session
        setTimerActive(false);
        setMode(newMode);
        // Keep the subject selected so user can restart easily
      }
    }
  };

  // --- GUEST LAYOUT ---
  if (status === "unauthenticated") {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 py-10 border border-krakedlight/20">
        <div className="text-4xl font-bold pt-4 pb-2">Study Timer</div>
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

  // --- AUTHENTICATED LAYOUT ---
  return (
    <div className="w-full flex flex-col items-center bg-linear-to-b from-krakedblue/30 to-krakedblue/30 py-8 border border-krakedlight/20">
      <h1 className="text-4xl font-bold text-center mb-8">Study Timer</h1>

      <div className="flex flex-col items-center w-full max-w-3xl">
        {/* Mode Selector - Always visible and functional */}
        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        {/* Subject Selection Modal */}
        {showSubjectSelect && (
          <div className="w-full max-w-sm mb-6 p-6 bg-gray-800 shadow-xl z-20 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">
              Select Subject
            </h3>
            <SubjectSelect value={subject} onChange={setSubject} />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubjectConfirm}
                disabled={!subject}
                className="flex-1 bg-krakedblue2 hover:bg-krakedblue2/80 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Start
              </button>
              <button
                onClick={() => setShowSubjectSelect(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Subject Display (when subject is selected but timer not started) */}
        {subject && !timerActive && !showSubjectSelect && (
          <div className="w-full max-w-sm mb-6 p-4 bg-krakedblue/30 border border-krakedlight/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected Subject:</p>
                <p className="text-lg font-semibold text-white">{subject}</p>
              </div>
              <button
                onClick={() => {
                  setSubject("");
                  setShowSubjectSelect(true);
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Start Button or Active Timer */}
        {!timerActive ? (
          <button
            onClick={handleStartClick}
            className="bg-green-700 hover:bg-green-800 border-2 flex items-center gap-4 border-krakedlight text-white px-8 py-6 font-bold text-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <PlayIcon className="w-8 h-8" />
            Start Study Session
          </button>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Current Mode & Subject Info */}
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-krakedblue/40 border border-krakedlight/20 rounded-full">
                <span className="text-sm text-gray-400">Mode:</span>
                <span className="text-sm font-semibold text-white capitalize">
                  {mode}
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-sm text-gray-400">Subject:</span>
                <span className="text-sm font-semibold text-green-400">
                  {subject}
                </span>
              </div>
            </div>

            {/* Timer Component */}
            <UnifiedTimer
              mode={mode}
              onComplete={handleComplete}
              subject={subject}
              onSessionRestored={handleSessionRestored}
            />

            {/* Helper Text */}
            <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
              💡 Tip: You can change modes while the timer is running, but it
              will stop your current session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
