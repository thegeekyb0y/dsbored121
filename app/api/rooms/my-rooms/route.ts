import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roomsJoined = await prisma.roomMember.findMany({
      where: { userId: user.id },
      include: {
        room: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    const rooms = roomsJoined.map((member) => ({
      code: member.room.code,
      name: member.room.name,
      memberCount: member.room._count.members,
      isHost: member.room.hostId === user.id,
      joinedAt: member.joinedAt,
    }));

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching joined rooms: ", error);
    return NextResponse.json(
      { error: "Failed to fetch joined rooms" },
      { status: 500 }
    );
  }
}
