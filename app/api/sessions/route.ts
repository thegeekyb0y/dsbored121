import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ← Import authOptions
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); // ← Pass authOptions

    console.log("🔍 Session Debug:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
    });

    if (!session?.user?.email) {
      console.log("❌ Unauthorized: No session or email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { duration, tag } = body;

    if (!duration || !tag) {
      return NextResponse.json(
        { error: "Missing duration or tag" },
        { status: 400 }
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

    console.log("✅ Session saved successfully:", {
      sessionId: studySession.id,
      duration: studySession.duration,
      tag: studySession.tag,
    });

    return NextResponse.json({
      success: true,
      session: studySession,
    });
  } catch (error) {
    console.error("❌ Error saving session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
