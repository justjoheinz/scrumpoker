import { describe, it, expect } from 'vitest'
import { ClientEvents, ServerEvents } from '@/types/socket-events'

describe('types/socket-events', () => {
  describe('ClientEvents', () => {
    it('contains all expected client event names', () => {
      expect(ClientEvents.JOIN_ROOM).toBe('join-room')
      expect(ClientEvents.SELECT_CARD).toBe('select-card')
      expect(ClientEvents.REVEAL_CARDS).toBe('reveal-cards')
      expect(ClientEvents.RESET_GAME).toBe('reset-game')
      expect(ClientEvents.REMOVE_PLAYER).toBe('remove-player')
    })

    it('has exactly 5 client events', () => {
      expect(Object.keys(ClientEvents)).toHaveLength(5)
    })

    it('all event names are lowercase with hyphens', () => {
      for (const eventName of Object.values(ClientEvents)) {
        expect(eventName).toMatch(/^[a-z-]+$/)
      }
    })

    it('all event names are unique', () => {
      const values = Object.values(ClientEvents)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('ServerEvents', () => {
    it('contains all expected server event names', () => {
      expect(ServerEvents.ROOM_STATE).toBe('room-state')
      expect(ServerEvents.PLAYER_JOINED).toBe('player-joined')
      expect(ServerEvents.PLAYER_LEFT).toBe('player-left')
      expect(ServerEvents.CARD_SELECTED).toBe('card-selected')
      expect(ServerEvents.CARDS_REVEALED).toBe('cards-revealed')
      expect(ServerEvents.GAME_RESET).toBe('game-reset')
      expect(ServerEvents.ERROR).toBe('error')
      expect(ServerEvents.REMOVED_FROM_ROOM).toBe('removed-from-room')
    })

    it('has exactly 8 server events', () => {
      expect(Object.keys(ServerEvents)).toHaveLength(8)
    })

    it('all event names are lowercase with hyphens', () => {
      for (const eventName of Object.values(ServerEvents)) {
        expect(eventName).toMatch(/^[a-z-]+$/)
      }
    })

    it('all event names are unique', () => {
      const values = Object.values(ServerEvents)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('Client and Server events', () => {
    it('have no overlapping event names', () => {
      const clientEventNames = new Set(Object.values(ClientEvents))
      const serverEventNames = new Set(Object.values(ServerEvents))

      for (const name of clientEventNames) {
        expect(serverEventNames.has(name)).toBe(false)
      }
    })
  })
})
