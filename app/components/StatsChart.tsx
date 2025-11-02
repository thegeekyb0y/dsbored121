"use client";

interface StatItem {
  tag: string;
  minutes: number;
  count: number;
}

interface StatsChartProps {
  data: StatItem[];
}

export default function StatsChart({ data }: StatsChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No data recorded yet. Start studying to see your progress!
      </div>
    );
  }

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        This Week by Subject
      </h3>

      {data.map((item) => {
        const widthPercent = (item.minutes / maxMinutes) * 100;

        return (
          <div key={item.tag} className="space-y-2">
            {/* Label */}
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.tag}</span>
              <span className="text-gray-600">
                {item.minutes} min · {item.count} sessions
              </span>
            </div>

            {/* Bar */}
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
