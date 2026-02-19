import { describe, it, expect } from 'vitest';
import { generateRoomId, normalizeRoomId } from '../src/roomIdGenerator';

describe('roomIdGenerator', () => {
  describe('generateRoomId', () => {
    it('should generate a 4-character room ID', () => {
      const roomId = generateRoomId();
      expect(roomId).toHaveLength(4);
    });

    it('should only use confusion-resistant characters', () => {
      const roomId = generateRoomId();
      const allowedChars = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/;
      expect(roomId).toMatch(allowedChars);
    });

    it('should not contain confusing characters (I, O, L, 0, 1)', () => {
      const roomId = generateRoomId();
      expect(roomId).not.toContain('I');
      expect(roomId).not.toContain('O');
      expect(roomId).not.toContain('L');
      expect(roomId).not.toContain('0');
      expect(roomId).not.toContain('1');
    });

    it('should generate different IDs on subsequent calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateRoomId());
      }
      // With high probability, 100 random 4-char IDs should be unique
      expect(ids.size).toBeGreaterThan(90);
    });
  });

  describe('normalizeRoomId', () => {
    it('should convert lowercase to uppercase', () => {
      expect(normalizeRoomId('abcd')).toBe('ABCD');
    });

    it('should trim whitespace', () => {
      expect(normalizeRoomId('  ABC  ')).toBe('ABC');
    });

    it('should handle already normalized IDs', () => {
      expect(normalizeRoomId('ABCD')).toBe('ABCD');
    });

    it('should handle mixed case with whitespace', () => {
      expect(normalizeRoomId(' aBcD ')).toBe('ABCD');
    });
  });
});
