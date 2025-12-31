import { authOptions } from "@/app/lib/auth";
import { cache } from "@/app/lib/cache";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
  validate,
} from "@/app/lib/errors";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusher";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("POST", "/api/sessions/start", identifier);
    if (!success) {
      logger.warn("Rate limit exceeded", {
        endpoint: "/api/sessions/start",
        identifier,
      });
      return createRateLimitResponse(headers);
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        avatarId: true,
      },
    });
    if (!user) {
      throw new NotFoundError("User");
    }

    const body = await request.json();
    const validatedData = validate<{ tag: string }>(body, {
      tag: {
        type: "string",
        required: true,
        min: 1,
        max: 100,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await prisma.studySession.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: today },
      },
      _sum: { duration: true },
    });

    const completedSeconds = completedToday._sum.duration || 0;

    const activeSession = await prisma.activeSession.upsert({
      where: { userId: user.id },
      create: { userId: user.id, tag: validatedData.tag },
      update: {
        startedAt: new Date(),
        tag: validatedData.tag,
        isPaused: false,
        pausedAt: null,
      },
    });

    await cache.del(`active-session: ${session.user.email}`);

    const memberships = await prisma.roomMember.findMany({
      where: { userId: user.id },
      include: { room: true },
    });

    for (const member of memberships) {
      await pusherServer.trigger(
        `room-${member.room.code}`,
        "session-started",
        {
          userId: user.id,
          userName: user.name,
          userImage: user.image,
          avatarId: user.avatarId,
          tag: validatedData.tag,
          startedAt: activeSession.startedAt.toISOString(),
          completedToday: completedSeconds,
        }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/start", 200, duration);

    return NextResponse.json(
      {
        success: true,
        activeSession: {
          id: activeSession.id,
          startedAt: activeSession.startedAt.toISOString(),
          tag: activeSession.tag,
        },
      },
      { headers }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/start", 500, duration);
    return handleApiError(error);
  }
}
