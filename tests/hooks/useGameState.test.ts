/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '@/hooks/useGameState'
import { ServerEvents } from '@/types/socket-events'

// Simple mock socket that tracks event listeners
function createMockSocket() {
  const listeners = new Map<string, Function[]>()

  return {
    on: vi.fn((event: string, callback: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, [])
      }
      listeners.get(event)!.push(callback)
    }),
    off: vi.fn((event: string) => {
      listeners.delete(event)
    }),
    // Helper to emit events in tests
    emit: (event: string, payload: unknown) => {
      const callbacks = listeners.get(event) || []
      callbacks.forEach(cb => cb(payload))
    },
    // Helper to check registered listeners
    getListeners: () => listeners,
  }
}

describe('hooks/useGameState', () => {
  describe('initial state', () => {
    it('returns default state when socket is null', () => {
      const { result } = renderHook(() => useGameState(null))

      expect(result.current).toEqual({
        players: [],
        isRevealed: false,
        currentPlayerId: null,
        error: null,
        removedFromRoom: null,
      })
    })
  })

  describe('event subscriptions', () => {
    it('subscribes to all server events when socket is provided', () => {
      const mockSocket = createMockSocket()

      renderHook(() => useGameState(mockSocket as any))

      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.ROOM_STATE, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.PLAYER_JOINED, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.PLAYER_LEFT, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.CARD_SELECTED, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.CARDS_REVEALED, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.GAME_RESET, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.ERROR, expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith(ServerEvents.REMOVED_FROM_ROOM, expect.any(Function))
    })

    it('unsubscribes from all events on unmount', () => {
      const mockSocket = createMockSocket()

      const { unmount } = renderHook(() => useGameState(mockSocket as any))
      unmount()

      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.ROOM_STATE)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.PLAYER_JOINED)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.PLAYER_LEFT)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.CARD_SELECTED)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.CARDS_REVEALED)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.GAME_RESET)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.ERROR)
      expect(mockSocket.off).toHaveBeenCalledWith(ServerEvents.REMOVED_FROM_ROOM)
    })
  })

  describe('room-state event', () => {
    it('updates state with room data', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      act(() => {
        mockSocket.emit(ServerEvents.ROOM_STATE, {
          players: [
            { id: 'p1', name: 'Alice', card: '5', joinedAt: 1000 },
            { id: 'p2', name: 'Bob', card: null, joinedAt: 1001 },
          ],
          isRevealed: false,
          currentPlayerId: 'p1',
        })
      })

      expect(result.current.players).toHaveLength(2)
      expect(result.current.players[0].card).toBe('5')
      expect(result.current.players[1].card).toBeNull()
      expect(result.current.currentPlayerId).toBe('p1')
      expect(result.current.isRevealed).toBe(false)
    })
  })

  describe('player-joined event', () => {
    it('adds new player to state', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      act(() => {
        mockSocket.emit(ServerEvents.PLAYER_JOINED, {
          player: { id: 'p1', name: 'Alice', card: null, joinedAt: 1000 },
        })
      })

      expect(result.current.players).toHaveLength(1)
      expect(result.current.players[0].name).toBe('Alice')
      expect(result.current.players[0].card).toBeNull()
    })
  })

  describe('player-left event', () => {
    it('removes player from state', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      // First add players
      act(() => {
        mockSocket.emit(ServerEvents.ROOM_STATE, {
          players: [
            { id: 'p1', name: 'Alice', card: null, joinedAt: 1000 },
            { id: 'p2', name: 'Bob', card: null, joinedAt: 1001 },
          ],
          isRevealed: false,
          currentPlayerId: 'p1',
        })
      })

      // Then remove one
      act(() => {
        mockSocket.emit(ServerEvents.PLAYER_LEFT, {
          playerId: 'p1',
          playerName: 'Alice',
        })
      })

      expect(result.current.players).toHaveLength(1)
      expect(result.current.players[0].name).toBe('Bob')
    })
  })

  describe('card-selected event', () => {
    it('updates card value for player', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      // Setup initial state
      act(() => {
        mockSocket.emit(ServerEvents.ROOM_STATE, {
          players: [{ id: 'p1', name: 'Alice', card: null, joinedAt: 1000 }],
          isRevealed: false,
          currentPlayerId: 'p1',
        })
      })

      // Player selects card
      act(() => {
        mockSocket.emit(ServerEvents.CARD_SELECTED, {
          playerId: 'p1',
          card: '5',
        })
      })

      expect(result.current.players[0].card).toBe('5')
    })

    it('updates card to null when player unselects', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      // Setup initial state with card selected
      act(() => {
        mockSocket.emit(ServerEvents.ROOM_STATE, {
          players: [{ id: 'p1', name: 'Alice', card: '5', joinedAt: 1000 }],
          isRevealed: false,
          currentPlayerId: 'p1',
        })
      })

      // Player unselects card
      act(() => {
        mockSocket.emit(ServerEvents.CARD_SELECTED, {
          playerId: 'p1',
          card: null,
        })
      })

      expect(result.current.players[0].card).toBeNull()
    })
  })

  describe('cards-revealed event', () => {
    it('updates players and sets isRevealed to true', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      act(() => {
        mockSocket.emit(ServerEvents.CARDS_REVEALED, {
          players: [
            { id: 'p1', name: 'Alice', card: '5', joinedAt: 1000 },
            { id: 'p2', name: 'Bob', card: '8', joinedAt: 1001 },
          ],
        })
      })

      expect(result.current.isRevealed).toBe(true)
      expect(result.current.players[0].card).toBe('5')
      expect(result.current.players[1].card).toBe('8')
    })
  })

  describe('game-reset event', () => {
    it('updates players and sets isRevealed to false', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      // First reveal cards
      act(() => {
        mockSocket.emit(ServerEvents.CARDS_REVEALED, {
          players: [{ id: 'p1', name: 'Alice', card: '5', joinedAt: 1000 }],
        })
      })

      // Then reset
      act(() => {
        mockSocket.emit(ServerEvents.GAME_RESET, {
          players: [{ id: 'p1', name: 'Alice', card: null, joinedAt: 1000 }],
        })
      })

      expect(result.current.isRevealed).toBe(false)
      expect(result.current.players[0].card).toBeNull()
    })
  })

  describe('error event', () => {
    it('sets error message in state', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      act(() => {
        mockSocket.emit(ServerEvents.ERROR, {
          message: 'Something went wrong',
        })
      })

      expect(result.current.error).toBe('Something went wrong')
    })
  })

  describe('removed-from-room event', () => {
    it('sets removedFromRoom in state', () => {
      const mockSocket = createMockSocket()
      const { result } = renderHook(() => useGameState(mockSocket as any))

      act(() => {
        mockSocket.emit(ServerEvents.REMOVED_FROM_ROOM, {
          roomCode: 'ABC123',
          reason: 'other',
        })
      })

      expect(result.current.removedFromRoom).toEqual({
        roomCode: 'ABC123',
        reason: 'other',
      })
    })
  })
})
