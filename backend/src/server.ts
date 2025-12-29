import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import path from 'path';
import {
  Player,
  Room,
  MessageType,
  ClientMessage,
  ServerMessage,
  JoinMessage,
  LeaveMessage,
} from '../../shared/dist/index.js';

// In-memory storage for rooms
const rooms = new Map<string, Room>();

// Map to track which WebSocket belongs to which player in which room
const wsToPlayer = new Map<WebSocket, { roomId: string; playerId: string }>();

// Map to track which players are in which rooms (for broadcasting)
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

  // Check if player already exists, if so remove old entry
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
      // Clean up empty rooms
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

function handleJoinMessage(ws: WebSocket, message: JoinMessage): void {
  const player: Player = {
    id: message.playerId,
    name: message.playerName,
    joinedAt: Date.now(),
  };

  addPlayerToRoom(message.roomId, player, ws);

  const room = getOrCreateRoom(message.roomId);

  // Send current room state to the joining player
  const roomStateMessage: ServerMessage = {
    type: MessageType.ROOM_STATE,
    room,
  };
  ws.send(JSON.stringify(roomStateMessage));

  // Broadcast to other players that someone joined
  const playerJoinedMessage: ServerMessage = {
    type: MessageType.PLAYER_JOINED,
    player,
  };
  broadcastToRoom(message.roomId, playerJoinedMessage, ws);
}

function handleLeaveMessage(ws: WebSocket, message: LeaveMessage): void {
  removePlayerFromRoom(message.roomId, message.playerId, ws);

  // Broadcast to other players that someone left
  const playerLeftMessage: ServerMessage = {
    type: MessageType.PLAYER_LEFT,
    playerId: message.playerId,
  };
  broadcastToRoom(message.roomId, playerLeftMessage);
}

function handleWebSocketClose(ws: WebSocket): void {
  const playerInfo = wsToPlayer.get(ws);
  if (playerInfo) {
    removePlayerFromRoom(playerInfo.roomId, playerInfo.playerId, ws);

    // Broadcast to other players that someone left
    const playerLeftMessage: ServerMessage = {
      type: MessageType.PLAYER_LEFT,
      playerId: playerInfo.playerId,
    };
    broadcastToRoom(playerInfo.roomId, playerLeftMessage);
  }
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Serve static files from frontend dist
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  ws.on('message', (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case MessageType.JOIN:
          handleJoinMessage(ws, message);
          break;
        case MessageType.LEAVE:
          handleLeaveMessage(ws, message);
          break;
        default:
          console.warn('Unknown message type:', message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ServerMessage = {
        type: MessageType.ERROR,
        message: 'Invalid message format',
      };
      ws.send(JSON.stringify(errorMessage));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    handleWebSocketClose(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
