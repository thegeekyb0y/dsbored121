import { authOptions } from "@/app/lib/auth";
import { cache, cacheKeys } from "@/app/lib/cache";
import { handleApiError, UnauthorizedError, ValidationError, validateStrict } from "@/app/lib/errors";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    const params = await props.params;
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("PATCH", `/api/todos/${params.id}`, identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validated = validateStrict<{
      title?: string;
      completed?: boolean;
      priority?: string;
      dueDate?: Date | null;
    }>(body, {
      title: { type: "string", min: 1, max: 500 },
      completed: { type: "boolean" },
      priority: { type: "string", values: ["low", "medium", "high"] },
      dueDate: { type: "date", nullable: true },
    });

    if (Object.keys(validated).length === 0) {
      throw new ValidationError("No fields to update");
    }

    const updated = await prisma.todo.updateMany({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.completed !== undefined && {
          completed: validated.completed,
        }),
        ...(validated.priority !== undefined && {
          priority: validated.priority,
        }),
        ...(validated.dueDate !== undefined && {
          dueDate: validated.dueDate,
        }),
      },
    });

    await cache.del(cacheKeys.todos(session.user.email));

    const elapsed = Date.now() - startTime;
    logger.apiResponse("PATCH", `/api/todos/${params.id}`, 200, elapsed);

    return NextResponse.json({ success: updated.count > 0 }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    const params = await props.params;
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("DELETE", `/api/todos/${params.id}`, identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const deleted = await prisma.todo.deleteMany({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    await cache.del(cacheKeys.todos(session.user.email));

    const elapsed = Date.now() - startTime;
    logger.apiResponse("DELETE", `/api/todos/${params.id}`, 200, elapsed);

    return NextResponse.json({ success: deleted.count > 0 }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
