import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/lib/errors";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { logger } from "@/app/lib/logger";
import { cache, cacheKeys } from "@/app/lib/cache";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("GET", "/api/sessions/stats", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const cacheKey = cacheKeys.userStats(user.id);
    const cachedStats = await cache.get(cacheKey);

    if (cachedStats) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", "/api/sessions/stats", 200, elapsed);
      return NextResponse.json(cachedStats, {
        headers: { ...headers, "X-Cache": "HIT" },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [todayStats, weekStats, weekBySubject, weekSessions, monthSessions] =
      await Promise.all([
        prisma.studySession.aggregate({
          where: { userId: user.id, createdAt: { gte: today } },
          _sum: { duration: true },
          _count: true,
        }),

        prisma.studySession.aggregate({
          where: { userId: user.id, createdAt: { gte: weekAgo } },
          _sum: { duration: true },
          _count: true,
        }),
        prisma.studySession.groupBy({
          by: ["tag"],
          where: { userId: user.id, createdAt: { gte: weekAgo } },
          _sum: { duration: true },
          _count: true,
          orderBy: {
            _sum: {
              duration: "desc",
            },
          },
        }),

        prisma.studySession.findMany({
          where: { userId: user.id, createdAt: { gte: weekAgo } },
          select: { duration: true, createdAt: true },
        }),

        prisma.studySession.findMany({
          where: { userId: user.id, createdAt: { gte: monthAgo } },
          select: { duration: true, createdAt: true, tag: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

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

    // Build month activity map (last 30 days)
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
    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      if ((monthActivityMap.get(dateKey) || 0) > 0) {
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

      if ((monthActivityMap.get(dateKey) || 0) > 0) {
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

    const statsData = {
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
      dailyData,
      monthActivity,
      insights: {
        currentStreak,
        longestStreak,
        longestStreakDate: longestStreakEnd
          ? new Date(longestStreakEnd).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })
          : "",
        mostActiveDay,
        mostActiveTime: maxHourActivity > 0 ? formatHour(mostActiveHour) : "",
        mostStudiedSubject,
      },
    };

    await cache.set(cacheKey, statsData, 300);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", "/api/sessions/stats", 200, elapsed);

    return NextResponse.json(statsData, {
      headers: { ...headers, "X-Cache": "MISS" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
