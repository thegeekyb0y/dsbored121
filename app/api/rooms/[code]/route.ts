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
  props: { params: Promise<{ code: string }> }
) {
  const startTime = Date.now();

  try {
    const params = await props.params;
    const { code } = params;

    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.read
    );
    logger.apiRequest("GET", `/api/rooms/${code}`, identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user.email) {
      throw new UnauthorizedError();
    }

    const cacheKey = cacheKeys.roomData(code);
    const cached = await cache.get(cacheKey);

    if (cached) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", `/api/rooms/${code}`, 200, elapsed);
      return NextResponse.json(cached, {
        headers: { ...headers, "X-Cache": "HIT" },
      });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                avatarId: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundError("Room");
    }

    const roomData = {
      room: {
        id: room.code,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        createdAt: room.createdAt,
      },
      members: room.members.map((member) => ({
        id: member.id,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
    };

    await cache.set(cacheKey, roomData, 60);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", `/api/rooms/${code}`, 200, elapsed);

    return NextResponse.json(roomData, {
      headers: { ...headers, "X-Cache": "MISS" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
