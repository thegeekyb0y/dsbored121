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

  // --- GUEST LAYOUT ---
  if (status === "unauthenticated") {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 bg-linear-to-b from-krakedblue/40 to-krakedbg/10 py-10 border border-krakedlight/20">
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
    <div className="w-full flex flex-col items-center bg-linear-to-b from-krakedblue/30 to-krakedblue/0 py-8 border border-krakedlight/20">
      <h1 className="text-4xl font-bold text-center mb-8">Study Timer</h1>

      <div className="flex flex-col items-center w-full max-w-3xl">
        <ModeSelector
          mode={mode}
          onModeChange={(newMode) => !timerActive && setMode(newMode)}
        />

        {showSubjectSelect && (
          <div className="w-full max-w-sm mb-6 p-6 bg-gray-800 shadow-xl z-20">
            <SubjectSelect value={subject} onChange={setSubject} />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubjectConfirm}
                disabled={!subject}
                className="flex-1 bg-krakedblue2 hover:bg-krakedblue2/80 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={() => setShowSubjectSelect(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!timerActive ? (
          <button
            onClick={handleStartClick}
            className="bg-green-700 hover:bg-green-800 border-2 flex items-center gap-4 border-krakedlight text-white px-8 py-6 font-bold text-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <PlayIcon className="w-8 h-8" />
            Start Study Session
          </button>
        ) : (
          <UnifiedTimer
            mode={mode}
            onComplete={handleComplete}
            subject={subject}
            onSessionRestored={handleSessionRestored}
          />
        )}
      </div>
    </div>
  );
}
