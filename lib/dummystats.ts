export interface StatsData {
  today: { totalMinutes: number; sessionCount: number };
  week: { totalMinutes: number; sessionCount: number };
  bySubject: Array<{ tag: string; minutes: number; count: number }>;
  dailyData: Array<{ date: string; day: string; minutes: number }>;
  monthActivity: Array<{ date: string; minutes: number }>;
  insights: {
    currentStreak: number;
    longestStreak: number;
    longestStreakDate: string;
    mostActiveDay: string;
    mostActiveTime: string;
    mostStudiedSubject: string;
  };
}

export const DUMMY_STATS: StatsData = {
  today: { totalMinutes: 120, sessionCount: 4 },
  week: { totalMinutes: 840, sessionCount: 21 },
  bySubject: [
    { tag: "React", minutes: 300, count: 5 },
    { tag: "System Design", minutes: 240, count: 4 },
    { tag: "Algorithms", minutes: 300, count: 12 },
  ],
  dailyData: [
    { date: "2024-01-01", day: "Mon", minutes: 45 },
    { date: "2024-01-02", day: "Tue", minutes: 120 },
    { date: "2024-01-03", day: "Wed", minutes: 90 },
    { date: "2024-01-04", day: "Thu", minutes: 60 },
    { date: "2024-01-05", day: "Fri", minutes: 180 },
    { date: "2024-01-06", day: "Sat", minutes: 20 },
    { date: "2024-01-07", day: "Sun", minutes: 0 },
  ],
  monthActivity: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString(),
    minutes: Math.random() > 0.3 ? Math.floor(Math.random() * 180) : 0,
  })),
  insights: {
    currentStreak: 5,
    longestStreak: 12,
    longestStreakDate: "October 24",
    mostActiveDay: "Wednesday",
    mostActiveTime: "9:00 PM - 12:00 AM",
    mostStudiedSubject: "Web Development",
  },
};
