import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayStats = await prisma.studySession.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: today },
      },
      _sum: { duration: true },
      _count: true,
    });

    const weekStats = await prisma.studySession.groupBy({
      by: ["tag"],
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
      _sum: { duration: true },
      _count: true,
    });

    const recent = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      today: {
        totalMinutes: Math.floor((todayStats._sum.duration || 0) / 60),
        sessionCount: todayStats._count,
      },
      week: {
        totalMinutes: Math.floor(
          weekStats.reduce((sum, item) => sum + (item._sum.duration || 0), 0) /
            60
        ),
        sessionCount: weekStats.reduce((sum, item) => sum + item._count, 0),
      },
      bySubject: weekStats.map((item) => ({
        tag: item.tag,
        minutes: Math.floor((item._sum.duration || 0) / 60),
        count: item._count,
      })),
      recentSessions: recent,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
