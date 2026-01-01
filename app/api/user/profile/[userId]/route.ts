import { authOptions } from "@/app/lib/auth";
import { cache, cacheKeys } from "@/app/lib/cache";
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
  props: { params: Promise<{ userId: string }> }
) {
  const startTime = Date.now();

  try {
    const params = await props.params;
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.read
    );
    logger.apiRequest("GET", `/api/user/profile/${params.userId}`, identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const cacheKey = cacheKeys.userProfile(params.userId);
    const cached = await cache.get(cacheKey);

    if (cached) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse(
        "GET",
        `/api/user/profile/${params.userId}`,
        200,
        elapsed
      );
      return NextResponse.json(
        { user: cached },
        { headers: { ...headers, "X-Cache": "HIT" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        name: true,
        bio: true,
        status: true,
        avatarId: true,
        image: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const userData = {
      ...user,
      email: params.userId === session.user.id ? user.email : null,
    };

    await cache.set(cacheKey, userData, 300);

    const elapsed = Date.now() - startTime;
    logger.apiResponse(
      "GET",
      `/api/user/profile/${params.userId}`,
      200,
      elapsed
    );

    return NextResponse.json(
      { user: userData },
      { headers: { ...headers, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
