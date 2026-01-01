import { authOptions } from "@/app/lib/auth";
import { cache } from "@/app/lib/cache";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/lib/errors";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  const startTime = Date.now();

  try {
    const params = await props.params;
    const { code } = params;

    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.realtime
    );
    logger.apiRequest("GET", `/api/rooms/${code}/active`, identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user.email) {
      throw new UnauthorizedError();
    }

    const cacheKey = `room-active:${code}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", `/api/rooms/${code}/active`, 200, elapsed);
      return NextResponse.json(cached, {
        headers: { ...headers, "X-Cache": "HIT" },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const room = await prisma.room.findUnique({
      where: { code },
    });

    if (!room) {
      throw new NotFoundError("Room");
    }

    const members = await prisma.roomMember.findMany({
      where: { roomId: room.id },
      select: { userId: true },
    });

    const userIds = members.map((m) => m.userId);

    if (userIds.length === 0) {
      return NextResponse.json(
        { activeSessions: [], studyDurationToday: {} },
        { headers }
      );
    }

    const [completedTodayByUser, activeSessions] = await Promise.all([
      prisma.studySession.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          createdAt: { gte: today },
        },
        _sum: { duration: true },
      }),
      prisma.activeSession.findMany({
        where: { userId: { in: userIds } },
        include: {
          user: {
            select: { id: true, name: true, image: true, avatarId: true },
          },
        },
      }),
    ]);

    const studyDurationToday: Record<string, number> = {};
    completedTodayByUser.forEach((item) => {
      studyDurationToday[item.userId] = item._sum.duration || 0;
    });

    const activeSessionsWithCompleted = activeSessions.map((activeSession) => ({
      ...activeSession,
      completedToday: studyDurationToday[activeSession.userId] || 0,
    }));

    const result = {
      activeSessions: activeSessionsWithCompleted,
      studyDurationToday,
    };

    await cache.set(cacheKey, result, 10);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", `/api/rooms/${code}/active`, 200, elapsed);

    return NextResponse.json(result, {
      headers: { ...headers, "X-Cache": "MISS" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
