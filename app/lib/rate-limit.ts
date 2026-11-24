import { Ratelimit } from "@upstash/ratelimit";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { authOptions } from "./auth";
import { logger } from "./logger";

export const rateLimiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  }),

  // NextAuth POST only: 120/min per IP (a shared campus NAT must not lock out
  // a whole cohort). GET session polling is never limited.
  authIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth-ip",
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

  // Join is the room-code oracle: 10/min per user, 100/min per IP (shared
  // campus networks put many students behind one address), fail closed.
  joinUser: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/join-user",
  }),

  joinIp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/join-ip",
  }),

  pusherAuth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/pusher-auth",
  }),
};

export type RateLimitOutcome = {
  success: boolean;
  /** The limiter could not be reached and this route chose to fail closed. */
  unavailable: boolean;
  /** The limiter could not be reached; the request was allowed through. */
  degraded: boolean;
  headers: Record<string, string>;
  identifier: string;
};

function secondsUntil(reset: number): string {
  return String(Math.max(1, Math.ceil((reset - Date.now()) / 1000)));
}

export async function getClientIdentifier(
  request: NextRequest
): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return `user:${session.user.id}`;
    }
  } catch (error) {}

  return `ip:${getClientIp(request)}`;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Applies a limiter and resolves the outage policy.
 *
 * failClosed: only for NextAuth POST, room create, room join and profile update.
 * Everything else fails open so a Redis outage never loses a study session.
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit,
  options: { failClosed?: boolean; identifier?: string } = {}
): Promise<RateLimitOutcome> {
  const identifier =
    options.identifier ?? (await getClientIdentifier(request));

  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    const headers: Record<string, string> = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    };
    if (!success) {
      headers["Retry-After"] = secondsUntil(reset);
    }

    return {
      success,
      unavailable: false,
      degraded: false,
      headers,
      identifier,
    };
  } catch (error) {
    logger.warn("Rate limiter unavailable", {
      identifier,
      failClosed: Boolean(options.failClosed),
      error: error instanceof Error ? error.message : String(error),
    });

    if (options.failClosed) {
      return {
        success: false,
        unavailable: true,
        degraded: true,
        headers: { "Retry-After": "5", "X-RateLimit-Status": "degraded" },
        identifier,
      };
    }

    return {
      success: true,
      unavailable: false,
      degraded: true,
      headers: { "X-RateLimit-Status": "degraded" },
      identifier,
    };
  }
}

export function createRateLimitResponse(headers: Record<string, string>) {
  const retryAfter = headers["Retry-After"] || "60";

  return NextResponse.json(
    {
      error: " Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: Number(retryAfter),
    },
    {
      status: 429,
      headers: {
        ...headers,
        "Retry-After": retryAfter,
      },
    }
  );
}

export function createUnavailableResponse(headers: Record<string, string>) {
  return NextResponse.json(
    {
      error: "Rate limiting unavailable",
      message: "This endpoint is temporarily unavailable. Please retry shortly.",
    },
    {
      status: 503,
      headers: {
        ...headers,
        "Retry-After": headers["Retry-After"] || "5",
      },
    }
  );
}
