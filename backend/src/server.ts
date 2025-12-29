import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { MessageType, ClientMessage, ServerMessage } from '../../shared/dist/index.js';
import { createApp } from './app.js';
import { handleJoinMessage, handleLeaveMessage, handleWebSocketClose } from './roomManager.js';

const app = createApp();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  // TODO: use non-anon method (self documenting named method)
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;

      switch (message.type) {
        case MessageType.JOIN:
          handleJoinMessage(ws, message);
          break;
        case MessageType.LEAVE:
          handleLeaveMessage(ws, message);
          break;
        default:
          throw new Error(`Unknown message type: ${JSON.stringify(message)}`);
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

