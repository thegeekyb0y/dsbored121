/**
 * Single source of truth for realtime room channel names.
 *
 * Room channels are private: subscribing requires POST /api/pusher/auth, which
 * checks the caller's room membership before Pusher signs the subscription.
 * Room codes are six uppercase alphanumerics (see /api/rooms/create).
 */
export const ROOM_CHANNEL_PREFIX = "private-room-";

export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export function roomChannel(code: string): string {
  return `${ROOM_CHANNEL_PREFIX}${code}`;
}
