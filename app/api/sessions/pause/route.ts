import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusher";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 400 });
    }
    const now = new Date();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeSession = await prisma.activeSession.findUnique({
      where: {
        userId: user.id,
      },
    });
    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session found to stop" },
        { status: 404 }
      );
    }

    if (activeSession.isPaused) {
      return NextResponse.json(
        { message: "Session is already paused" },
        { status: 200 }
      );
    }

    const updatedSession = await prisma.activeSession.update({
      where: { userId: user.id },
      data: {
        isPaused: true,
        pausedAt: now,
      },
    });

    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: user.id,
      },
      include: { room: true },
    });

    for (const member of memberships) {
      await pusherServer.trigger(`room-${member.room.code}`, "session-paused", {
        userId: user.id,
        userName: user.name,
        pausedAt: updatedSession.pausedAt,
      });
    }
    return NextResponse.json(
      { message: "Session paused successfully", pausedAt: now },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pause Session Error:", error);
    return NextResponse.json(
      { error: "Failed to pause session" },
      { status: 500 }
    );
  }
}
