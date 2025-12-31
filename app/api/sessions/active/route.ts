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

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.realtime
    );
    logger.apiRequest("GET", "/api/sessions/active", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const cacheKey = `active-session:${session.user.email}`;
    const cachedSession = await cache.get(cacheKey);

    if (cachedSession) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", "/api/sessions/active", 200, elapsed);
      return NextResponse.json(
        { activeSession: cachedSession },
        { headers: { ...headers, "X-Cache": "HIT" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        activeSessions: {
          select: {
            id: true,
            startedAt: true,
            tag: true,
            isPaused: true,
            pausedAt: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const activeSession = user.activeSessions[0] || null;

    if (activeSession) {
      await cache.set(cacheKey, activeSession, 30);
    }

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", "/api/sessions/active", 200, elapsed);

    return NextResponse.json(
      { activeSession },
      { headers: { ...headers, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
