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

function connectWebSocket() {
  updateStatus('Connecting...', 'connecting');

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    updateStatus('Connected', 'connected');

    // Send join message
    const joinMessage = {
      type: MessageType.JOIN,
      roomId: roomId!,
      playerId: playerId!,
      playerName: playerName!,
    };
    ws?.send(JSON.stringify(joinMessage));
  };

  ws.onmessage = (event) => {
    try {
      const message: ServerMessage = JSON.parse(event.data);

      switch (message.type) {
        case MessageType.ROOM_STATE:
          // Initial room state
          players.clear();
          message.room.players.forEach((player) => {
            players.set(player.id, player);
          });
          renderPlayers();
          break;

        case MessageType.PLAYER_JOINED:
          // Someone joined
          players.set(message.player.id, message.player);
          renderPlayers();
          break;

        case MessageType.PLAYER_LEFT:
          // Someone left
          players.delete(message.playerId);
          renderPlayers();
          break;

        case MessageType.ERROR:
          updateStatus(`Error: ${message.message}`, 'disconnected');
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('Connection error', 'disconnected');
  };

  ws.onclose = () => {
    updateStatus('Disconnected', 'disconnected');
    ws = null;

    // Attempt to reconnect after 3 seconds
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
    const leaveMessage = {
      type: MessageType.LEAVE,
      roomId: roomId!,
      playerId: playerId!,
    };
    ws.send(JSON.stringify(leaveMessage));
    ws.close();
  }

  // Clear session data
  sessionStorage.removeItem('roomId');
  sessionStorage.removeItem('playerName');
  sessionStorage.removeItem('playerId');

  // Redirect to index
  window.location.href = '/';
}

// Event listeners
leaveBtn.addEventListener('click', leaveRoom);

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const leaveMessage = {
      type: MessageType.LEAVE,
      roomId: roomId!,
      playerId: playerId!,
    };
    ws.send(JSON.stringify(leaveMessage));
  }
});

// Connect to WebSocket
connectWebSocket();
