import { authOptions } from "@/app/lib/auth";
import { cache } from "@/app/lib/cache";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
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
    logger.apiRequest("POST", "/api/sessions/resume", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const now = new Date();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const activeSession = await prisma.activeSession.findUnique({
      where: {
        userId: user.id,
      },
    });
    if (!activeSession) {
      throw new NotFoundError("Active Session");
    }

    if (!activeSession.isPaused || !activeSession.pausedAt) {
      return NextResponse.json(
        { message: "Session is already running" },
        { status: 200, headers }
      );
    }

    const pausedDurationMs = now.getTime() - activeSession.pausedAt.getTime();

    const newStartedAtMs = activeSession.startedAt.getTime() + pausedDurationMs;
    const newStartedAt = new Date(newStartedAtMs);

    const updatedSession = await prisma.activeSession.update({
      where: { userId: user.id },
      data: {
        isPaused: false,
        startedAt: newStartedAt,
        pausedAt: null,
      },
    });

    await cache.del(`active-session:${session.user.email}`);

    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: user.id,
      },
      include: { room: true },
    });

    for (const member of memberships) {
      await pusherServer.trigger(
        `room-${member.room.code}`,
        "session-resumed",
        {
          userId: user.id,
          userName: user.name,
          newStartedAt: updatedSession.startedAt,
        }
      );
    }

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/resume", 200, elapsed);

    return NextResponse.json(
      {
        message: "Session resumed successfully",
        newStartedAt: updatedSession.startedAt,
        pausedDurationMs: pausedDurationMs,
      },
      { headers }
    );
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/resume", 500, elapsed);
    return handleApiError(error);
  }
}
