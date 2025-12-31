import { authOptions } from "@/app/lib/auth";
import { cache, cacheKeys } from "@/app/lib/cache";
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
    logger.apiRequest("POST", "/api/sessions/stop", identifier);

    if (!success) {
      logger.warn("Rate Limit Exceeded", {
        endpoint: "/api/sessions/stop",
        identifier,
      });
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user.email) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true, email: true },
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

    const duration = Math.floor(
      (Date.now() - activeSession.startedAt.getTime()) / 1000
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.activeSession.delete({
        where: { id: activeSession.id },
      });
      return await tx.studySession.create({
        data: {
          userId: user.id,
          duration: duration,
          tag: activeSession.tag,
        },
      });
    });

    await Promise.all([
      cache.del(`active-session: ${session.user.email}`),
      cache.del(cacheKeys.userStats(user.id)),
    ]);

    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: user.id,
      },
      include: { room: true },
    });

    for (const member of memberships) {
      await pusherServer.trigger(
        `room-${member.room.code}`,
        "session-stopped",
        {
          userId: user.id,
          userName: user.name,
          duration: duration,
          tag: activeSession.tag,
        }
      );
    }

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/stop", 200, elapsed);

    return NextResponse.json(
      {
        success: true,
        studySession: result,
        duration: duration,
      },
      { headers }
    );
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/sessions/stop", 500, elapsed);
    return handleApiError(error);
  }
}
