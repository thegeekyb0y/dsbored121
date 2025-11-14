import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 400 });
  }

  const response = await request.json();
  const { roomCode } = response;

  if (!roomCode || typeof roomCode !== "string" || roomCode.trim() === "") {
    return NextResponse.json(
      {
        error: "Invalid roomCode",
      },
      { status: 404 }
    );
  }

  const room = await prisma.room.findUnique({
    where: {
      code: roomCode,
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      { error: "User already in the room" },
      { status: 404 }
    );
  }

  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: user.id,
    },
  });

  return NextResponse.json(
    {
      message: "User Joined the room successfully.",
      roomCode: roomCode,
    },
    {
      status: 200,
    }
  );
}
