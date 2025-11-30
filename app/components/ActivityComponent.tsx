"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DayActivity {
  date: string;
  minutes: number;
}

interface ActivityInsights {
  currentStreak: number;
  longestStreak: number;
  longestStreakDate: string;
  mostActiveDay: string;
  mostActiveTime: string;
  mostStudiedSubject: string;
}

interface ActivityHeatmapProps {
  data: DayActivity[];
  insights: ActivityInsights;
}

export default function ActivityHeatmap({
  data,
  insights,
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Create a map for quick lookup
  const activityMap = new Map(data.map((d) => [d.date, d.minutes]));

  // Get intensity color based on minutes studied
  const getColor = (minutes: number): string => {
    if (minutes === 0) return "#0a1a2f";
    if (minutes < 60) return "#123a6f";
    if (minutes < 120) return "#1f5fbf";
    if (minutes < 180) return "#4a88ff";
    if (minutes < 240) return "#aecdff";
    return "#dbe9ff";
  };

  const generateDays = () => {
    const days: { date: string; day: number; month: string }[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split("T")[0],
        day: date.getDay(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return days;
  };

  const days = generateDays();

  const weeks: (typeof days)[] = [];
  let currentWeek: typeof days = [];

  days.forEach((day, index) => {
    if (index === 0 && day.day !== 0) {
      for (let i = 0; i < day.day; i++) {
        currentWeek.push({ date: "", day: i, month: "" });
      }
    }

    currentWeek.push(day);

    if (day.day === 6 || index === days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthMarkers: { month: string; weekIndex: number }[] = [];
  let lastMonth = "";
  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((d) => d.date !== "");
    if (firstDay && firstDay.month !== lastMonth) {
      monthMarkers.push({ month: firstDay.month, weekIndex });
      lastMonth = firstDay.month;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Activity Timeline */}
      <Card
        className="bg-krakedblue/30 border-none rounded-none 
      shadow-lg overflow-hidden"
      >
        <CardHeader>
          <CardTitle className="text-white font-semibold flex items-center gap-2 text-base sm:text-lg">
            Activity Timeline
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Detailed view of study activity
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="relative min-w-[600px]">
            {/* Month labels */}
            <div className="flex mb-3 ml-12 gap-4">
              {monthMarkers.map((marker, idx) => (
                <div
                  key={marker.month + idx}
                  className="text-xs sm:text-sm text-gray-400 font-medium"
                >
                  {marker.month}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col gap-1.5 mr-3 text-xs text-gray-400">
                {dayLabels.map((label) => (
                  <div key={label} className="h-7 leading-7 w-10 text-left">
                    {label}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-1.5">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1.5">
                    {week.map((day, dayIndex) => {
                      if (!day.date) {
                        return (
                          <div
                            key={dayIndex}
                            className="w-7 h-7 rounded-md bg-transparent"
                          />
                        );
                      }

                      const minutes = activityMap.get(day.date) || 0;

                      return (
                        <div
                          key={day.date}
                          className="w-7 h-7 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-orange-400/50 hover:scale-110"
                          style={{
                            backgroundColor: getColor(minutes),
                          }}
                          onMouseEnter={(e) => {
                            setHoveredDay({ date: day.date, minutes });
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseMove={(e) =>
                            setMousePosition({ x: e.clientX, y: e.clientY })
                          }
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 sm:gap-3 mt-6 text-xs sm:text-sm text-gray-400 flex-wrap">
              <span className="whitespace-nowrap">Less activity</span>

              <div className="flex gap-1.5">
                <div
                  className="w-5 h-5 rounded-md"
                  style={{ backgroundColor: "#0a1a2f" }} // 0 minutes (darkest)
                />
                <div
                  className="w-5 h-5 rounded-md"
                  style={{ backgroundColor: "#123a6f" }} // <60
                />
                <div
                  className="w-5 h-5 rounded-md"
                  style={{ backgroundColor: "#1f5fbf" }} // <120
                />
                <div
                  className="w-5 h-5 rounded-md"
                  style={{ backgroundColor: "#4a88ff" }} // <180
                />
                <div
                  className="w-5 h-5 rounded-md"
                  style={{ backgroundColor: "#aecdff" }} // <240
                />
                <div
                  className="w-5 h-5 rounded-md"
                  style={{ backgroundColor: "#dbe9ff" }} // max (lightest)
                />
              </div>

              <span className="whitespace-nowrap">More activity</span>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <div
              className="fixed z-50 bg-krakedblue text-white px-4 py-3 rounded-lg text-sm pointer-events-none shadow-xl border border-gray-600"
              style={{
                left: mousePosition.x + 10,
                top: mousePosition.y + 10,
              }}
            >
              <div className="font-semibold">
                {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="text-gray-300 mt-1">
                {hoveredDay.minutes === 0
                  ? "No activity"
                  : `${Math.floor(hoveredDay.minutes / 60)}h ${
                      hoveredDay.minutes % 60
                    }m studied`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Insights */}
      <Card className="bg-krakedblue/50 rounded-none border-none col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white font-semibold flex items-center gap-2">
            Activity Insights
          </CardTitle>
          <CardDescription className="text-gray-400">
            Patterns and trends in your studying
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Most Active Time */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🕐</div>
              <div>
                <div className="text-sm text-gray-400">Most Active Time</div>
                <div className="text-lg font-semibold text-white">
                  {insights.mostActiveTime || "Not enough data"}
                </div>
              </div>
            </div>
          </div>

          {/* Most Active Day */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <div className="text-sm text-gray-400">Most Active Day</div>
                <div className="text-xl font-semibold text-white ">
                  {insights.mostActiveDay || "Not enough data"}
                </div>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Current Streak</div>
                <div className="text-xl font-bold text-white">
                  {insights.currentStreak} days
                </div>
                {insights.currentStreak > 0 && (
                  <div className="text-xs text-orange-400">
                    Keep the momentum going!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔥</div>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Longest Streak</div>
                <div className="text-xl font-bold text-white">
                  {insights.longestStreak} days
                </div>
                {insights.longestStreakDate && (
                  <div className="text-sm text-gray-400 ">
                    Achieved on {insights.longestStreakDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Most Studied Subject */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📚</div>
              <div>
                <div className="text-sm text-gray-400">
                  Most Studied Subject
                </div>
                <div className="text-lg font-semibold text-white">
                  {insights.mostStudiedSubject || "Not enough data"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
