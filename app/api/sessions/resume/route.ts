import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

    if (!activeSession || !activeSession.isPaused || !activeSession.pausedAt) {
      return NextResponse.json(
        { message: "Session is already running" },
        { status: 200 }
      );
    }

    const pausedDurationMs = now.getTime() - activeSession.pausedAt.getTime();

    const newStartedAtMs = activeSession.startedAt.getTime() + pausedDurationMs;
    const newStartedAt = new Date(newStartedAtMs);

    const updatedSession = await prisma.activeSession.update({
      where: { userId: user.id },
      data: {
        isPaused: false,
        startedAt: newStartedAt,
        pausedAt: null,
      },
    });

    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: user.id,
      },
      include: { room: true },
    });

    for (const member of memberships) {
      await pusherServer.trigger(
        `room-${member.room.code}`,
        "session-resumed",
        {
          userId: user.id,
          userName: user.name, // Added for consistency with pause/route.ts
          newStartedAt: updatedSession.startedAt,
        }
      );
    }
    return NextResponse.json(
      {
        message: "Session resumed successfully",
        newStartedAt: updatedSession.startedAt,
        pausedDurationMs: pausedDurationMs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resume Session Error:", error);
    return NextResponse.json(
      { error: "Failed to resume session" },
      { status: 500 }
    );
  }
}
