// UUID generation and storage
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
