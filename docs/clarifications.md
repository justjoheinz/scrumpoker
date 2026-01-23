# Scrum Poker - Clarifications & Design Decisions

## Questions Requiring User Input

### 1. Room & Game Control Permissions
**Question:** Who can trigger "Reveal" and "Reset" actions?
- **Option A:** Any player in the room can reveal/reset
- **Option B:** Only the room creator has these privileges
- **Current Assumption:** Option A (any player can control game flow)
- **Rationale:** Matches the collaborative, egalitarian nature of Scrum; simpler implementation (no role management)

### 2. Player Removal Permissions
**Question:** The requirements state "the leave button can also be pressed on behalf of a player by other players."
- **Confirmation Needed:** Any player can remove any other player from the room?
- **Current Assumption:** Yes, any player can remove anyone (including themselves)
- **Concern:** Potential for trolling; consider if this is truly desired behavior

### 3. Deployment Target
**Question:** Where will this application be deployed?
- **Options:**
  - **Railway/Render/DigitalOcean:** Full Node.js server support, WebSockets work perfectly
  - **Vercel:** Serverless platform, WebSockets not supported (would require external WebSocket service)
  - **Custom VPS:** Full control, requires DevOps setup
- **Current Assumption:** Railway or similar platform with Node.js server support
- **Impact:** Architecture is designed for custom Next.js server with Socket.io; won't work on Vercel without modifications

## Design Decisions Made

### 1. Room Management
- **Room Codes:** 6-character alphanumeric codes (e.g., ABC123) generated with `nanoid`
- **Room Creation:** Implicit - first person to join a non-existent code creates the room
- **Room URLs:** `/room/[roomCode]` - shareable URLs for easy joining
- **Room Lifecycle:** Rooms auto-cleanup after 5 minutes of inactivity with zero players

### 2. Player Identity & Reconnection
- **Player ID:** Socket.io connection ID
- **Player Names:** Required on join; unique within room (case-insensitive); no global uniqueness
- **Reconnection Grace Period:** 30 seconds to reconnect before player is removed from room
- **Reconnection Strategy:** Store player info in localStorage; attempt to rejoin with same name/ID

### 3. State Management
- **Server-Side:** In-memory Map of rooms; each room contains Map of players
- **Stateless Constraint:** All data lost on server restart (acceptable per requirements)
- **Client-Side:** React hooks managing local UI state; Socket.io events for server synchronization
- **No Database:** Confirmed - all state ephemeral

### 4. Technology Stack
- **Next.js 14.2:** App Router (modern standard)
- **Socket.io 4.7:** Robust WebSocket library with auto-reconnection and room management
- **TypeScript 5.4:** Strong typing for client-server contract
- **Materialize CSS:** Via CDN (no npm package needed)
- **Custom Server:** Node.js HTTP server running both Next.js and Socket.io

### 5. Card Values & Game Rules
- **Available Cards:** 1, 2, 3, 5, 8, 13, 20, X (as specified)
- **'X' Card:** Represents "Unknown" or "Abstain" (sorted last)
- **Initial Sort Order:** Alphabetical by player name
- **Revealed Sort Order:** By card value (ascending), then by name
- **Card Selection:** Can change selection until reveal; disabled after reveal

### 6. Security & Validation
- **Room Code Validation:** Alphanumeric, 3-10 characters
- **Name Validation:** 1-50 characters, no duplicates in room
- **Rate Limiting:** Not implemented in Phase 1 (can add if needed)
- **Profanity Filtering:** Not implemented (assumes professional/team environment)
- **CORS:** Configured for development; tighten for production

### 7. Player Limits
- **Maximum Players per Room:** 20 players (reasonable for Scrum teams; prevents performance issues)
- **Enforcement:** Server validates on join attempt
- **UI Indication:** Show "Room full" message when limit reached

## Technical Considerations

### WebSocket Event Architecture
All events are strongly typed and documented:

**Client → Server Events:**
- `join-room` - Join/create a room with player name
- `select-card` - Choose a card value
- `reveal-cards` - Trigger reveal for all players
- `reset-game` - Start new round
- `remove-player` - Remove a player (self or others)

**Server → Client Events:**
- `room-state` - Full room state synchronization
- `player-joined` - New player entered room
- `player-left` - Player disconnected/removed
- `card-selected` - Player chose a card (value hidden until reveal)
- `cards-revealed` - All cards flipped face up, sorted order
- `game-reset` - New round started, cards cleared
- `error` - Error message (room full, name taken, etc.)

### Edge Cases Handled
1. **Network Interruption:** 30-second grace period for reconnection
2. **Duplicate Names:** Validation on join; error message to user
3. **Room Not Found:** Redirect to home with error message
4. **Last Player Leaves:** Room persists for 5 minutes (in case of rejoin)
5. **Server Restart:** All rooms lost; users see disconnection and must rejoin
6. **Multiple Browser Tabs:** Each tab = separate player (separate socket connection)

### Known Limitations (Acceptable per Requirements)
1. **No Persistence:** Server restart loses all rooms
2. **No Authentication:** Anyone with room code can join
3. **No Room History:** No record of past games/estimations
4. **No Player Accounts:** Players identified only by name within session
5. **Single Server:** No horizontal scaling (acceptable for small-medium teams)

## Implementation Phases

### Phase 1: Foundation (Critical Path)
- Next.js project setup with TypeScript
- Custom server integrating Socket.io
- Folder structure and type definitions
- Materialize CSS integration

### Phase 2: Server Logic (Core Functionality)
- Room management (create, join, leave)
- Player management (add, remove, update)
- Game logic (select, reveal, reset)
- Socket event handlers

### Phase 3: Basic UI (Minimal Viable Product)
- Home page (create/join room)
- Room page with join modal
- Connection status display

### Phase 4: Game Interactions (Core Features)
- Player list with card status
- Card selector component
- Real-time state synchronization

### Phase 5: Game Flow (Complete Functionality)
- Reveal mechanism
- Reset mechanism
- Player removal
- Sorted display on reveal

### Phase 6: Polish (Production Ready)
- Reconnection handling
- Error states and messages
- Responsive design
- Cross-browser testing

### Phase 7: Enhancements (Optional)
- Copy room URL button
- Activity timestamps
- Flip animations
- Sound effects

## Open Questions for User

1. **Reveal/Reset Permissions:** Should any player be able to trigger reveal/reset, or only the room creator?

2. **Player Removal:** Confirm that any player can remove any other player (not just themselves)?

3. **Deployment Platform:** What's the target hosting platform? (Affects WebSocket implementation)

4. **Card 'X' Meaning:** What does the 'X' card represent in your team's Scrum process?

5. **Visual Preferences:** Any specific color scheme or Materialize theme preferences?

6. **Room Code Format:** Are 6-character codes acceptable, or prefer longer/shorter?

7. **Future Features:** Any planned enhancements beyond the base requirements (e.g., estimation history, timer)?
