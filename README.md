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

### Run Backend Server

```bash
npm run start:backend
```

The server runs on `http://localhost:3000` by default.

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

## Version Information & QA Verification

The application includes build-time version information for both frontend and backend.
This helps QA and power users verify which version is deployed.

### How to Check Versions

**Frontend (In Browser):**
1. Open the browser's developer console (F12)
2. Version information is automatically logged on page load with:
   - Git SHA and branch
   - Build timestamp
   - Backend version comparison

**Backend Health Endpoint:**
```bash
curl http://localhost:3000/health
```

Returns JSON with version info:
```json
{
  "status": "ok",
  "version": {
    "buildTime": "2025-12-30T04:25:42.619Z",
    "gitSha": "b252fa1788157e29deeaa7dfb3a4409ec424e277",
    "gitShortSha": "b252fa1",
    "gitBranch": "copilot/remember-user-name-room-id"
  }
}
```

**Hidden in HTML (for automation):**
The frontend HTML includes data attributes:
```html
<body data-version="b252fa1" data-build-time="2025-12-30T04:25:42.639Z">
```

### Common Practices for Version Display

1. **Console Logging** (Implemented): Automatic version info in browser console on page load
2. **Health/Version Endpoint** (Implemented): `/health` endpoint with version metadata
3. **HTML Meta/Data Attributes** (Implemented): Hidden in DOM for test automation
4. **UI Footer/About Modal**: Optional - add visible version in UI footer
5. **DevTools Panel**: Optional - create custom DevTools panel for debugging
6. **`__version` Global**: Optional - expose `window.__version` for programmatic access

### Version Mismatch Detection

The frontend automatically checks if it matches the backend version on load.
If versions differ, a warning is logged to the console to help identify deployment issues.

