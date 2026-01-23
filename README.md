# Scrum Poker

A real-time Scrum Poker estimation tool for agile teams, built with Next.js, TypeScript, and Socket.io.

## Features

- **Real-time Collaboration**: Multiple players can join rooms and see updates instantly
- **Card Selection**: Players choose from cards valued 1, 2, 3, 5, 8, 13, 20, and X
- **Face-Down Cards**: Selected cards remain hidden until reveal
- **Reveal & Reset**: Any player can reveal cards or reset for a new round
- **Player Management**: Players can remove themselves or others from the room
- **Auto-Reconnection**: 30-second grace period for network interruptions
- **Stateless Design**: No database required, all state in memory
- **Responsive UI**: Works on mobile, tablet, and desktop

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Socket.io** for WebSocket communication
- **Materialize CSS** for styling
- **Custom Node.js server** for WebSocket integration

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scrumpoker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Room

1. Click "Create Room" on the home page
2. Share the generated room URL with your team
3. Enter your name to join the room

### Joining a Room

1. Receive a room code/URL from a teammate
2. Enter the code on the home page or navigate to the URL directly
3. Enter your name to join

### Playing

1. Select a card from the available options (1, 2, 3, 5, 8, 13, 20, X)
2. Wait for other players to select their cards
3. Any player can click "Reveal Cards" to show all selections
4. Cards are sorted by value after reveal
5. Click "Reset Game" to start a new round

### Removing Players

- Click the trash icon next to any player name to remove them from the room
- Players can remove themselves or others

## Architecture

### Server-Side

- **Custom Next.js Server** (`src/server.ts`): Integrates Next.js with Socket.io
- **Room Manager** (`src/lib/game/room-manager.ts`): In-memory room state management
- **Game Logic** (`src/lib/game/game-logic.ts`): Business rules for reveal, reset, and sorting
- **Socket Handlers** (`src/lib/socket/handlers.ts`): WebSocket event processing

### Client-Side

- **useSocket Hook** (`src/hooks/useSocket.ts`): Socket.io connection management
- **useGameState Hook** (`src/hooks/useGameState.ts`): Game state synchronization
- **Components**: Modular React components for UI elements

### State Management

- **In-Memory Storage**: All rooms and players stored in server memory
- **Automatic Cleanup**: Empty rooms cleaned up after 5 minutes of inactivity
- **Reconnection**: 30-second grace period for disconnected players

## Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t scrumpoker .

# Run the container
docker run -p 3000:3000 scrumpoker
```

Or use Docker Compose:

```bash
docker-compose up -d
```

### Production Build

Build for production:

```bash
npm run build
NODE_ENV=production npm start
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Project Structure

```
scrumpoker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with Materialize CSS
│   │   ├── page.tsx           # Home page
│   │   └── room/[roomCode]/   # Dynamic room pages
│   ├── components/            # React components
│   │   ├── AlertBanner.tsx
│   │   ├── CardSelector.tsx
│   │   ├── GameControls.tsx
│   │   ├── JoinRoomModal.tsx
│   │   └── PlayerList.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useGameState.ts
│   │   └── useSocket.ts
│   ├── lib/                   # Shared libraries
│   │   ├── game/
│   │   │   ├── game-logic.ts
│   │   │   └── room-manager.ts
│   │   └── socket/
│   │       └── handlers.ts
│   ├── types/                 # TypeScript definitions
│   │   ├── game.ts
│   │   └── socket-events.ts
│   └── server.ts              # Custom server entry point
├── docs/                      # Documentation
│   ├── clarifications.md
│   └── requirements.md
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

### Key Configuration Files

- `tsconfig.json`: TypeScript compiler options
- `next.config.js`: Next.js configuration
- `package.json`: Dependencies and scripts

## Testing

### Manual Testing Checklist

1. **Basic Game Flow**
   - [ ] Create room and join with name
   - [ ] Open incognito/different browser and join same room
   - [ ] Both players select different cards
   - [ ] Reveal cards and verify sorting
   - [ ] Reset game and verify cards cleared

2. **Multiple Players**
   - [ ] Join with 5+ players
   - [ ] All select cards
   - [ ] Reveal and verify sort order
   - [ ] Remove a player and verify update

3. **Reconnection**
   - [ ] Join room, disconnect network briefly
   - [ ] Verify auto-reconnection within 30 seconds
   - [ ] Disconnect for >30 seconds and verify removal

4. **Edge Cases**
   - [ ] Try joining with duplicate name (should fail)
   - [ ] Try joining non-existent room
   - [ ] Refresh page and verify auto-rejoin
   - [ ] Test on mobile browser

### Test Scenarios

See [docs/clarifications.md](docs/clarifications.md) for detailed test scenarios.

## Limitations

- **No Persistence**: All rooms lost on server restart (by design)
- **No Authentication**: Anyone with room code can join
- **Single Server**: No horizontal scaling support
- **No Room History**: Past games not recorded

## Future Enhancements

- Copy room URL button
- Estimation statistics and history
- Timer for estimation rounds
- Card flip animations
- Dark mode toggle
- Export results as CSV
- Custom card values per room
- Player avatars
- Room passwords

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues or questions, please open a GitHub issue.
