import { randomInt } from 'crypto';

/**
 * Generates a random 4-character room ID using confusion-resistant characters.
 * Uses uppercase letters excluding those commonly confused: I, O, L
 * Uses digits excluding those commonly confused: 0, 1
 */

const CONFUSION_RESISTANT_ALPHABET: string = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ROOM_ID_LENGTH: number = 4;

export function generateRoomId(): string {
  let roomId: string = '';
  const alphabetLength: number = CONFUSION_RESISTANT_ALPHABET.length;

  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    const randomIndex: number = randomInt(0, alphabetLength);
    roomId += CONFUSION_RESISTANT_ALPHABET[randomIndex];
  }

  return roomId;
}

/**
 * Normalizes a room ID to uppercase for case-insensitive comparison
 */
export function normalizeRoomId(roomId: string): string {
  return roomId.toUpperCase().trim();
}
