import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";
import {
  createRateLimitResponse,
  createUnavailableResponse,
  getClientIp,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

// Session polling is a GET; only POST (sign-in, callback, sign-out) is limited.
export { handler as GET };

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const outcome = await withRateLimit(request, rateLimiters.authIp, {
    failClosed: true,
    identifier: `ip:${getClientIp(request)}`,
  });

  if (outcome.unavailable) {
    return createUnavailableResponse(outcome.headers);
  }
  if (!outcome.success) {
    return createRateLimitResponse(outcome.headers);
  }

  return handler(request, context);
}
