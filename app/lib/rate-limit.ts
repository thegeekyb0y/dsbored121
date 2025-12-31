import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./auth";
import { error } from "console";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const rateLimiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  }),

  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/write",
  }),

  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/read",
  }),

  realtime: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/realtime",
  }),

  rooms: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/rooms",
  }),
};

export async function getClientIdentifier(
  request: NextRequest
): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return `user : ${session.user.id}`;
    }
  } catch (error) {}

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit
): Promise<{
  success: boolean;
  headers: Record<string, string>;
  identifier: string;
}> {
  try {
    const identifier = await getClientIdentifier(request);
    const { success, limit, reset, remaining } = await limiter.limit(
      identifier
    );

    return {
      success,
      identifier,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      },
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // On error, allow the request but log it
    return {
      success: true,
      identifier: "error",
      headers: {},
    };
  }
}

export function createRateLimitResponse(headers: Record<string, string>) {
  return NextResponse.json(
    {
      error: " Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: headers["X-RateLimit-Reset"],
    },
    {
      status: 429,
      headers: {
        ...headers,
        "Retry-After": "60",
      },
    }
  );
}
