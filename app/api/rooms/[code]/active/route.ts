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
      return NextResponse.json({ activeSessions: [], studyDurationToday: {} });
    }

    // 1. Fetch ALL Study Sessions for ALL members for today
    const completedTodayByUser = await prisma.studySession.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds }, // Check all members, not just active ones
        createdAt: { gte: today },
      },
      _sum: {
        duration: true,
      },
    });

    // Create a map of total study duration for all members
    const studyDurationToday: Record<string, number> = {};
    completedTodayByUser.forEach((item) => {
      studyDurationToday[item.userId] = item._sum.duration || 0;
    });

    // 2. Fetch Active Sessions
    const activeSessions = await prisma.activeSession.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, avatarId: true },
        },
      },
    });

    // 3. Combine active session data with today's study duration
    const activeSessionsWithCompleted = activeSessions.map((activeSession) => ({
      ...activeSession,
      // Use the calculated total duration for the LiveTimer baseline
      completedToday: studyDurationToday[activeSession.userId] || 0,
    }));

    // 4. Return both active sessions and the full map of today's study duration
    return NextResponse.json({
      activeSessions: activeSessionsWithCompleted,
      studyDurationToday: studyDurationToday,
    });
  } catch (error) {
    console.error("Failed to fetch active sessions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch active sessions",
      },
      { status: 500 }
    );
  }
}
