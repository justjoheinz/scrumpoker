import { describe, it, expect } from 'vitest'
import {
  CARD_VALUES,
  CARD_ORDER,
  MAX_PLAYERS_PER_ROOM,
  RECONNECTION_GRACE_PERIOD,
  ROOM_CLEANUP_TIMEOUT,
  CardValue,
} from '@/types/game'

describe('types/game', () => {
  describe('CARD_VALUES', () => {
    it('contains all expected card values', () => {
      expect(CARD_VALUES).toContain('1')
      expect(CARD_VALUES).toContain('2')
      expect(CARD_VALUES).toContain('3')
      expect(CARD_VALUES).toContain('5')
      expect(CARD_VALUES).toContain('8')
      expect(CARD_VALUES).toContain('13')
      expect(CARD_VALUES).toContain('20')
      expect(CARD_VALUES).toContain('X')
    })

    it('has exactly 8 card values', () => {
      expect(CARD_VALUES).toHaveLength(8)
    })

    it('follows Fibonacci-like sequence (except X)', () => {
      const numericValues = CARD_VALUES.filter((v): v is Exclude<CardValue, 'X'> => v !== 'X')
      const asNumbers = numericValues.map(Number)
      expect(asNumbers).toEqual([1, 2, 3, 5, 8, 13, 20])
    })
  })

  describe('CARD_ORDER', () => {
    it('has an entry for every card value', () => {
      for (const card of CARD_VALUES) {
        expect(CARD_ORDER[card]).toBeDefined()
      }
    })

    it('X has highest sort order', () => {
      const nonXCards = CARD_VALUES.filter((v): v is Exclude<CardValue, 'X'> => v !== 'X')
      for (const card of nonXCards) {
        expect(CARD_ORDER[card]).toBeLessThan(CARD_ORDER['X'])
      }
    })

    it('numeric cards are ordered by their numeric value', () => {
      expect(CARD_ORDER['1']).toBeLessThan(CARD_ORDER['2'])
      expect(CARD_ORDER['2']).toBeLessThan(CARD_ORDER['3'])
      expect(CARD_ORDER['3']).toBeLessThan(CARD_ORDER['5'])
      expect(CARD_ORDER['5']).toBeLessThan(CARD_ORDER['8'])
      expect(CARD_ORDER['8']).toBeLessThan(CARD_ORDER['13'])
      expect(CARD_ORDER['13']).toBeLessThan(CARD_ORDER['20'])
    })

    it('allows correct sorting of cards', () => {
      const unsorted: CardValue[] = ['X', '8', '1', '13', '3']
      const sorted = [...unsorted].sort((a, b) => CARD_ORDER[a] - CARD_ORDER[b])
      expect(sorted).toEqual(['1', '3', '8', '13', 'X'])
    })
  })

  describe('constants', () => {
    it('MAX_PLAYERS_PER_ROOM is a reasonable positive number', () => {
      expect(MAX_PLAYERS_PER_ROOM).toBeGreaterThan(0)
      expect(MAX_PLAYERS_PER_ROOM).toBeLessThanOrEqual(100)
      expect(Number.isInteger(MAX_PLAYERS_PER_ROOM)).toBe(true)
    })

    it('RECONNECTION_GRACE_PERIOD is a reasonable duration in milliseconds', () => {
      expect(RECONNECTION_GRACE_PERIOD).toBeGreaterThan(0)
      expect(RECONNECTION_GRACE_PERIOD).toBeLessThanOrEqual(5 * 60 * 1000) // max 5 minutes
    })

    it('ROOM_CLEANUP_TIMEOUT is a reasonable duration in milliseconds', () => {
      expect(ROOM_CLEANUP_TIMEOUT).toBeGreaterThan(0)
      expect(ROOM_CLEANUP_TIMEOUT).toBeLessThanOrEqual(60 * 60 * 1000) // max 1 hour
    })

    it('RECONNECTION_GRACE_PERIOD is less than ROOM_CLEANUP_TIMEOUT', () => {
      expect(RECONNECTION_GRACE_PERIOD).toBeLessThan(ROOM_CLEANUP_TIMEOUT)
    })
  })
})
