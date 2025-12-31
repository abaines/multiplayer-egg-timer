import { WebSocket } from 'ws';
import {
  Player,
  Room,
  GameState,
  MessageType,
  ServerMessage,
  JoinMessage,
  LeaveMessage,
  CreateRoomMessage,
  StartMessage,
  PauseMessage,
  ResumeMessage,
  StopMessage,
  EndTurnMessage,
} from '../../shared/dist/index.js';
import { generateRoomId, normalizeRoomId } from './roomIdGenerator.js';

const rooms = new Map<string, Room>();
const wsToPlayer = new Map<WebSocket, { roomId: string; playerId: string }>();
const roomConnections = new Map<string, Set<WebSocket>>();

function createRoom(roomId: string): Room {
  const room: Room = {
    id: roomId,
    players: [],
    gameState: GameState.STOPPED,
    playerTotals: {},
    anchorTime: null,
    accruedPausedTime: 0,
  };
  rooms.set(roomId, room);
  roomConnections.set(roomId, new Set());
  return room;
}

function getOrCreateRoom(roomId: string): Room {
  return rooms.get(roomId) || createRoom(roomId);
}

function addPlayerToRoom(roomId: string, player: Player, ws: WebSocket): Room {
  const room = getOrCreateRoom(roomId);

  room.players = room.players.filter((p) => p.id !== player.id);

  room.players.push(player);
  wsToPlayer.set(ws, { roomId, playerId: player.id });

  // Initialize player total if not exists
  if (!(player.id in room.playerTotals)) {
    room.playerTotals[player.id] = 0;
  }

  const connections = roomConnections.get(roomId) || new Set();
  connections.add(ws);
  roomConnections.set(roomId, connections);

  return room;
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

  const room = addPlayerToRoom(roomId, player, ws);

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

  const room = addPlayerToRoom(normalizedRoomId, player, ws);

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

export function handleStartMessage(ws: WebSocket, message: StartMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: 'Room not found',
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  if (room.gameState !== GameState.STOPPED) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: `Cannot start timer: current state is ${room.gameState}`,
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  room.gameState = GameState.RUNNING;
  room.anchorTime = Date.now();
  room.accruedPausedTime = 0;

  const timerStateUpdate: ServerMessage = {
    type: MessageType.TIMER_STATE_UPDATE,
    room,
  };
  broadcastToRoom(normalizedRoomId, timerStateUpdate);
}

export function handlePauseMessage(ws: WebSocket, message: PauseMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: 'Room not found',
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  if (room.gameState !== GameState.RUNNING) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: `Cannot pause timer: current state is ${room.gameState}`,
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  // Calculate time since anchor and add to accrued paused time
  if (room.anchorTime !== null) {
    const elapsed = Date.now() - room.anchorTime;
    room.accruedPausedTime += elapsed;
  }

  room.gameState = GameState.PAUSED;
  room.anchorTime = null;

  const timerStateUpdate: ServerMessage = {
    type: MessageType.TIMER_STATE_UPDATE,
    room,
  };
  broadcastToRoom(normalizedRoomId, timerStateUpdate);
}

export function handleResumeMessage(ws: WebSocket, message: ResumeMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: 'Room not found',
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  if (room.gameState !== GameState.PAUSED) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: `Cannot resume timer: current state is ${room.gameState}`,
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  room.gameState = GameState.RUNNING;
  room.anchorTime = Date.now();

  const timerStateUpdate: ServerMessage = {
    type: MessageType.TIMER_STATE_UPDATE,
    room,
  };
  broadcastToRoom(normalizedRoomId, timerStateUpdate);
}

export function handleStopMessage(ws: WebSocket, message: StopMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: 'Room not found',
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  room.gameState = GameState.STOPPED;
  room.anchorTime = null;
  room.accruedPausedTime = 0;

  const timerStateUpdate: ServerMessage = {
    type: MessageType.TIMER_STATE_UPDATE,
    room,
  };
  broadcastToRoom(normalizedRoomId, timerStateUpdate);
}

export function handleEndTurnMessage(ws: WebSocket, message: EndTurnMessage): void {
  const normalizedRoomId = normalizeRoomId(message.roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: 'Room not found',
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  if (room.gameState !== GameState.RUNNING) {
    const errorMessage: ServerMessage = {
      type: MessageType.ERROR,
      message: `Cannot end turn: current state is ${room.gameState}`,
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  // Calculate total time for this turn
  let turnDuration = 0;
  if (room.anchorTime !== null) {
    turnDuration = Date.now() - room.anchorTime;
  }
  turnDuration += room.accruedPausedTime;

  // Add to player's total
  const currentTotal = room.playerTotals[message.playerId] || 0;
  room.playerTotals[message.playerId] = currentTotal + turnDuration;

  // Reset for next turn
  room.accruedPausedTime = 0;
  room.anchorTime = Date.now();

  const timerStateUpdate: ServerMessage = {
    type: MessageType.TIMER_STATE_UPDATE,
    room,
  };
  broadcastToRoom(normalizedRoomId, timerStateUpdate);
}
