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

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.read
    );
    if (!success) {
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

    const key = cacheKeys.userRooms(user.id);
    const cached = await cache.get(key);

    if (cached) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", "/api/rooms/my-rooms", 200, elapsed);
      return NextResponse.json(
        { rooms: cached },
        { headers: { ...headers, "X-Cache": "HIT" } }
      );
    }

    const roomsJoined = await prisma.roomMember.findMany({
      where: { userId: user.id },
      include: {
        room: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    const rooms = roomsJoined.map((member) => ({
      code: member.room.code,
      name: member.room.name,
      memberCount: member.room._count.members,
      isHost: member.room.hostId === user.id,
      joinedAt: member.joinedAt,
    }));

    await cache.set(key, rooms, 120);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", "/api/rooms/my-rooms", 200, elapsed);

    return NextResponse.json(
      { rooms },
      { headers: { ...headers, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
