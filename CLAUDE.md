# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time Scrum Poker estimation tool using Next.js 14 (App Router), TypeScript, Socket.io, and Materialize CSS. The application is **stateless** - all room and player data exists in memory only.

## Development Commands

```bash
# Development server (custom server with Socket.io + Next.js hot reload)
npm run dev

# Production build
npm run build

# Production server (uses tsx to run TypeScript directly)
npm start

# Linting
npm run lint

# Docker
docker-compose build
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Architecture

### Custom Next.js Server Pattern

**Critical**: This project uses a **custom Node.js server** to integrate Socket.io with Next.js, defined in `src/server.ts`. The server:
- Intercepts HTTP requests and passes them to Next.js
- Attaches Socket.io to the same HTTP server
- Enables WebSocket communication alongside Next.js routing
- Runs with `tsx` in both development and production (handles TypeScript and path aliases)

### Path Aliases

TypeScript path aliases using `@/` are configured in `tsconfig.json`:
- `@/types` → `src/types`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/components` → `src/components`

**Important**: When adding new server-side code that uses path aliases, ensure `tsconfig.json` is copied to Docker (already configured in Dockerfile).

### State Management Architecture

**In-Memory Only**: No database, no persistence. Server restart = all rooms lost (by design).

```
Server State (src/lib/game/room-manager.ts)
└── rooms: Map<roomCode, Room>
    └── Room
        ├── players: Map<playerId, Player>
        ├── isRevealed: boolean
        └── lastActivity: timestamp

Client State (src/hooks/useGameState.ts)
└── Synchronized via Socket.io events
    ├── players: Player[]
    ├── isRevealed: boolean
    ├── currentPlayerId: string
    └── removedFromRoom: notification state
```

**Cleanup**: Empty rooms are automatically cleaned up after 5 minutes of inactivity (configured in `src/lib/game/room-manager.ts:startCleanupTask()`).

### Socket.io Event Flow

All WebSocket events are strongly typed in `src/types/socket-events.ts`.

**Client → Server Events:**
- `join-room` - Join/create room with player name
- `select-card` - Choose a card (1,2,3,5,8,13,20,X)
- `reveal-cards` - Flip all cards face up (any player can trigger)
- `reset-game` - Clear cards and start new round (any player can trigger)
- `remove-player` - Remove player from room (any player can remove anyone)

**Server → Client Events:**
- `room-state` - Full state synchronization on join
- `player-joined` / `player-left` - Player lifecycle updates
- `card-selected` - Card chosen (value hidden until reveal)
- `cards-revealed` - All cards shown, sorted by value
- `game-reset` - New round started
- `removed-from-room` - **Important**: Sent before disconnect to show friendly removal UI

**Reconnection Pattern:**
- 30-second grace period for disconnected players (see `RECONNECTION_GRACE_PERIOD` in types/game.ts)
- Player data stored in localStorage for auto-rejoin
- If player rejoins within grace period, maintains same state
- After timeout, player is removed and must rejoin with new name

### Key Implementation Patterns

**1. Room Manager (`src/lib/game/room-manager.ts`)**
- Central in-memory state store
- All room operations (create, join, leave, update)
- Thread-safe through single-threaded Node.js event loop

**2. Game Logic (`src/lib/game/game-logic.ts`)**
- Business rules separate from state management
- Handles card reveal logic and player sorting
- Sorting: revealed = by card value → name, not revealed = alphabetically by name

**3. Socket Handlers (`src/lib/socket/handlers.ts`)**
- Event handling and WebSocket lifecycle
- Disconnection grace period implementation
- **Critical**: When removing players, emit `removed-from-room` event BEFORE disconnecting them (100ms delay ensures message delivery)

**4. Client Hooks**
- `useSocket`: WebSocket connection management, emits events
- `useGameState`: Subscribes to server events, maintains synchronized state
- Both hooks return memoized callbacks to prevent unnecessary re-renders

