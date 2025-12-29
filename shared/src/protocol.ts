// Protocol types shared between frontend and backend

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
}

export interface Room {
  id: string;
  players: Player[];
}

// WebSocket message types
export enum MessageType {
  JOIN = 'join',
  LEAVE = 'leave',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  ROOM_STATE = 'room_state',
  ERROR = 'error',
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

export type ClientMessage = JoinMessage | LeaveMessage;
export type ServerMessage =
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | RoomStateMessage
  | ErrorMessage;
