import { authOptions } from "@/app/lib/auth";
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
    logger.apiRequest("GET", "/api/user/subjects", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customSubjects: true },
    });

    const elapsed = Date.now() - startTime;
    logger.apiResponse("GET", "/api/user/subjects", 200, elapsed);

    return NextResponse.json(
      { customSubjects: user?.customSubjects || [] },
      { headers }
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
    logger.apiRequest("POST", "/api/user/subjects", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validated = validate<{ subject: string }>(body, {
      subject: { type: "string", required: true, min: 1, max: 50 },
    });

    const trimmed = validated.subject.trim();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customSubjects: true },
    });

    if (user?.customSubjects.includes(trimmed)) {
      return NextResponse.json(
        { error: "Subject already exists" },
        { status: 400, headers }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customSubjects: {
          push: trimmed,
        },
      },
      select: { customSubjects: true },
    });

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/user/subjects", 200, elapsed);

    return NextResponse.json(
      {
        success: true,
        customSubjects: updatedUser.customSubjects,
      },
      { headers }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.write
    );
    logger.apiRequest("DELETE", "/api/user/subjects", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validated = validate<{ subject: string }>(body, {
      subject: { type: "string", required: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { customSubjects: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const updatedSubjects = user.customSubjects.filter(
      (s) => s !== validated.subject
    );

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        customSubjects: updatedSubjects,
      },
      select: { customSubjects: true },
    });

    const elapsed = Date.now() - startTime;
    logger.apiResponse("DELETE", "/api/user/subjects", 200, elapsed);

    return NextResponse.json(
      {
        success: true,
        customSubjects: updatedUser.customSubjects,
      },
      { headers }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
