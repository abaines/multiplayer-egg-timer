import { MessageType, ServerMessage, Player, GameState, Room } from 'shared';

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

// Timer elements
const timerStateElement = document.getElementById('timerState') as HTMLElement;
const currentTimeElement = document.getElementById('currentTime') as HTMLElement;
const startPauseResumeBtn = document.getElementById('startPauseResumeBtn') as HTMLButtonElement;
const endTurnBtn = document.getElementById('endTurnBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;

// Display room ID
roomIdElement.textContent = roomId || '';

// WebSocket connection
let ws: WebSocket | null = null;
const players = new Map<string, Player>();
let currentGameState: GameState = GameState.STOPPED;
let currentRoom: Room | null = null;
let tickingInterval: number | null = null;

function updateStatus(message: string, className: string) {
  statusMessageElement.textContent = message;
  statusMessageElement.className = `status-message ${className}`;
}

function formatTime(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  return `${seconds.toFixed(1)}s`;
}

function updateTimerDisplay() {
  if (!currentRoom) return;

  timerStateElement.textContent = currentRoom.gameState;

  // Calculate current turn time based on state
  let currentTurnTime = 0;
  
  if (currentRoom.gameState === GameState.RUNNING && currentRoom.anchorTime !== null) {
    const elapsed = Date.now() - currentRoom.anchorTime;
    currentTurnTime = elapsed + currentRoom.accruedPausedTime;
  } else if (currentRoom.gameState === GameState.PAUSED) {
    currentTurnTime = currentRoom.accruedPausedTime;
  }

  currentTimeElement.textContent = formatTime(currentTurnTime);
}

function updateButtonStates() {
  if (!currentRoom) return;

  const state = currentRoom.gameState;

  // Update start/pause/resume button
  switch (state) {
    case GameState.STOPPED:
      startPauseResumeBtn.textContent = 'Start';
      startPauseResumeBtn.disabled = false;
      endTurnBtn.disabled = true;
      stopBtn.disabled = true;
      break;
    case GameState.RUNNING:
      startPauseResumeBtn.textContent = 'Pause';
      startPauseResumeBtn.disabled = false;
      endTurnBtn.disabled = false;
      stopBtn.disabled = false;
      break;
    case GameState.PAUSED:
      startPauseResumeBtn.textContent = 'Resume';
      startPauseResumeBtn.disabled = false;
      endTurnBtn.disabled = true;
      stopBtn.disabled = false;
      break;
  }
}

function startTicking() {
  stopTicking();
  if (currentRoom?.gameState === GameState.RUNNING) {
    tickingInterval = window.setInterval(updateTimerDisplay, 100);
  }
}

function stopTicking() {
  if (tickingInterval !== null) {
    clearInterval(tickingInterval);
    tickingInterval = null;
  }
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

    const rightInfo = document.createElement('div');
    rightInfo.style.display = 'flex';
    rightInfo.style.flexDirection = 'column';
    rightInfo.style.alignItems = 'flex-end';
    rightInfo.style.gap = '4px';

    // Show total time if available
    if (currentRoom?.playerTotals && currentRoom.playerTotals[player.id]) {
      const totalSpan = document.createElement('span');
      totalSpan.className = 'player-total';
      totalSpan.textContent = `Total: ${formatTime(currentRoom.playerTotals[player.id])}`;
      rightInfo.appendChild(totalSpan);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'player-time';
    const joinTime = new Date(player.joinedAt);
    timeSpan.textContent = `Joined: ${joinTime.toLocaleTimeString()}`;
    rightInfo.appendChild(timeSpan);

    li.appendChild(nameSpan);
    li.appendChild(rightInfo);
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
        currentRoom = message.room;
        currentGameState = message.room.gameState;
        renderPlayers();
        updateTimerDisplay();
        updateButtonStates();
        if (message.room.gameState === GameState.RUNNING) {
          startTicking();
        } else {
          stopTicking();
        }
        break;

      case MessageType.PLAYER_JOINED:
        players.set(message.player.id, message.player);
        renderPlayers();
        break;

      case MessageType.PLAYER_LEFT:
        players.delete(message.playerId);
        renderPlayers();
        break;

      case MessageType.TIMER_STATE_UPDATE:
        currentRoom = message.room;
        currentGameState = message.room.gameState;
        renderPlayers();
        updateTimerDisplay();
        updateButtonStates();
        if (message.room.gameState === GameState.RUNNING) {
          startTicking();
        } else {
          stopTicking();
        }
        break;

      case MessageType.ERROR:
        updateStatus(`Error: ${message.message}`, 'disconnected');
        break;

      default:
        console.warn(`Unknown message type: ${JSON.stringify(message)}`);
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

  stopTicking();

  // Clear session storage but keep playerId in localStorage
  sessionStorage.removeItem('roomId');
  sessionStorage.removeItem('playerName');
  sessionStorage.removeItem('playerId');

  window.location.href = '/';
}

// Timer button handlers
startPauseResumeBtn.addEventListener('click', () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  let messageType: MessageType;
  
  if (currentGameState === GameState.STOPPED) {
    messageType = MessageType.START;
  } else if (currentGameState === GameState.RUNNING) {
    messageType = MessageType.PAUSE;
  } else {
    messageType = MessageType.RESUME;
  }

  ws.send(JSON.stringify({
    type: messageType,
    roomId: roomId!,
  }));
});

endTurnBtn.addEventListener('click', () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type: MessageType.END_TURN,
    roomId: roomId!,
  }));
});

stopBtn.addEventListener('click', () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type: MessageType.STOP,
    roomId: roomId!,
  }));
});

leaveBtn.addEventListener('click', leaveRoom);

window.addEventListener('beforeunload', () => {
  stopTicking();
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(createLeaveMessage()));
  }
});

connectWebSocket();
