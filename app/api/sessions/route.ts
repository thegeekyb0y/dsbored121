import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { duration, tag } = body;

    if (!duration || !tag) {
      return NextResponse.json(
        { error: "Missing duration or tag" },
        { status: 400 } // Bad request
      );
    }

    if (duration < 0) {
      return NextResponse.json(
        { error: "Duration must be positive" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // User doesn't exist in DB (shouldn't happen, but safety check)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const studySession = await prisma.studySession.create({
      data: {
        userId: user.id,
        duration: parseInt(duration),
        tag: tag,
        roomId: null,
      },
    });

    return NextResponse.json({
      success: true,
      session: studySession,
    });
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
