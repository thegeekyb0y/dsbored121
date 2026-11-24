import { authOptions } from "@/app/lib/auth";
import { cache, cacheKeys } from "@/app/lib/cache";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  validate,
} from "@/app/lib/errors";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { ROOM_CODE_PATTERN, normalizeRoomCode } from "@/app/lib/room-code";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.rooms
    );
    logger.apiRequest("POST", "/api/rooms/join", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user.email) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const parsed = validate<{ roomCode: string }>(body, {
      roomCode: { type: "string", required: true, min: 1 },
    });

    const roomCode = normalizeRoomCode(parsed.roomCode);
    if (!ROOM_CODE_PATTERN.test(roomCode)) {
      throw new ValidationError("Invalid room code");
    }

    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room) {
      throw new NotFoundError("Room");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          error: "Already a member",
          roomCode,
        },
        { status: 200, headers }
      );
    }

    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: user.id,
      },
    });

    await Promise.all([
      cache.del(cacheKeys.userRooms(user.id)),
      cache.del(cacheKeys.roomData(roomCode)),
    ]);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/rooms/join", 200, elapsed);

    return NextResponse.json(
      {
        message: "Joined room successfully",
        roomCode,
      },
      { headers }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
