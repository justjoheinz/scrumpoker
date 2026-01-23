import { describe, it, expect } from 'vitest'
import {
  revealCards,
  resetGame,
  getSortedPlayers,
  canReveal,
  canReset,
  getGameStats,
} from '@/lib/game/game-logic'
import {
  createOrGetRoom,
  addPlayer,
  updatePlayerCard,
  setRoomRevealed,
  getRoom,
  getPlayer,
} from '@/lib/game/room-manager'

// Generate unique room codes for each test to avoid state interference
let testCounter = 0
function uniqueRoomCode(): string {
  return `LOGIC-${Date.now()}-${testCounter++}`
}

describe('lib/game/game-logic', () => {
  describe('revealCards', () => {
    it('returns success false for non-existent room', () => {
      const result = revealCards('NON-EXISTENT-ROOM-LOGIC')
      expect(result.success).toBe(false)
      expect(result.players).toBeUndefined()
    })

    it('sets room to revealed state', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')

      revealCards(roomCode)

      expect(getRoom(roomCode)?.isRevealed).toBe(true)
    })

    it('returns sorted players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Charlie')
      addPlayer(roomCode, 'player-2', 'Alice')
      updatePlayerCard(roomCode, 'player-1', '8')
      updatePlayerCard(roomCode, 'player-2', '3')

      const result = revealCards(roomCode)

      expect(result.success).toBe(true)
      expect(result.players).toBeDefined()
      expect(result.players?.[0].name).toBe('Alice') // card 3
      expect(result.players?.[1].name).toBe('Charlie') // card 8
    })
  })

  describe('resetGame', () => {
    it('returns success false for non-existent room', () => {
      const result = resetGame('NON-EXISTENT-ROOM-RESET')
      expect(result.success).toBe(false)
    })

    it('clears all cards', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')
      setRoomRevealed(roomCode, true)

      resetGame(roomCode)

      expect(getPlayer(roomCode, 'player-1')?.card).toBeNull()
      expect(getPlayer(roomCode, 'player-2')?.card).toBeNull()
    })

    it('sets room to not revealed', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      setRoomRevealed(roomCode, true)

      resetGame(roomCode)

      expect(getRoom(roomCode)?.isRevealed).toBe(false)
    })

    it('returns alphabetically sorted players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Charlie')
      addPlayer(roomCode, 'player-2', 'Alice')
      addPlayer(roomCode, 'player-3', 'Bob')

      const result = resetGame(roomCode)

      expect(result.success).toBe(true)
      expect(result.players?.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie'])
    })
  })

  describe('getSortedPlayers', () => {
    it('returns empty array for non-existent room', () => {
      const players = getSortedPlayers('NON-EXISTENT-SORT')
      expect(players).toEqual([])
    })

    describe('when cards are not revealed', () => {
      it('sorts players alphabetically by name', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Zack')
        addPlayer(roomCode, 'player-2', 'Alice')
        addPlayer(roomCode, 'player-3', 'Mike')

        const players = getSortedPlayers(roomCode)

        expect(players.map(p => p.name)).toEqual(['Alice', 'Mike', 'Zack'])
      })

      it('ignores card values when sorting', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Zack')
        addPlayer(roomCode, 'player-2', 'Alice')
        updatePlayerCard(roomCode, 'player-1', '1') // lowest card
        updatePlayerCard(roomCode, 'player-2', '20') // highest numeric card

        const players = getSortedPlayers(roomCode)

        // Still sorted by name
        expect(players.map(p => p.name)).toEqual(['Alice', 'Zack'])
      })
    })

    describe('when cards are revealed', () => {
      it('sorts players by card value ascending', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Alice')
        addPlayer(roomCode, 'player-2', 'Bob')
        addPlayer(roomCode, 'player-3', 'Charlie')
        updatePlayerCard(roomCode, 'player-1', '13')
        updatePlayerCard(roomCode, 'player-2', '3')
        updatePlayerCard(roomCode, 'player-3', '8')
        setRoomRevealed(roomCode, true)

        const players = getSortedPlayers(roomCode)

        expect(players.map(p => p.name)).toEqual(['Bob', 'Charlie', 'Alice'])
        expect(players.map(p => p.card)).toEqual(['3', '8', '13'])
      })

      it('X card is sorted last', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Alice')
        addPlayer(roomCode, 'player-2', 'Bob')
        addPlayer(roomCode, 'player-3', 'Charlie')
        updatePlayerCard(roomCode, 'player-1', 'X')
        updatePlayerCard(roomCode, 'player-2', '1')
        updatePlayerCard(roomCode, 'player-3', '20')
        setRoomRevealed(roomCode, true)

        const players = getSortedPlayers(roomCode)

        expect(players.map(p => p.name)).toEqual(['Bob', 'Charlie', 'Alice'])
        expect(players.map(p => p.card)).toEqual(['1', '20', 'X'])
      })

      it('players without cards are sorted last', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Alice')
        addPlayer(roomCode, 'player-2', 'Bob')
        addPlayer(roomCode, 'player-3', 'Charlie')
        updatePlayerCard(roomCode, 'player-1', '5')
        // Bob has no card
        updatePlayerCard(roomCode, 'player-3', '3')
        setRoomRevealed(roomCode, true)

        const players = getSortedPlayers(roomCode)

        expect(players.map(p => p.name)).toEqual(['Charlie', 'Alice', 'Bob'])
      })

      it('players with same card value are sorted by name', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Charlie')
        addPlayer(roomCode, 'player-2', 'Alice')
        addPlayer(roomCode, 'player-3', 'Bob')
        updatePlayerCard(roomCode, 'player-1', '5')
        updatePlayerCard(roomCode, 'player-2', '5')
        updatePlayerCard(roomCode, 'player-3', '5')
        setRoomRevealed(roomCode, true)

        const players = getSortedPlayers(roomCode)

        expect(players.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie'])
      })

      it('multiple players without cards are sorted by name', () => {
        const roomCode = uniqueRoomCode()
        addPlayer(roomCode, 'player-1', 'Zack')
        addPlayer(roomCode, 'player-2', 'Alice')
        addPlayer(roomCode, 'player-3', 'Mike')
        // No cards selected
        setRoomRevealed(roomCode, true)

        const players = getSortedPlayers(roomCode)

        expect(players.map(p => p.name)).toEqual(['Alice', 'Mike', 'Zack'])
      })
    })
  })

  describe('canReveal', () => {
    it('returns false for non-existent room', () => {
      // getRoomPlayers returns [] for non-existent room
      // With 0 players, canReveal should return false
      const result = canReveal('NON-EXISTENT-CANREVEAL')
      expect(result).toBe(false)
    })

    it('returns false with fewer than 2 players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      updatePlayerCard(roomCode, 'player-1', '5')

      expect(canReveal(roomCode)).toBe(false)
    })

    it('returns false when fewer than 2 players have cards', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')
      // Bob has no card

      expect(canReveal(roomCode)).toBe(false)
    })

    it('returns true when at least 2 players have cards', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')

      expect(canReveal(roomCode)).toBe(true)
    })

    it('returns true when 2 of 3 players have cards', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      addPlayer(roomCode, 'player-3', 'Charlie')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')
      // Charlie has no card

      expect(canReveal(roomCode)).toBe(true)
    })
  })

  describe('canReset', () => {
    it('returns false for non-existent room', () => {
      expect(canReset('NON-EXISTENT-CANRESET')).toBe(false)
    })

    it('returns false when cards are not revealed', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')
      // Not revealed

      expect(canReset(roomCode)).toBe(false)
    })

    it('returns true when cards are revealed', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      setRoomRevealed(roomCode, true)

      expect(canReset(roomCode)).toBe(true)
    })
  })

  describe('getGameStats', () => {
    it('returns null for non-existent room', () => {
      expect(getGameStats('NON-EXISTENT-STATS')).toBeNull()
    })

    it('returns correct stats for room with no players', () => {
      const roomCode = uniqueRoomCode()
      createOrGetRoom(roomCode)

      const stats = getGameStats(roomCode)

      expect(stats).toEqual({
        totalPlayers: 0,
        playersWithCards: 0,
        playersWithoutCards: 0,
        isRevealed: false,
        canReveal: false,
        canReset: false,
      })
    })

    it('returns correct stats for room with players', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      addPlayer(roomCode, 'player-3', 'Charlie')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')
      // Charlie has no card

      const stats = getGameStats(roomCode)

      expect(stats?.totalPlayers).toBe(3)
      expect(stats?.playersWithCards).toBe(2)
      expect(stats?.playersWithoutCards).toBe(1)
      expect(stats?.isRevealed).toBe(false)
      expect(stats?.canReveal).toBe(true)
      expect(stats?.canReset).toBe(false)
    })

    it('returns correct stats after reveal', () => {
      const roomCode = uniqueRoomCode()
      addPlayer(roomCode, 'player-1', 'Alice')
      addPlayer(roomCode, 'player-2', 'Bob')
      updatePlayerCard(roomCode, 'player-1', '5')
      updatePlayerCard(roomCode, 'player-2', '8')
      setRoomRevealed(roomCode, true)

      const stats = getGameStats(roomCode)

      expect(stats?.isRevealed).toBe(true)
      expect(stats?.canReset).toBe(true)
    })
  })
})
