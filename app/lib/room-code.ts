import { randomInt } from "node:crypto";

/**
 * Room code rules, shared by the join route and Pusher channel authorization so
 * both accept exactly the same set of codes.
 *
 * Codes are 6 to 10 uppercase alphanumerics. Six is the legacy length (rooms
 * created before codes were widened); generated codes use 8.
 */
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6,10}$/;

/**
 * Ambiguous characters (I, O, 0, 1) are excluded so a code read aloud or copied
 * by hand cannot land on a different room.
 */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ROOM_CODE_LENGTH = 8;

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidRoomCode(value: string): boolean {
  return ROOM_CODE_PATTERN.test(value);
}

export function generateRoomCode(length = ROOM_CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}
