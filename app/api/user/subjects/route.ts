import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customSubjects: true },
    });

    return NextResponse.json({
      customSubjects: user?.customSubjects || [],
    });
  } catch (err) {
    console.error("Error fetching custom subjects:", err);
    return NextResponse.json(
      { error: "Failed to fetch custom subjects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject } = await req.json();

    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    const trimmedSubject = subject.trim();

    if (trimmedSubject.length > 50) {
      return NextResponse.json(
        { error: "Subject name too long (max 50 characters)" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customSubjects: true },
    });

    // Check if subject already exists
    if (user?.customSubjects.includes(trimmedSubject)) {
      return NextResponse.json(
        { error: "Subject already exists" },
        { status: 400 }
      );
    }

    // Add subject to user's custom list
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customSubjects: {
          push: trimmedSubject,
        },
      },
      select: { customSubjects: true },
    });

    return NextResponse.json({
      success: true,
      customSubjects: updatedUser.customSubjects,
    });
  } catch (err) {
    console.error("Error adding custom subject:", err);
    return NextResponse.json(
      { error: "Failed to add custom subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject } = await req.json();

    if (!subject) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    // Get current subjects
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customSubjects: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove subject from array
    const updatedSubjects = user.customSubjects.filter((s) => s !== subject);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customSubjects: updatedSubjects,
      },
      select: { customSubjects: true },
    });

    return NextResponse.json({
      success: true,
      customSubjects: updatedUser.customSubjects,
    });
  } catch (err) {
    console.error("Error deleting custom subject:", err);
    return NextResponse.json(
      { error: "Failed to delete custom subject" },
      { status: 500 }
    );
  }
}
