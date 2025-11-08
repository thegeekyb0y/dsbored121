import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();
    const { roomName } = data;

    if (!roomName) {
      return NextResponse.json(
        {
          error: "Room Name is required",
        },
        {
          status: 400,
        },
      );
    }

    function generateRoomCode() {
      const variable = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      let roomCode = "";
      for (let i = 0; i < 6; i++) {
        roomCode += variable[Math.floor(Math.random() * variable.length)];
      }
      return roomCode;
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
          name: roomName,
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

    return NextResponse.json({
      success: true,
      roomCode: room.code,
      roomId: room.id,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
