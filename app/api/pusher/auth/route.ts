import { authOptions } from "@/app/lib/auth";
import {
  handleApiError,
  UnauthorizedError,
  ValidationError,
} from "@/app/lib/errors";
import { logger } from "@/app/lib/logger";
import { pusherServer } from "@/app/lib/pusher";
import {
  ROOM_CHANNEL_PREFIX,
  ROOM_CODE_PATTERN,
} from "@/app/lib/pusher-channels";
import {
  createRateLimitResponse,
  rateLimiters,
  withRateLimit,
} from "@/app/lib/rate-limit";
import { requireRoomMember } from "@/app/lib/room-access";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Pusher private-channel authorization.
 *
 * Pusher posts `socket_id` and `channel_name` as form data. Only
 * `private-room-<code>` channels with a well-formed code are accepted, and the
 * caller must already be a member of that room. Non-members get the same 404 as
 * a missing room so the channel's existence is not confirmed.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { success, headers, identifier } = await withRateLimit(
      request,
      rateLimiters.pusherAuth
    );
    logger.apiRequest("POST", "/api/pusher/auth", identifier);

    if (!success) {
      return createRateLimitResponse(headers);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new UnauthorizedError();
    }

    const body = await request.formData();
    const socketId = String(body.get("socket_id") ?? "");
    const channelName = String(body.get("channel_name") ?? "");

    if (!socketId) {
      throw new ValidationError("Missing socket_id");
    }

    if (!channelName.startsWith(ROOM_CHANNEL_PREFIX)) {
      throw new ValidationError("Unsupported channel");
    }

    const roomCode = channelName.slice(ROOM_CHANNEL_PREFIX.length);
    if (!ROOM_CODE_PATTERN.test(roomCode)) {
      throw new ValidationError("Invalid room code");
    }

    await requireRoomMember(session.user.email, roomCode);

    const auth = pusherServer.authorizeChannel(socketId, channelName);

    const elapsed = Date.now() - startTime;
    logger.apiResponse("POST", "/api/pusher/auth", 200, elapsed);

    return NextResponse.json(auth, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
