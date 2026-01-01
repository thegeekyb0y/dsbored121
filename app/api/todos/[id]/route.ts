import { authOptions } from "@/app/lib/auth";
import { cache, cacheKeys } from "@/app/lib/cache";
import { handleApiError, UnauthorizedError } from "@/app/lib/errors";
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
    const { title, completed, priority, dueDate } = body;

    const updated = await prisma.todo.updateMany({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
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
