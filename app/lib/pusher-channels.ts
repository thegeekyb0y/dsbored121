/**
 * Single source of truth for realtime room channel names.
 *
 * Room channels are private: subscribing requires POST /api/pusher/auth, which
 * checks the caller's room membership before Pusher signs the subscription.
 * Room codes are validated against the shared rules in app/lib/room-code.ts.
 */
export const ROOM_CHANNEL_PREFIX = "private-room-";

export function roomChannel(code: string): string {
  return `${ROOM_CHANNEL_PREFIX}${code}`;
}
