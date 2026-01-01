import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { cache, cacheKeys } from "@/app/lib/cache";
import { logger } from "@/app/lib/logger";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
  validate,
} from "@/app/lib/errors";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.rooms
    );
    logger.apiRequest("POST", "/api/rooms/create", identifier);

    if (!success) {
      logger.warn("Rate limit exceeded", {
        endpoint: "/api/rooms/create",
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
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const data = await request.json();
    const validatedData = validate<{ roomName: string }>(data, {
      roomName: { type: "string", required: true, min: 1, max: 100 },
    });

    function generateRoomCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      return code;
    }

    let roomCode = generateRoomCode();
    let existing = await prisma.room.findUnique({ where: { code: roomCode } });

    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.room.findUnique({ where: { code: roomCode } });
    }

    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          code: roomCode,
          name: validatedData.roomName,
          hostId: user.id,
        },
      });

      await tx.roomMember.create({
        data: {
          roomId: newRoom.id,
          userId: user.id,
        },
      });

      return newRoom;
    });

    await cache.del(cacheKeys.userRooms(user.id));

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/rooms/create", 200, elapsed);

    return NextResponse.json(
      {
        success: true,
        roomCode: room.code,
        roomId: room.id,
      },
      { headers }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
