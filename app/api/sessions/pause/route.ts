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
    logger.apiRequest("POST", "/api/sessions/pause", identifier);

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

    if (activeSession.isPaused) {
      return NextResponse.json(
        { message: "Session is already paused" },
        { status: 200, headers }
      );
    }

    const updatedSession = await prisma.activeSession.update({
      where: { userId: user.id },
      data: {
        isPaused: true,
        pausedAt: now,
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
      await pusherServer.trigger(`room-${member.room.code}`, "session-paused", {
        userId: user.id,
        userName: user.name,
        pausedAt: updatedSession.pausedAt,
      });
    }

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/pause", 200, elapsed);

    return NextResponse.json(
      { message: "Session paused successfully", pausedAt: now },
      { headers }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
