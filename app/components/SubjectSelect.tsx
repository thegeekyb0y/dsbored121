"use client";

const SUBJECTS = [
  "Web Development",
  "DSA",
  "System Design",
  "Mathematics",
  "Web3",
  "Engineering",
  "Other",
];

interface SubjectSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SubjectSelect({ value, onChange }: SubjectSelectProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        What are you studying?
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select subject...</option>
        {SUBJECTS.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </div>
  );
}
