import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusher";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { roomId, tag } = await request.json();
    if (!tag) {
      return NextResponse.json(
        { error: "Subject tag is required" },
        { status: 400 }
      );
    }

    const activeSession = await prisma.activeSession.upsert({
      where: {
        userId_roomId: {
          userId: user.id,
          roomId: roomId || null,
        },
      },
      create: {
        userId: user.id,
        roomId: roomId || null,
        tag: tag,
      },
      update: {
        startedAt: new Date(),
        tag: tag,
      },
    });
    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        room: true,
      },
    });

    for (const member of memberships) {
      await pusherServer.trigger(
        `room-${member.room.code}`,
        "session-started",
        {
          userId: user.id,
          userName: user.name,
          userImage: user.image,
          tag: tag,
          startedAt: activeSession.startedAt.toISOString(),
        }
      );
    }
    console.log(
      `Started session for ${user.name} and broadcast to ${memberships.length} rooms.`
    );

    return NextResponse.json({
      succcess: true,
      activeSession: {
        id: activeSession.id,
        startedAt: activeSession.startedAt.toISOString(),
        tag: activeSession.tag,
      },
    });
  } catch (error) {
    console.error("Error starting session:", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
