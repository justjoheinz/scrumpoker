/**
 * Game Logic - Business rules for Scrum Poker game
 */

import { Player, CARD_ORDER } from '@/types/game';
import {
  getRoom,
  setRoomRevealed,
  clearAllCards,
  getRoomPlayers,
} from './room-manager';
import { createLogger } from '../logger';

const log = createLogger('game-logic');

/**
 * Reveal all cards in a room
 */
export function revealCards(roomCode: string): { success: boolean; players?: Player[] } {
  const room = getRoom(roomCode);

  if (!room) {
    return { success: false };
  }

  // Set room as revealed
  setRoomRevealed(roomCode, true);

  // Get sorted players
  const players = getSortedPlayers(roomCode);

  log.debug(`Cards revealed in room ${roomCode}`);

  return { success: true, players };
}

/**
 * Reset game in a room (clear all cards, set to not revealed)
 */
export function resetGame(roomCode: string): { success: boolean; players?: Player[] } {
  const room = getRoom(roomCode);

  if (!room) {
    return { success: false };
  }

  // Clear all cards and set revealed to false
  clearAllCards(roomCode);

  // Get sorted players (alphabetically after reset)
  const players = getSortedPlayers(roomCode);

  log.debug(`Game reset in room ${roomCode}`);

  return { success: true, players };
}

/**
 * Get players sorted according to game state
 * - If revealed: sort by card value (ascending), then by name
 * - If not revealed: sort alphabetically by name
 */
export function getSortedPlayers(roomCode: string): Player[] {
  const room = getRoom(roomCode);

  if (!room) {
    return [];
  }

  const players = getRoomPlayers(roomCode);

  if (room.isRevealed) {
    // Sort by card value, then by name
    return players.sort((a, b) => {
      const cardA = a.card ? CARD_ORDER[a.card] : 999; // No card goes to end
      const cardB = b.card ? CARD_ORDER[b.card] : 999;

      if (cardA !== cardB) {
        return cardA - cardB;
      }

      // Same card value or both no card - sort by name
      return a.name.localeCompare(b.name);
    });
  } else {
    // Sort alphabetically by name
    return players.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Check if enough players have selected cards to allow reveal
 */
export function canReveal(roomCode: string): boolean {
  const players = getRoomPlayers(roomCode);

  // Need at least 2 players total
  if (players.length < 2) {
    return false;
  }

  // Check how many players have selected cards
  const playersWithCards = players.filter((p) => p.card !== null).length;

  // Allow reveal if at least 2 players have selected cards
  return playersWithCards >= 2;
}

/**
 * Check if game is in a state where it can be reset
 */
export function canReset(roomCode: string): boolean {
  const room = getRoom(roomCode);

  if (!room) {
    return false;
  }

  // Can reset if cards are revealed
  return room.isRevealed;
}

/**
 * Get game statistics for a room
 */
export function getGameStats(roomCode: string) {
  const room = getRoom(roomCode);

  if (!room) {
    return null;
  }

  const players = getRoomPlayers(roomCode);
  const playersWithCards = players.filter((p) => p.card !== null).length;

  return {
    totalPlayers: players.length,
    playersWithCards,
    playersWithoutCards: players.length - playersWithCards,
    isRevealed: room.isRevealed,
    canReveal: canReveal(roomCode),
    canReset: canReset(roomCode),
  };
}
