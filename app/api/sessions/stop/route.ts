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

    const duration = Math.floor(
      (Date.now() - activeSession.startedAt.getTime()) / 1000
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.activeSession.delete({
        where: { id: activeSession.id },
      });
      const studySession = await tx.studySession.create({
        data: {
          userId: user.id,
          duration: duration,
          tag: activeSession.tag,
        },
      });
      return studySession;
    });

    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: user.id,
      },
      include: { room: true },
    });

    for (const member of memberships) {
      await pusherServer.trigger(
        `Room-${member.room.code}`,
        "session-stopped",
        {
          userId: user.id,
          userName: user.name,
          duration: duration,
          tag: activeSession.tag,
        }
      );
    }

    return NextResponse.json({
      success: true,
      studySession: result,
      duration: duration,
    });
  } catch (error) {
    console.error("Error stopping session:", error);
    return NextResponse.json(
      { error: "Failed to stop session" },
      { status: 500 }
    );
  }
}
