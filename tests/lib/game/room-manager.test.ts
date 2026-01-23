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
} from '@/lib/game/room-manager'
import { MAX_PLAYERS_PER_ROOM, CARD_VALUES } from '@/types/game'

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
})
