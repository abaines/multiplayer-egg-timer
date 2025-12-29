import { WebSocket } from 'ws';
import {
  Player,
  Room,
  MessageType,
  ServerMessage,
  JoinMessage,
  LeaveMessage,
  CreateRoomMessage,
} from '../../shared/dist/index.js';
import { generateRoomId, normalizeRoomId } from './roomIdGenerator.js';

const rooms = new Map<string, Room>();
const wsToPlayer = new Map<WebSocket, { roomId: string; playerId: string }>();
const roomConnections = new Map<string, Set<WebSocket>>();

function createRoom(roomId: string): Room {
  const room: Room = {
    id: roomId,
    players: [],
  };
  rooms.set(roomId, room);
  roomConnections.set(roomId, new Set());
  return room;
}

function getOrCreateRoom(roomId: string): Room {
  return rooms.get(roomId) || createRoom(roomId);
}

function addPlayerToRoom(roomId: string, player: Player, ws: WebSocket): void {
  const room = getOrCreateRoom(roomId);

  room.players = room.players.filter((p) => p.id !== player.id);

  room.players.push(player);
  wsToPlayer.set(ws, { roomId, playerId: player.id });

  const connections = roomConnections.get(roomId) || new Set();
  connections.add(ws);
  roomConnections.set(roomId, connections);
}

function removePlayerFromRoom(roomId: string, playerId: string, ws: WebSocket): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.players = room.players.filter((p) => p.id !== playerId);
  wsToPlayer.delete(ws);

  const connections = roomConnections.get(roomId);
  if (connections) {
    connections.delete(ws);
    if (connections.size === 0) {
      roomConnections.delete(roomId);
      if (room.players.length === 0) {
        rooms.delete(roomId);
      }
    }
  }
}

function broadcastToRoom(roomId: string, message: ServerMessage, exclude?: WebSocket): void {
  const connections = roomConnections.get(roomId);
  if (!connections) return;

  const messageStr = JSON.stringify(message);
  connections.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

export function handleCreateRoomMessage(ws: WebSocket, message: CreateRoomMessage): void {
  const roomId = generateRoomId();

  const player: Player = {
    id: message.playerId,
    name: message.playerName,
    joinedAt: Date.now(),
  };

  addPlayerToRoom(roomId, player, ws);
  const room = getOrCreateRoom(roomId);

  const roomCreatedMessage: ServerMessage = {
    type: MessageType.ROOM_CREATED,
    roomId,
    room,
  };
  ws.send(JSON.stringify(roomCreatedMessage));
}

export function handleJoinMessage(ws: WebSocket, message: JoinMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);

  const player: Player = {
    id: message.playerId,
    name: message.playerName,
    joinedAt: Date.now(),
  };

  addPlayerToRoom(normalizedRoomId, player, ws);

  const room = getOrCreateRoom(normalizedRoomId);

  const roomStateMessage: ServerMessage = {
    type: MessageType.ROOM_STATE,
    room,
  };
  ws.send(JSON.stringify(roomStateMessage));

  const playerJoinedMessage: ServerMessage = {
    type: MessageType.PLAYER_JOINED,
    player,
  };
  broadcastToRoom(normalizedRoomId, playerJoinedMessage, ws);
}

export function handleLeaveMessage(ws: WebSocket, message: LeaveMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);
  removePlayerFromRoom(normalizedRoomId, message.playerId, ws);

  const playerLeftMessage: ServerMessage = {
    type: MessageType.PLAYER_LEFT,
    playerId: message.playerId,
  };
  broadcastToRoom(normalizedRoomId, playerLeftMessage);
}

export function handleWebSocketClose(ws: WebSocket): void {
  const playerInfo = wsToPlayer.get(ws);
  if (playerInfo) {
    removePlayerFromRoom(playerInfo.roomId, playerInfo.playerId, ws);

    const playerLeftMessage: ServerMessage = {
      type: MessageType.PLAYER_LEFT,
      playerId: playerInfo.playerId,
    };
    broadcastToRoom(playerInfo.roomId, playerLeftMessage);
  }
}
