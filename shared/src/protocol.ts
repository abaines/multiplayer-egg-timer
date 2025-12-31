// Protocol types shared between frontend and backend

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
}

export enum GameState {
  STOPPED = 'STOPPED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface Room {
  id: string;
  players: Player[];
  gameState: GameState;
  playerTotals: Record<string, number>; // playerId -> total time in ms
  anchorTime: number | null; // timestamp when current period started
  accruedPausedTime: number; // accumulated time in ms during current period
}

// WebSocket message types
export enum MessageType {
  CREATE_ROOM = 'create_room',
  JOIN = 'join',
  LEAVE = 'leave',
  ROOM_CREATED = 'room_created',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  ROOM_STATE = 'room_state',
  ERROR = 'error',
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  END_TURN = 'end_turn',
  TIMER_STATE_UPDATE = 'timer_state_update',
}

export interface JoinMessage {
  type: MessageType.JOIN;
  roomId: string;
  playerId: string;
  playerName: string;
}

export interface LeaveMessage {
  type: MessageType.LEAVE;
  roomId: string;
  playerId: string;
}

export interface PlayerJoinedMessage {
  type: MessageType.PLAYER_JOINED;
  player: Player;
}

export interface PlayerLeftMessage {
  type: MessageType.PLAYER_LEFT;
  playerId: string;
}

export interface RoomStateMessage {
  type: MessageType.ROOM_STATE;
  room: Room;
}

export interface ErrorMessage {
  type: MessageType.ERROR;
  message: string;
}

export interface CreateRoomMessage {
  type: MessageType.CREATE_ROOM;
  playerId: string;
  playerName: string;
}

export interface RoomCreatedMessage {
  type: MessageType.ROOM_CREATED;
  roomId: string;
  room: Room;
}

export interface StartMessage {
  type: MessageType.START;
  roomId: string;
  playerId: string;
}

export interface PauseMessage {
  type: MessageType.PAUSE;
  roomId: string;
  playerId: string;
}

export interface ResumeMessage {
  type: MessageType.RESUME;
  roomId: string;
  playerId: string;
}

export interface StopMessage {
  type: MessageType.STOP;
  roomId: string;
  playerId: string;
}

export interface EndTurnMessage {
  type: MessageType.END_TURN;
  roomId: string;
  playerId: string;
}

export interface TimerStateUpdateMessage {
  type: MessageType.TIMER_STATE_UPDATE;
  room: Room;
}

export type ClientMessage =
  | CreateRoomMessage
  | JoinMessage
  | LeaveMessage
  | StartMessage
  | PauseMessage
  | ResumeMessage
  | StopMessage
  | EndTurnMessage;
export type ServerMessage =
  | RoomCreatedMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | RoomStateMessage
  | ErrorMessage
  | TimerStateUpdateMessage;
