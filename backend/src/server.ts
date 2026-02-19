import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { createApp } from './app.js';
import { handleMessage, handleWebSocketClose } from './roomManager.js';

const app = createApp();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  ws.on('message', (data: Buffer) => {
    handleMessage(ws, data);
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
