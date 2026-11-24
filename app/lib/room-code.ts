/**
 * Room code rules, shared by the join route and Pusher channel authorization so
 * both accept exactly the same set of codes.
 *
 * Codes are 6 to 10 uppercase alphanumerics. Six is the legacy length (rooms
 * created before codes were widened); generated codes use 8.
 */
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6,10}$/;

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidRoomCode(value: string): boolean {
  return ROOM_CODE_PATTERN.test(value);
}
