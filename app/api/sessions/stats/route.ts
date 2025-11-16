import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Today's stats
    const todayStats = await prisma.studySession.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: today },
      },
      _sum: { duration: true },
      _count: true,
    });

    // This Week stats
    const weekStats = await prisma.studySession.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
      _sum: { duration: true },
      _count: true,
    });

    // Week subject breakdown
    const weekBySubject = await prisma.studySession.groupBy({
      by: ["tag"],
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
      _sum: { duration: true },
      _count: true,
    });

    // Get daily data for the week line chart
    const weekSessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
      select: {
        duration: true,
        createdAt: true,
      },
    });

    const dailyMap = new Map<string, number>();
    weekSessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + session.duration);
    });

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      dailyData.push({
        date: dateKey,
        day: dayName,
        minutes: Math.floor((dailyMap.get(dateKey) || 0) / 60),
      });
    }

    // Get month activity for heatmap
    const monthSessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: monthAgo },
      },
      select: {
        duration: true,
        createdAt: true,
        tag: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const monthActivityMap = new Map<string, number>();
    const hourActivityMap = new Map<number, number>();
    const dayActivityMap = new Map<string, number>();
    const subjectMap = new Map<string, number>();

    monthSessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      const hour = session.createdAt.getHours();
      const dayName = session.createdAt.toLocaleDateString("en-US", {
        weekday: "long",
      });

      monthActivityMap.set(
        dateKey,
        (monthActivityMap.get(dateKey) || 0) + session.duration
      );
      hourActivityMap.set(
        hour,
        (hourActivityMap.get(hour) || 0) + session.duration
      );
      dayActivityMap.set(
        dayName,
        (dayActivityMap.get(dayName) || 0) + session.duration
      );
      subjectMap.set(
        session.tag,
        (subjectMap.get(session.tag) || 0) + session.duration
      );
    });

    const monthActivity = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      monthActivity.push({
        date: dateKey,
        minutes: Math.floor((monthActivityMap.get(dateKey) || 0) / 60),
      });
    }

    // Calculate insights
    // Current streak
    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      if (monthActivityMap.get(dateKey) || 0 > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Longest streak
    let longestStreak = 0;
    let longestStreakEnd = "";
    let tempStreak = 0;
    let tempStreakEnd = "";

    for (let i = 365; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      if (monthActivityMap.get(dateKey) || 0 > 0) {
        tempStreak++;
        tempStreakEnd = dateKey;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakEnd = tempStreakEnd;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
      longestStreakEnd = tempStreakEnd;
    }

    // Most active hour
    let mostActiveHour = 0;
    let maxHourActivity = 0;
    hourActivityMap.forEach((duration, hour) => {
      if (duration > maxHourActivity) {
        maxHourActivity = duration;
        mostActiveHour = hour;
      }
    });

    const formatHour = (hour: number) => {
      const start = hour % 12 || 12;
      const end = (hour + 1) % 12 || 12;
      const startPeriod = hour < 12 ? "AM" : "PM";
      const endPeriod = hour + 1 < 12 || hour + 1 === 24 ? "AM" : "PM";
      return `${start}:00 ${startPeriod} - ${end}:00 ${endPeriod}`;
    };

    // Most active day
    let mostActiveDay = "";
    let maxDayActivity = 0;
    dayActivityMap.forEach((duration, day) => {
      if (duration > maxDayActivity) {
        maxDayActivity = duration;
        mostActiveDay = day;
      }
    });

    // Most studied subject
    let mostStudiedSubject = "";
    let maxSubjectDuration = 0;
    subjectMap.forEach((duration, subject) => {
      if (duration > maxSubjectDuration) {
        maxSubjectDuration = duration;
        mostStudiedSubject = subject;
      }
    });

    return NextResponse.json({
      today: {
        totalMinutes: Math.floor((todayStats._sum.duration || 0) / 60),
        sessionCount: todayStats._count,
      },
      week: {
        totalMinutes: Math.floor((weekStats._sum.duration || 0) / 60),
        sessionCount: weekStats._count,
      },
      bySubject: weekBySubject.map((item) => ({
        tag: item.tag,
        minutes: Math.floor((item._sum.duration || 0) / 60),
        count: item._count,
      })),
      dailyData: dailyData,
      monthActivity: monthActivity,
      insights: {
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        longestStreakDate: longestStreakEnd
          ? new Date(longestStreakEnd).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })
          : "",
        mostActiveDay: mostActiveDay,
        mostActiveTime: maxHourActivity > 0 ? formatHour(mostActiveHour) : "",
        mostStudiedSubject: mostStudiedSubject,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
