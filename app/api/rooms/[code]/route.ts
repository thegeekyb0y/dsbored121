import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: {
        code: code,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      room: {
        id: room.code,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        createdAt: room.createdAt,
      },
      members: room.members.map((member) => ({
        id: member.id,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
    });
  } catch (error) {
    console.error("Error fetching room: ", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 },
    );
  }
}
