import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, isCompleted, priority, dueDate } = await req.json();

  const updated = await prisma.todo.updateMany({
    where: {
      id: params.id,
      user: { email: session.user.email }, // Ensure ownership
    },
    data: {
      ...(title !== undefined && { title }),
      ...(isCompleted !== undefined && { isCompleted }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
    },
  });

  return NextResponse.json({ success: updated.count > 0 });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deleted = await prisma.todo.deleteMany({
    where: {
      id: params.id,
      user: { email: session.user.email },
    },
  });

  return NextResponse.json({ success: deleted.count > 0 });
}