**5. Navigation Pattern**
- Navigation component is client-side and conditionally shows room info
- Room info (code, player name, player count) displayed in header when in room
- Each page (`page.tsx`, `room/[roomCode]/page.tsx`) renders its own Navigation component

## Component Architecture

**Server Components** (default in App Router):
- `src/app/layout.tsx` - Root layout (minimal, no nav)

**Client Components** (`'use client'`):
- Pages: `page.tsx`, `room/[roomCode]/page.tsx`
- All components in `src/components/` are client components
- Navigation, modals, game controls all client-side due to interactivity

**Component Responsibilities:**
- `Navigation` - Dynamic header with room info
- `JoinRoomModal` - Name entry and validation
- `PlayerList` - Player display with remove buttons
- `CardSelector` - Card selection UI (1,2,3,5,8,13,20,X)
- `GameControls` - Reveal/Reset buttons with validation
- `RemovedFromRoom` - Full-screen overlay when player is removed (shows reason, allows rejoin)
- `AlertBanner` - Connection status and error messages

## Important Technical Details

### TypeScript in Production

**Why tsx in production?** Path aliases (`@/`) don't resolve in compiled JavaScript. Using `tsx` in production:
- Handles TypeScript directly
- Resolves path aliases at runtime
- Simplifies deployment (no separate compilation step for server code)
- Added to production dependencies in `package.json`

### Materialize CSS Integration

- Loaded via CDN in `src/app/layout.tsx`
- Material Icons for UI elements
- Custom styles in `src/app/globals.css`
- No JavaScript initialization needed for basic components

### Docker Deployment

**Multi-stage build** in `Dockerfile`:
1. Builder stage: Install all deps + build Next.js
2. Runner stage: Install production deps only + copy built assets

**Critical files copied to production:**
- `.next/` - Next.js build output
- `src/` - TypeScript source (for tsx)
- `tsconfig.json` - Required for tsx path resolution
- `next.config.js`, `package.json`

`.dockerignore` prevents copying local `node_modules` (platform-specific binaries).

## Room Code Generation

Uses `nanoid` for secure, URL-friendly 6-character room codes:
- Uppercase alphanumeric
- Generated client-side on "Create Room"
- No collision checking (statistically improbable with 6 chars)
- Room created implicitly on first join

## Player Removal Flow

**Important UX consideration:**
1. When player is removed, server emits `removed-from-room` event to that player
2. 100ms delay before actual disconnect (ensures message delivery)
3. Client shows `RemovedFromRoom` overlay with:
   - Reason (self-removal vs removed by others)
   - Room code and URL
   - Rejoin button (clears localStorage and reloads)
4. Never show generic "Connection lost" for intentional removals

## Testing Locally

To test multiplayer functionality:
1. Start server: `npm run dev`
2. Open `http://localhost:3000` in normal browser
3. Create room (generates code like `ABC123`)
4. Open `http://localhost:3000/room/ABC123` in incognito/different browser
5. Join with different name
6. Both clients will see real-time updates

## Common Modifications

**Adding a new card value:**
1. Update `CardValue` type in `src/types/game.ts`
2. Add to `CARD_VALUES` array
3. Add sort order to `CARD_ORDER` object

**Changing reconnection timeout:**
- Update `RECONNECTION_GRACE_PERIOD` in `src/types/game.ts`

**Changing room cleanup timeout:**
- Update `ROOM_CLEANUP_TIMEOUT` in `src/types/game.ts`

**Adding a new Socket.io event:**
1. Define payload types in `src/types/socket-events.ts`
2. Add event name to `ClientEvents` or `ServerEvents`
3. Implement handler in `src/lib/socket/handlers.ts`
4. Subscribe in `src/hooks/useGameState.ts` if client needs to react
5. Don't forget to add cleanup in `useEffect` return statement

## Deployment Notes

- Designed for Docker deployment on VPS with Node.js support
- Port 3000 exposed (configurable via `PORT` env var)
- No environment variables required (all config in code)
- WebSockets require persistent connections (not compatible with serverless platforms like Vercel)
- Server restart loses all room state (by design for stateless requirement)
