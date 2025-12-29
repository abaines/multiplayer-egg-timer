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

// Handle form submission
const form = document.getElementById('joinForm') as HTMLFormElement;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
  const roomIdInput = document.getElementById('roomId') as HTMLInputElement;

  const playerName = playerNameInput.value.trim();
  const roomId = roomIdInput.value.trim();

  if (!playerName || !roomId) {
    alert('Please enter both your name and a room ID');
    return;
  }

  const playerId = getOrCreatePlayerId();

  // Store room info in sessionStorage for the lobby page
  sessionStorage.setItem('roomId', roomId);
  sessionStorage.setItem('playerName', playerName);
  sessionStorage.setItem('playerId', playerId);

  // Navigate to lobby
  window.location.href = '/lobby.html';
});
