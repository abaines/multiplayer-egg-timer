import { MessageType, ServerMessage, Player } from 'shared';

// Get room and player info from sessionStorage
const roomId = sessionStorage.getItem('roomId');
const playerName = sessionStorage.getItem('playerName');
const playerId = sessionStorage.getItem('playerId');

if (!roomId || !playerName || !playerId) {
  // Redirect back to index if no session data
  window.location.href = '/';
}

// DOM elements
const roomIdElement = document.getElementById('roomId') as HTMLElement;
const playerListElement = document.getElementById('playerList') as HTMLUListElement;
const statusMessageElement = document.getElementById('statusMessage') as HTMLElement;
const leaveBtn = document.getElementById('leaveBtn') as HTMLButtonElement;

// Display room ID
roomIdElement.textContent = roomId || '';

// WebSocket connection
let ws: WebSocket | null = null;
const players = new Map<string, Player>();

function updateStatus(message: string, className: string) {
  statusMessageElement.textContent = message;
  statusMessageElement.className = `status-message ${className}`;
}

function renderPlayers() {
  playerListElement.innerHTML = '';

  if (players.size === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = 'No players yet...';
    emptyLi.style.border = 'none';
    emptyLi.style.background = 'transparent';
    emptyLi.style.color = '#888';
    playerListElement.appendChild(emptyLi);
    return;
  }

  players.forEach((player) => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.name;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'player-time';
    const joinTime = new Date(player.joinedAt);
    timeSpan.textContent = `Joined: ${joinTime.toLocaleTimeString()}`;

    li.appendChild(nameSpan);
    li.appendChild(timeSpan);
    playerListElement.appendChild(li);
  });
}

function handleServerMessage(event: MessageEvent) {
  try {
    const message = JSON.parse(event.data) as ServerMessage;

    switch (message.type) {
      case MessageType.ROOM_STATE:
        players.clear();
        message.room.players.forEach((player) => {
          players.set(player.id, player);
        });
        renderPlayers();
        break;

      case MessageType.PLAYER_JOINED:
        players.set(message.player.id, message.player);
        renderPlayers();
        break;

      case MessageType.PLAYER_LEFT:
        players.delete(message.playerId);
        renderPlayers();
        break;

      case MessageType.ERROR:
        updateStatus(`Error: ${message.message}`, 'disconnected');
        break;

      default:
        throw new Error(`Unknown message type: ${JSON.stringify(message)}`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

function createLeaveMessage() {
  return {
    type: MessageType.LEAVE,
    roomId: roomId!,
    playerId: playerId!,
  };
}

function connectWebSocket() {
  updateStatus('Connecting...', 'connecting');

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    updateStatus('Connected', 'connected');

    const joinMessage = {
      type: MessageType.JOIN,
      roomId: roomId!,
      playerId: playerId!,
      playerName: playerName!,
    };
    ws?.send(JSON.stringify(joinMessage));
  };

  ws.onmessage = handleServerMessage;

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('Connection error', 'disconnected');
  };

  ws.onclose = () => {
    updateStatus('Disconnected', 'disconnected');
    ws = null;

    const reconnectDelay = 3000;
    setTimeout(() => {
      if (!ws) {
        connectWebSocket();
      }
    }, reconnectDelay);
  };
}

function leaveRoom() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(createLeaveMessage()));
    ws.close();
  }

  sessionStorage.removeItem('roomId');
  sessionStorage.removeItem('playerName');
  sessionStorage.removeItem('playerId');

  window.location.href = '/';
}

leaveBtn.addEventListener('click', leaveRoom);

window.addEventListener('beforeunload', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(createLeaveMessage()));
  }
});

connectWebSocket();
