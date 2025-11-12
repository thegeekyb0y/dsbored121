import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  const params = await props.params;
  const { code } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.email) {
      return NextResponse.json(
        {
          error: "Unauthorised",
        },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { code: code },
    });

    if (!room) {
      return NextResponse.json(
        {
          error: "Room not found",
        },
        { status: 404 }
      );
    }

    const members = await prisma.roomMember.findMany({
      where: {
        roomId: room.id,
      },
      select: {
        userId: true,
      },
    });

    const userIds = members.map((m) => m.userId);
    if (userIds.length === 0) {
      return NextResponse.json({ activeSessions: [] });
    }

    const activeSessions = await prisma.activeSession.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const activeUserIds = activeSessions.map((s) => s.userId);

    if (activeUserIds.length === 0) {
      return NextResponse.json({ activeSessions: [] });
    }

    const completedTodayByUser = await prisma.studySession.groupBy({
      by: ["userId"],
      where: {
        userId: { in: activeUserIds },
        createdAt: { gte: today },
      },
      _sum: {
        duration: true,
      },
    });

    const completedMap = new Map(
      completedTodayByUser.map((item) => [item.userId, item._sum.duration || 0])
    );

    const activeSessionsWithCompleted = activeSessions.map((activeSession) => ({
      ...activeSession,
      completedToday: completedMap.get(activeSession.userId) || 0,
    }));

    return NextResponse.json({
      activeSessions: activeSessionsWithCompleted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch active sessions",
      },
      { status: 404 }
    );
  }
}
