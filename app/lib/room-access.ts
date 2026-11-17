import prisma from "@/app/lib/prisma";
import { NotFoundError } from "@/app/lib/errors";

export type RoomAccess = {
  userId: string;
  roomId: string;
  roomCode: string;
};

/**
 * Resolves the signed-in user and verifies room membership before any room
 * data is read. Non-members receive a 404 so room existence is not confirmed.
 */
export async function requireRoomMember(
  email: string,
  code: string
): Promise<RoomAccess> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const room = await prisma.room.findUnique({
    where: { code },
    select: { id: true, code: true },
  });

  if (!room) {
    throw new NotFoundError("Room");
  }

  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: room.id,
        userId: user.id,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new NotFoundError("Room");
  }

  return {
    userId: user.id,
    roomId: room.id,
    roomCode: room.code,
  };
}
