import { MessageType, ServerMessage } from 'shared';

function generateUUID(): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    throw new Error('crypto.randomUUID is not supported in this browser');
  }
  return crypto.randomUUID();
}

function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem('playerId');
  if (!playerId) {
    playerId = generateUUID();
    localStorage.setItem('playerId', playerId);
  }
  return playerId;
}

// DOM elements
const form = document.getElementById('joinForm') as HTMLFormElement;
const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
const roomIdInput = document.getElementById('roomId') as HTMLInputElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;

// Load saved values from localStorage
const savedName = localStorage.getItem('playerName');
const savedRoomId = localStorage.getItem('roomId');

if (savedName) {
  playerNameInput.value = savedName;
}
if (savedRoomId) {
  roomIdInput.value = savedRoomId;
}

// Update button text based on room ID input
function updateButtonText(): void {
  const roomId = roomIdInput.value.trim();
  if (roomId) {
    submitBtn.textContent = 'Join Room';
  } else {
    submitBtn.textContent = 'Create Room';
  }
}

// Initialize button text
updateButtonText();

// Update button text on input change
roomIdInput.addEventListener('input', updateButtonText);

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const playerName = playerNameInput.value.trim();
  const roomId = roomIdInput.value.trim();

  if (!playerName) {
    alert('Please enter your name');
    return;
  }

  const playerId = getOrCreatePlayerId();

  // Save to localStorage for next time
  localStorage.setItem('playerName', playerName);
  if (roomId) {
    localStorage.setItem('roomId', roomId);
  }

  // Store room info in sessionStorage for the lobby page
  sessionStorage.setItem('playerName', playerName);
  sessionStorage.setItem('playerId', playerId);

  if (roomId) {
    // Join existing room
    sessionStorage.setItem('roomId', roomId);
    window.location.href = '/lobby.html';
  } else {
    // Create new room via WebSocket
    createRoom(playerId, playerName);
  }
});

function createRoom(playerId: string, playerName: string): void {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    const createMessage = {
      type: MessageType.CREATE_ROOM,
      playerId,
      playerName,
    };
    ws.send(JSON.stringify(createMessage));
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as ServerMessage;

      if (message.type === MessageType.ROOM_CREATED) {
        // Store the created room ID
        const roomId = message.roomId;
        sessionStorage.setItem('roomId', roomId);
        localStorage.setItem('roomId', roomId);

        // Close WebSocket and navigate to lobby
        ws.close();
        window.location.href = '/lobby.html';
      } else if (message.type === MessageType.ERROR) {
        alert(`Error creating room: ${message.message}`);
        ws.close();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    alert('Failed to connect to server. Please try again.');
  };

  ws.onclose = () => {
    console.log('WebSocket closed');
  };
}
