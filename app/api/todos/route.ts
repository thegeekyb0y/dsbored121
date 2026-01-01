import { authOptions } from "@/app/lib/auth";
import { cache, cacheKeys } from "@/app/lib/cache";
import {
  handleApiError,
  NotFoundError,
  UnauthorizedError,
  validate,
} from "@/app/lib/errors";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.read
    );
    logger.apiRequest("GET", "/api/todos", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const cacheKey = cacheKeys.todos(session.user.email);
    const cached = await cache.get(cacheKey);

    if (cached) {
      const elapsed = Date.now() - startTime;
      logger.apiResponse("GET", "/api/todos", 200, elapsed);
      return NextResponse.json(
        { todos: cached },
        { headers: { ...headers, "X-Cache": "HIT" } }
      );
    }

    const todos = await prisma.todo.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: "desc" },
    });

    await cache.set(cacheKey, todos, 30);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", "/api/todos", 200, elapsed);

    return NextResponse.json(
      { todos },
      { headers: { ...headers, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("POST", "/api/todos", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validated = validate<{
      title: string;
      priority?: string;
      dueDate?: string;
    }>(body, {
      title: { type: "string", required: true, min: 1, max: 500 },
      priority: { type: "string", required: false },
      dueDate: { type: "string", required: false },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const todo = await prisma.todo.create({
      data: {
        userId: user.id,
        title: validated.title,
        priority: validated.priority || "medium",
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      },
    });

    await cache.del(cacheKeys.todos(session.user.email));

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/todos", 200, elapsed);

    return NextResponse.json({ todo }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
