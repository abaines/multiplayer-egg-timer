import { describe, it, expect } from 'vitest';
import { GameState, MessageType, type Player, type Room } from '../src/protocol';

describe('protocol', () => {
  describe('GameState enum', () => {
    it('should have STOPPED state', () => {
      expect(GameState.STOPPED).toBe('STOPPED');
    });

    it('should have RUNNING state', () => {
      expect(GameState.RUNNING).toBe('RUNNING');
    });

    it('should have PAUSED state', () => {
      expect(GameState.PAUSED).toBe('PAUSED');
    });
  });

  describe('MessageType enum', () => {
    it('should have CREATE_ROOM type', () => {
      expect(MessageType.CREATE_ROOM).toBe('create_room');
    });

    it('should have JOIN type', () => {
      expect(MessageType.JOIN).toBe('join');
    });

    it('should have LEAVE type', () => {
      expect(MessageType.LEAVE).toBe('leave');
    });

    it('should have ROOM_CREATED type', () => {
      expect(MessageType.ROOM_CREATED).toBe('room_created');
    });

    it('should have PLAYER_JOINED type', () => {
      expect(MessageType.PLAYER_JOINED).toBe('player_joined');
    });

    it('should have PLAYER_LEFT type', () => {
      expect(MessageType.PLAYER_LEFT).toBe('player_left');
    });

    it('should have ROOM_STATE type', () => {
      expect(MessageType.ROOM_STATE).toBe('room_state');
    });

    it('should have ERROR type', () => {
      expect(MessageType.ERROR).toBe('error');
    });

    it('should have START type', () => {
      expect(MessageType.START).toBe('start');
    });

    it('should have PAUSE type', () => {
      expect(MessageType.PAUSE).toBe('pause');
    });

    it('should have RESUME type', () => {
      expect(MessageType.RESUME).toBe('resume');
    });

    it('should have STOP type', () => {
      expect(MessageType.STOP).toBe('stop');
    });

    it('should have END_TURN type', () => {
      expect(MessageType.END_TURN).toBe('end_turn');
    });

    it('should have TIMER_STATE_UPDATE type', () => {
      expect(MessageType.TIMER_STATE_UPDATE).toBe('timer_state_update');
    });
  });

  describe('Player interface', () => {
    it('should accept valid player object', () => {
      const player: Player = {
        id: 'player-123',
        name: 'Test Player',
        joinedAt: Date.now(),
      };
      expect(player.id).toBe('player-123');
      expect(player.name).toBe('Test Player');
      expect(typeof player.joinedAt).toBe('number');
    });
  });

  describe('Room interface', () => {
    it('should accept valid room object', () => {
      const room: Room = {
        id: 'ABCD',
        players: [],
        gameState: GameState.STOPPED,
        playerTotals: {},
        anchorTime: null,
        accruedPausedTime: 0,
      };
      expect(room.id).toBe('ABCD');
      expect(room.players).toEqual([]);
      expect(room.gameState).toBe(GameState.STOPPED);
      expect(room.playerTotals).toEqual({});
      expect(room.anchorTime).toBeNull();
      expect(room.accruedPausedTime).toBe(0);
    });

    it('should accept room with players', () => {
      const room: Room = {
        id: 'EFGH',
        players: [
          { id: 'p1', name: 'Player 1', joinedAt: 1000 },
          { id: 'p2', name: 'Player 2', joinedAt: 2000 },
        ],
        gameState: GameState.RUNNING,
        playerTotals: { p1: 5000, p2: 3000 },
        anchorTime: Date.now(),
        accruedPausedTime: 1000,
      };
      expect(room.players).toHaveLength(2);
      expect(room.gameState).toBe(GameState.RUNNING);
      expect(room.playerTotals['p1']).toBe(5000);
    });
  });
});
