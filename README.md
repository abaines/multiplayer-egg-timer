# multiplayer-egg-timer

A real-time multiplayer egg timer for board games to measure how long each player takes.

## Architecture

This is a monorepo with three packages:

- **frontend/** - Vite + TypeScript web application
- **backend/** - Node.js + Express + WebSocket server
- **shared/** - Shared TypeScript protocol types

## Features

- ✅ Join/leave rooms with real-time presence updates
- ✅ WebSocket-based real-time communication
- ✅ UUID-based player identification (stored in localStorage)
- ✅ Ephemeral in-memory room state
- ✅ Automatic disconnect detection
- ✅ No authentication required

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

## Development

### Install Dependencies

```bash
npm ci
```


### Build All Packages

```bash
npm run build
```

### Run the Application

```bash
npm run start:backend
```

The server runs on `http://localhost:3000` by default.
The backend serves the built frontend, so you can access the full application at this URL.

### Frontend Development with Hot Reload (Optional)

For active frontend development with hot reload:

```bash
npm run dev:frontend
```

This runs Vite's dev server (typically on `http://localhost:5173`) with hot module replacement.
You'll still need the backend running in a separate terminal for WebSocket functionality.

### Linting and Formatting

```bash
# Check linting
npm run lint

# Fix formatting
npm run format
```

## Docker

Build and run using Docker:

```bash
# Build the image
docker build -t multiplayer-egg-timer .

# Run the container
docker run -p 3000:3000 multiplayer-egg-timer
```

The multi-stage Dockerfile builds both frontend and backend into a single optimized image.

## GitHub Actions

A manual workflow is available for building and pushing to GitHub Container Registry:

1. Go to Actions tab in GitHub
2. Select "Build and Push Docker Image"
3. Click "Run workflow"
4. Optionally specify a tag (default: latest)

## Project Structure

```
.
├── frontend/           # Vite + TypeScript frontend
│   ├── index.html     # Join page
│   ├── lobby.html     # Lobby/participants page
│   └── src/
│       ├── index.ts   # Join page logic
│       ├── lobby.ts   # Lobby page logic
│       └── styles.css # Shared styles
├── backend/           # Express + WebSocket backend
│   └── src/
│       └── server.ts  # Main server with room management
├── shared/            # Shared protocol types
│   └── src/
│       └── protocol.ts # WebSocket message types
├── Dockerfile         # Multi-stage build
└── .github/
    └── workflows/
        └── docker-manual.yml # Manual CI workflow
```

## Usage

1. Navigate to `http://localhost:3000`
2. Enter your name and a room ID
3. Click "Join Room"
4. Share the room ID with other players
5. See participants join and leave in real-time

## How to Check Versions

**In Browser:**
1. Open the browser's developer console (F12)
2. Version information is automatically logged on page load with:
   - Git SHA and branch
   - Build timestamp
   - Backend version comparison

