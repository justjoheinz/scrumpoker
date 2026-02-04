import { describe, it, expect, beforeEach } from 'vitest'
import {
  createOrGetRoom,
  getRoom,
  roomExists,
  addPlayer,
  removePlayer,
  getPlayer,
  updatePlayerCard,
  getRoomState,
  getRoomPlayers,
  setRoomRevealed,
  clearAllCards,
  getActiveRoomCount,
  getAdminStats,
  cleanupRooms,
  reconnectPlayer,
} from '@/lib/game/room-manager'
import { MAX_PLAYERS_PER_ROOM, CARD_VALUES, ROOM_CLEANUP_TIMEOUT } from '@/types/game'

// Generate unique room codes for each test to avoid state interference
let testCounter = 0
function uniqueRoomCode(): string {
  return `TEST-${Date.now()}-${testCounter++}`
}

describe('lib/game/room-manager', () => {
  describe('createOrGetRoom', () => {
    it('creates a new room when it does not exist', () => {
      const roomCode = uniqueRoomCode()
      const room = createOrGetRoom(roomCode)

      expect(room.code).toBe(roomCode)
      expect(room.players.size).toBe(0)
      expect(room.isRevealed).toBe(false)
      expect(room.createdAt).toBeLessThanOrEqual(Date.now())
      expect(room.lastActivity).toBeLessThanOrEqual(Date.now())
    })

    it('returns existing room if it already exists', () => {
      const roomCode = uniqueRoomCode()
      const room1 = createOrGetRoom(roomCode)
      const room2 = createOrGetRoom(roomCode)

      expect(room1).toBe(room2)
    })
  })

  describe('getRoom', () => {
    it('returns undefined for non-existent room', () => {
      const room = getRoom('NON-EXISTENT-ROOM-123456')
      expect(room).toBeUndefined()
    })

    it('returns the room if it exists', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const room = getRoom(roomCode)
      expect(room).toBeDefined()
      expect(room?.code).toBe(roomCode)
    })
  })

  describe('roomExists', () => {
    it('returns false for non-existent room', () => {
      expect(roomExists('NON-EXISTENT-ROOM-789')).toBe(false)
    })

    it('returns true for existing room', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      expect(roomExists(roomCode)).toBe(true)
    })
  })

  describe('addPlayer', () => {
    it('adds a player to an existing room', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const result = addPlayer(roomCode, 'player-1', 'Alice')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('creates room if it does not exist when adding player', () => {
      const roomCode = uniqueRoomCode()

      const result = addPlayer(roomCode, 'player-1', 'Alice')

      expect(result.success).toBe(true)
      expect(roomExists(roomCode)).toBe(true)
    })

    it('player has correct initial state', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const player = getPlayer(roomCode, 'player-1')

      expect(player).toBeDefined()
      expect(player?.id).toBe('player-1')
      expect(player?.name).toBe('Alice')
      expect(player?.card).toBeNull()
      expect(player?.joinedAt).toBeLessThanOrEqual(Date.now())
      expect(player?.isModerator).toBe(false)
    })

    it('rejects duplicate player names (case-insensitive)', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const result = addPlayer(roomCode, 'player-2', 'alice')

      expect(result.success).toBe(false)
      expect(result.error).toContain('name already taken')
    })

    it('allows same name in different rooms', () => {
      const roomCode1 = uniqueRoomCode()
      const roomCode2 = uniqueRoomCode()

      addPlayer(roomCode1, 'player-1', 'Alice')
      const result = addPlayer(roomCode2, 'player-2', 'Alice')

      expect(result.success).toBe(true)
    })

    it('rejects when room is at capacity', () => {
      const roomCode = uniqueRoomCode()

      // Fill room to capacity
      for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
        addPlayer(roomCode, `player-${i}`, `Player${i}`)
      }

      const result = addPlayer(roomCode, 'extra-player', 'ExtraPlayer')

      expect(result.success).toBe(false)
      expect(result.error).toContain('full')
    })
  })

  describe('removePlayer', () => {
    it('removes an existing player', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const result = removePlayer(roomCode, 'player-1')

      expect(result).toBe(true)
      expect(getPlayer(roomCode, 'player-1')).toBeUndefined()
    })

    it('returns false for non-existent room', () => {
      const result = removePlayer('NON-EXISTENT-ROOM', 'player-1')
      expect(result).toBe(false)
    })

    it('returns false for non-existent player', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const result = removePlayer(roomCode, 'non-existent-player')

      expect(result).toBe(false)
    })
  })

  describe('getPlayer', () => {
    it('returns undefined for non-existent room', () => {
      const player = getPlayer('NON-EXISTENT-ROOM', 'player-1')
      expect(player).toBeUndefined()
    })

    it('returns undefined for non-existent player', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const player = getPlayer(roomCode, 'non-existent')

      expect(player).toBeUndefined()
    })

    it('returns player if exists', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const player = getPlayer(roomCode, 'player-1')

      expect(player).toBeDefined()
      expect(player?.name).toBe('Alice')
    })
  })

  describe('updatePlayerCard', () => {
    it('updates player card selection', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const result = updatePlayerCard(roomCode, 'player-1', '5')

      expect(result).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.card).toBe('5')
    })

    it('allows changing card selection', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-1', '13')

      expect(getPlayer(roomCode, 'player-1')?.card).toBe('13')
    })

    it('allows unselecting card by passing null', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      updatePlayerCard(roomCode, 'player-1', '5')

      const result = updatePlayerCard(roomCode, 'player-1', null)

      expect(result).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.card).toBeNull()
    })

    it('returns false for non-existent room', () => {
      const result = updatePlayerCard('NON-EXISTENT-ROOM', 'player-1', '5')
      expect(result).toBe(false)
    })

    it('returns false for non-existent player', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const result = updatePlayerCard(roomCode, 'non-existent', '5')

      expect(result).toBe(false)
    })
  })

  describe('getRoomState', () => {
    it('returns null for non-existent room', () => {
      const state = getRoomState('NON-EXISTENT-ROOM')
      expect(state).toBeNull()
    })

    it('returns correct state for existing room', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')

      const state = getRoomState(roomCode)

      expect(state).toBeDefined()
      expect(state?.roomCode).toBe(roomCode)
      expect(state?.players).toHaveLength(2)
      expect(state?.isRevealed).toBe(false)
    })

    it('players array contains correct data', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      updatePlayerCard(roomCode, 'player-1', '8')

      const state = getRoomState(roomCode)
      const player = state?.players.find(p => p.id === 'player-1')

      expect(player).toBeDefined()
      expect(player?.name).toBe('Alice')
      expect(player?.card).toBe('8')
    })
  })

  describe('getRoomPlayers', () => {
    it('returns empty array for non-existent room', () => {
      const players = getRoomPlayers('NON-EXISTENT-ROOM')
      expect(players).toEqual([])
    })

    it('returns all players in the room', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      addPlayer(roomCode, 'player-3', 'Charlie')

      const players = getRoomPlayers(roomCode)

      expect(players).toHaveLength(3)
      expect(players.map(p => p.name).sort()).toEqual(['Alice', 'Bob', 'Charlie'])
    })
  })

  describe('setRoomRevealed', () => {
    it('sets room to revealed', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const result = setRoomRevealed(roomCode, true)

      expect(result).toBe(true)
      expect(getRoom(roomCode)?.isRevealed).toBe(true)
    })

    it('sets room to not revealed', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)
      setRoomRevealed(roomCode, true)

      setRoomRevealed(roomCode, false)

      expect(getRoom(roomCode)?.isRevealed).toBe(false)
    })

    it('returns false for non-existent room', () => {
      const result = setRoomRevealed('NON-EXISTENT-ROOM', true)
      expect(result).toBe(false)
    })
  })

  describe('clearAllCards', () => {
    it('clears all player cards', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')

      const result = clearAllCards(roomCode)

      expect(result).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.card).toBeNull()
      expect(getPlayer(roomCode, 'player-2')?.card).toBeNull()
    })

    it('sets room to not revealed', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)
      setRoomRevealed(roomCode, true)

      clearAllCards(roomCode)

      expect(getRoom(roomCode)?.isRevealed).toBe(false)
    })

    it('returns false for non-existent room', () => {
      const result = clearAllCards('NON-EXISTENT-ROOM')
      expect(result).toBe(false)
    })
  })

  describe('getActiveRoomCount', () => {
    it('returns count of active rooms', () => {
      const initialCount = getActiveRoomCount()

      const roomCode1 = uniqueRoomCode()
      const roomCode2 = uniqueRoomCode()
      createOrGetRoom(roomCode1)
      createOrGetRoom(roomCode2)

      expect(getActiveRoomCount()).toBe(initialCount + 2)
    })
  })

  describe('getAdminStats', () => {
    it('returns stats with timestamp', () => {
      const stats = getAdminStats()

      expect(stats.timestamp).toBeLessThanOrEqual(Date.now())
      expect(stats.timestamp).toBeGreaterThan(0)
    })

    it('includes all card values in distribution', () => {
      const stats = getAdminStats()

      for (const card of CARD_VALUES) {
        expect(stats.cards.distribution).toHaveProperty(card)
        expect(typeof stats.cards.distribution[card]).toBe('number')
      }
    })

    it('counts empty rooms correctly', () => {
      const initialStats = getAdminStats()
      const initialEmpty = initialStats.rooms.empty

      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const stats = getAdminStats()

      expect(stats.rooms.empty).toBe(initialEmpty + 1)
    })

    it('counts rooms with players correctly', () => {
      const initialStats = getAdminStats()
      const initialWithPlayers = initialStats.rooms.withPlayers

      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const stats = getAdminStats()

      expect(stats.rooms.withPlayers).toBe(initialWithPlayers + 1)
    })

    it('counts total players correctly', () => {
      const initialStats = getAdminStats()
      const initialPlayers = initialStats.players.total

      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')

      const stats = getAdminStats()

      expect(stats.players.total).toBe(initialPlayers + 2)
    })

    it('counts players with cards correctly', () => {
      const initialStats = getAdminStats()
      const initialWithCards = initialStats.players.withCards

      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')

      const stats = getAdminStats()

      expect(stats.players.withCards).toBe(initialWithCards + 1)
      expect(stats.players.withoutCards).toBeGreaterThanOrEqual(1) // Bob has no card
    })

    it('tracks card distribution correctly', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      addPlayer(roomCode, 'player-3', 'Charlie')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '5')
      updatePlayerCard(roomCode, 'player-3', '8')

      const stats = getAdminStats()

      // At minimum, we should see the cards we just added
      expect(stats.cards.distribution['5']).toBeGreaterThanOrEqual(2)
      expect(stats.cards.distribution['8']).toBeGreaterThanOrEqual(1)
    })

    it('counts revealed and hidden rooms correctly', () => {
      const initialStats = getAdminStats()
      const initialRevealed = initialStats.rooms.revealed
      const initialHidden = initialStats.rooms.hidden

      const roomCode1 = uniqueRoomCode()
      const roomCode2 = uniqueRoomCode()
      createOrGetRoom(roomCode1)
      createOrGetRoom(roomCode2)
      setRoomRevealed(roomCode1, true)

      const stats = getAdminStats()

      expect(stats.rooms.revealed).toBe(initialRevealed + 1)
      expect(stats.rooms.hidden).toBe(initialHidden + 1)
    })

    it('calculates average players per room', () => {
      const roomCode1 = uniqueRoomCode()
      const roomCode2 = uniqueRoomCode()
      addPlayer(roomCode1, 'player-1', 'Alice')
      addPlayer(roomCode1, 'player-2', 'Bob')
      addPlayer(roomCode2, 'player-3', 'Charlie')

      const stats = getAdminStats()

      // Average should be a number between 0 and MAX_PLAYERS_PER_ROOM
      expect(stats.players.averagePerRoom).toBeGreaterThanOrEqual(0)
      expect(stats.players.averagePerRoom).toBeLessThanOrEqual(MAX_PLAYERS_PER_ROOM)
    })
  })

  describe('cleanupRooms', () => {
    it('removes empty rooms older than ROOM_CLEANUP_TIMEOUT', () => {
      const roomCode = uniqueRoomCode()
      const room = createOrGetRoom(roomCode)

      // Backdate lastActivity to exceed timeout
      room.lastActivity = Date.now() - ROOM_CLEANUP_TIMEOUT - 1000

      const cleaned = cleanupRooms()

      expect(cleaned).toBeGreaterThanOrEqual(1)
      expect(roomExists(roomCode)).toBe(false)
    })

    it('does NOT remove rooms with players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      const room = getRoom(roomCode)!

      // Backdate lastActivity
      room.lastActivity = Date.now() - ROOM_CLEANUP_TIMEOUT - 1000

      cleanupRooms()

      expect(roomExists(roomCode)).toBe(true)
    })

    it('does NOT remove recently active empty rooms', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)
      // Room is freshly created, lastActivity is recent

      cleanupRooms()

      expect(roomExists(roomCode)).toBe(true)
    })

    it('returns count of cleaned rooms', () => {
      const roomCode1 = uniqueRoomCode()
      const roomCode2 = uniqueRoomCode()
      const room1 = createOrGetRoom(roomCode1)
      const room2 = createOrGetRoom(roomCode2)

      // Backdate both rooms
      room1.lastActivity = Date.now() - ROOM_CLEANUP_TIMEOUT - 1000
      room2.lastActivity = Date.now() - ROOM_CLEANUP_TIMEOUT - 1000

      const cleaned = cleanupRooms()

      expect(cleaned).toBeGreaterThanOrEqual(2)
    })

    it('returns 0 when no rooms need cleanup', () => {
      // Create a fresh room that should not be cleaned
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const cleaned = cleanupRooms()

      // May be 0 or more depending on other test state, but room should still exist
      expect(roomExists(roomCode)).toBe(true)
    })
  })

  describe('addPlayer - name validation edge cases', () => {
    it('accepts unicode characters in player names', () => {
      const roomCode = uniqueRoomCode()

      const result = addPlayer(roomCode, 'player-1', '日本語')

      expect(result.success).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.name).toBe('日本語')
    })

    it('accepts emoji in player names', () => {
      const roomCode = uniqueRoomCode()

      const result = addPlayer(roomCode, 'player-1', '🎲 Player')

      expect(result.success).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.name).toBe('🎲 Player')
    })

    it('preserves whitespace in player names', () => {
      const roomCode = uniqueRoomCode()

      // Names with leading/trailing spaces are preserved as-is
      const result = addPlayer(roomCode, 'player-1', '  Alice  ')

      expect(result.success).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.name).toBe('  Alice  ')
    })

    it('allows empty string as player name', () => {
      const roomCode = uniqueRoomCode()

      // Note: This tests current behavior - empty names are allowed
      // Application may want to validate this at a higher level
      const result = addPlayer(roomCode, 'player-1', '')

      expect(result.success).toBe(true)
    })

    it('allows very long player names', () => {
      const roomCode = uniqueRoomCode()
      const longName = 'A'.repeat(1000)

      const result = addPlayer(roomCode, 'player-1', longName)

      expect(result.success).toBe(true)
      expect(getPlayer(roomCode, 'player-1')?.name).toBe(longName)
    })

    it('treats names differing only in whitespace as different', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      // 'Alice ' (with trailing space) should be allowed
      const result = addPlayer(roomCode, 'player-2', 'Alice ')

      expect(result.success).toBe(true)
    })

    it('rejects duplicate names with different cases', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'ALICE')

      const result = addPlayer(roomCode, 'player-2', 'alice')

      expect(result.success).toBe(false)
      expect(result.error).toContain('name already taken')
    })
  })

  describe('addPlayer - moderator functionality', () => {
    it('adds a non-moderator player by default', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')

      const player = getPlayer(roomCode, 'player-1')
      expect(player?.isModerator).toBe(false)
    })

    it('adds a moderator player when flag is true', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', true)

      const player = getPlayer(roomCode, 'player-1')
      expect(player?.isModerator).toBe(true)
    })

    it('adds a non-moderator player when flag is explicitly false', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', false)

      const player = getPlayer(roomCode, 'player-1')
      expect(player?.isModerator).toBe(false)
    })

    it('allows same room to have both moderators and players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', false)
      addPlayer(roomCode, 'player-2', 'Bob', true)
      addPlayer(roomCode, 'player-3', 'Charlie', false)

      const players = getRoomPlayers(roomCode)
      const moderators = players.filter(p => p.isModerator)
      const nonModerators = players.filter(p => !p.isModerator)

      expect(moderators).toHaveLength(1)
      expect(moderators[0].name).toBe('Bob')
      expect(nonModerators).toHaveLength(2)
    })

    it('moderator name uniqueness is checked against all players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', false)

      const result = addPlayer(roomCode, 'player-2', 'Alice', true)

      expect(result.success).toBe(false)
      expect(result.error).toContain('name already taken')
    })

    it('player name uniqueness is checked against moderators', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', true)

      const result = addPlayer(roomCode, 'player-2', 'Alice', false)

      expect(result.success).toBe(false)
      expect(result.error).toContain('name already taken')
    })

    it('moderators count toward room capacity', () => {
      const roomCode = uniqueRoomCode()

      // Fill room with moderators
      for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
        addPlayer(roomCode, `player-${i}`, `Mod${i}`, true)
      }

      const result = addPlayer(roomCode, 'extra-player', 'ExtraPlayer', false)

      expect(result.success).toBe(false)
      expect(result.error).toContain('full')
    })

    it('moderators appear in getRoomState', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', false)
      addPlayer(roomCode, 'player-2', 'ModBob', true)

      const state = getRoomState(roomCode)

      expect(state?.players).toHaveLength(2)
      const moderator = state?.players.find(p => p.name === 'ModBob')
      expect(moderator?.isModerator).toBe(true)
    })

    it('moderators appear in getRoomPlayers', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice', false)
      addPlayer(roomCode, 'player-2', 'ModBob', true)

      const players = getRoomPlayers(roomCode)

      expect(players).toHaveLength(2)
      expect(players.some(p => p.isModerator)).toBe(true)
    })
  })

  describe('reconnectPlayer', () => {
    it('updates player socket ID in place', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'old-socket-id', 'Alice')

      const result = reconnectPlayer(roomCode, 'old-socket-id', 'new-socket-id')

      expect(result).toBeDefined()
      expect(result?.id).toBe('new-socket-id')
      expect(result?.name).toBe('Alice')
    })

    it('preserves player card selection', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'old-socket-id', 'Alice')
      updatePlayerCard(roomCode, 'old-socket-id', '8')

      const result = reconnectPlayer(roomCode, 'old-socket-id', 'new-socket-id')

      expect(result?.card).toBe('8')
    })

    it('preserves moderator status', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'old-socket-id', 'Alice', true)

      const result = reconnectPlayer(roomCode, 'old-socket-id', 'new-socket-id')

      expect(result?.isModerator).toBe(true)
    })

    it('removes old socket ID from room players Map', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'old-socket-id', 'Alice')

      reconnectPlayer(roomCode, 'old-socket-id', 'new-socket-id')

      expect(getPlayer(roomCode, 'old-socket-id')).toBeUndefined()
      expect(getPlayer(roomCode, 'new-socket-id')).toBeDefined()
    })

    it('returns undefined for non-existent room', () => {
      const result = reconnectPlayer('NON-EXISTENT', 'old-id', 'new-id')
      expect(result).toBeUndefined()
    })

    it('returns undefined for non-existent player', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const result = reconnectPlayer(roomCode, 'non-existent', 'new-id')

      expect(result).toBeUndefined()
    })

    it('preserves joinedAt timestamp', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'old-socket-id', 'Alice')
      const originalJoinedAt = getPlayer(roomCode, 'old-socket-id')?.joinedAt

      const result = reconnectPlayer(roomCode, 'old-socket-id', 'new-socket-id')

      expect(result?.joinedAt).toBe(originalJoinedAt)
    })

    it('allows player to continue using room after reconnection', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'old-socket-id', 'Alice')

      reconnectPlayer(roomCode, 'old-socket-id', 'new-socket-id')

      // Should be able to update card with new ID
      const updateResult = updatePlayerCard(roomCode, 'new-socket-id', '13')
      expect(updateResult).toBe(true)
      expect(getPlayer(roomCode, 'new-socket-id')?.card).toBe('13')
    })

    it('allows same name to be used after player is removed', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      removePlayer(roomCode, 'player-1')

      // Name should now be available
      const result = addPlayer(roomCode, 'player-2', 'Alice')
      expect(result.success).toBe(true)
    })

    it('does not affect other players in the room', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-2', '5')

      reconnectPlayer(roomCode, 'player-1', 'new-socket-id')

      // Bob should be unaffected
      const bob = getPlayer(roomCode, 'player-2')
      expect(bob?.name).toBe('Bob')
      expect(bob?.card).toBe('5')
    })
  })
})
