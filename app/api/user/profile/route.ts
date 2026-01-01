import { authOptions } from "@/app/lib/auth";
import { cache } from "@/app/lib/cache";
import { handleApiError, UnauthorizedError, validate } from "@/app/lib/errors";
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
      rateLimiters.read
    );
    logger.apiRequest("GET", "/api/user/profile", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const cacheKey = `profile:${session.user.email}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", "/api/user/profile", 200, elapsed);
      return NextResponse.json(
        { user: cached },
        { headers: { ...headers, "X-Cache": "HIT" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        bio: true,
        status: true,
        avatarId: true,
      },
    });

    await cache.set(cacheKey, user, 300);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", "/api/user/profile", 200, elapsed);

    return NextResponse.json(
      { user },
      { headers: { ...headers, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("PATCH", "/api/user/profile", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validated = validate<{
      name?: string;
      bio?: string;
      status?: string;
      avatarId?: string;
    }>(body, {
      name: { type: "string", required: false, min: 1, max: 100 },
      bio: { type: "string", required: false, max: 500 },
      status: { type: "string", required: false, max: 100 },
      avatarId: { type: "string", required: false, max: 50 },
    });

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.status !== undefined && { status: validated.status }),
        ...(validated.avatarId !== undefined && {
          avatarId: validated.avatarId,
        }),
      },
    });

    await cache.del(`profile:${session.user.email}`);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("PATCH", "/api/user/profile", 200, elapsed);

    return NextResponse.json({ success: true, user: updatedUser }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
