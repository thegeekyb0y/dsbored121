"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, X } from "lucide-react";

const DEFAULT_SUBJECTS = [
  "Computer Science",
  "Mathematics",
  "Engineering",
  "Frontend",
  "Backend",
  "DSA",
  "No Subjects",
];

interface SubjectSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SubjectSelect({ value, onChange }: SubjectSelectProps) {
  const { data: session } = useSession();
  const isGuest = !session?.user;

  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch user's custom subjects on mount
  useEffect(() => {
    if (!isGuest) {
      fetchCustomSubjects();
    }
  }, [isGuest]);

  const fetchCustomSubjects = async () => {
    try {
      const response = await fetch("/api/user/subjects");
      if (response.ok) {
        const data = await response.json();
        setCustomSubjects(data.customSubjects || []);
      }
    } catch (err) {
      console.error("Failed to fetch custom subjects:", err);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      setError("Subject name cannot be empty");
      return;
    }

    if (newSubject.trim().length > 50) {
      setError("Subject name too long (max 50 characters)");
      return;
    }

    // Check if subject already exists in custom or default subjects
    const trimmedSubject = newSubject.trim();
    if (
      DEFAULT_SUBJECTS.includes(trimmedSubject) ||
      customSubjects.includes(trimmedSubject)
    ) {
      setError("This subject already exists");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: trimmedSubject }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add subject");
        return;
      }

      setCustomSubjects(data.customSubjects);
      onChange(trimmedSubject);
      setNewSubject("");
      setShowAddNew(false);
    } catch (err) {
      setError("Failed to add subject");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subject: string) => {
    if (!confirm(`Delete "${subject}" from your subjects?`)) return;

    try {
      const response = await fetch("/api/user/subjects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomSubjects(data.customSubjects);
        // Clear selection if deleted subject was selected
        if (value === subject) {
          onChange("");
        }
      }
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        What are you studying?
      </label>

      {/* Subject Dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md outline-none transition-all"
      >
        <option value="">Select subject...</option>

        {/* Default Subjects */}
        <optgroup label="Default Subjects">
          {DEFAULT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </optgroup>

        {/* Custom Subjects (Only for logged-in users) */}
        {!isGuest && customSubjects.length > 0 && (
          <optgroup label="My Custom Subjects">
            {customSubjects.map((subject) => (
              <option key={subject} value={subject}>
                ⭐ {subject}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {/* Add New Subject Section (Only for logged-in users) */}
      {!isGuest && (
        <>
          {!showAddNew ? (
            <button
              onClick={() => setShowAddNew(true)}
              className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Custom Subject
            </button>
          ) : (
            <div className="mt-3 p-4 bg-gray-800 border border-gray-600 rounded-lg animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => {
                    setNewSubject(e.target.value);
                    setError(""); // Clear error on input
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSubject();
                    } else if (e.key === "Escape") {
                      setShowAddNew(false);
                      setNewSubject("");
                      setError("");
                    }
                  }}
                  placeholder="e.g., Quantum Physics"
                  maxLength={50}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={handleAddSubject}
                  disabled={loading || !newSubject.trim()}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowAddNew(false);
                    setNewSubject("");
                    setError("");
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-md transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  {error}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 Custom subjects are saved to your account permanently
              </p>
            </div>
          )}

          {/* Custom Subjects Management */}
          {customSubjects.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2 font-semibold">
                Your Custom Subjects ({customSubjects.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {customSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="group flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-full text-sm text-blue-300 hover:bg-blue-500/30 transition-colors"
                  >
                    <span>⭐ {subject}</span>
                    <button
                      onClick={() => handleDeleteSubject(subject)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                      title={`Delete "${subject}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Hover over a subject to delete it
              </p>
            </div>
          )}
        </>
      )}

      {/* Guest Notice */}
      {isGuest && (
        <p className="text-xs text-gray-500 mt-2">
          🔒 Sign in to create custom subjects
        </p>
      )}
    </div>
  );
}
