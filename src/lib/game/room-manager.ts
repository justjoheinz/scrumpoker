/**
 * Room Manager - In-memory state management for game rooms
 */

import {
  Room,
  Player,
  CardValue,
  CARD_VALUES,
  MAX_PLAYERS_PER_ROOM,
  ROOM_CLEANUP_TIMEOUT,
} from '@/types/game';
import { AdminStats, CardStats } from '@/types/admin';

// Global in-memory storage
const rooms = new Map<string, Room>();

/**
 * Create a new room or return existing one
 */
export function createOrGetRoom(roomCode: string): Room {
  let room = rooms.get(roomCode);

  if (!room) {
    room = {
      code: roomCode,
      players: new Map(),
      isRevealed: false,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    rooms.set(roomCode, room);
    console.log(`Created new room: ${roomCode}`);
  }

  return room;
}

/**
 * Get a room by code
 */
export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode);
}

/**
 * Check if a room exists
 */
export function roomExists(roomCode: string): boolean {
  return rooms.has(roomCode);
}

/**
 * Add a player to a room
 */
export function addPlayer(
  roomCode: string,
  playerId: string,
  playerName: string
): { success: boolean; error?: string } {
  const room = createOrGetRoom(roomCode);

  // Check if room is full
  if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
    return {
      success: false,
      error: `Room is full (maximum ${MAX_PLAYERS_PER_ROOM} players)`,
    };
  }

  // Check if name is already taken (case-insensitive)
  const nameTaken = Array.from(room.players.values()).some(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (nameTaken) {
    return {
      success: false,
      error: 'Player name already taken in this room',
    };
  }

  // Add player
  const player: Player = {
    id: playerId,
    name: playerName,
    card: null,
    joinedAt: Date.now(),
  };

  room.players.set(playerId, player);
  room.lastActivity = Date.now();

  console.log(`Player ${playerName} (${playerId}) joined room ${roomCode}`);

  return { success: true };
}

/**
 * Remove a player from a room
 */
export function removePlayer(roomCode: string, playerId: string): boolean {
  const room = rooms.get(roomCode);

  if (!room) {
    return false;
  }

  const player = room.players.get(playerId);
  if (!player) {
    return false;
  }

  room.players.delete(playerId);
  room.lastActivity = Date.now();

  console.log(`Player ${player.name} (${playerId}) left room ${roomCode}`);

  return true;
}

/**
 * Get a player from a room
 */
export function getPlayer(roomCode: string, playerId: string): Player | undefined {
  const room = rooms.get(roomCode);
  return room?.players.get(playerId);
}

/**
 * Update player's card selection (or unselect if card is null)
 */
export function updatePlayerCard(
  roomCode: string,
  playerId: string,
  card: CardValue | null  // Now accepts null for unselection
): boolean {
  const room = rooms.get(roomCode);

  if (!room) {
    return false;
  }

  const player = room.players.get(playerId);

  if (!player) {
    return false;
  }

  player.card = card;  // Can be null (unselected) or CardValue
  room.lastActivity = Date.now();

  if (card === null) {
    console.log(`Player ${player.name} unselected their card`);
  } else {
    console.log(`Player ${player.name} selected card: ${card}`);
  }

  return true;
}

/**
 * Get current room state
 */
export function getRoomState(roomCode: string) {
  const room = rooms.get(roomCode);

  if (!room) {
    return null;
  }

  return {
    roomCode: room.code,
    players: Array.from(room.players.values()),
    isRevealed: room.isRevealed,
  };
}

/**
 * Get all players in a room as an array
 */
export function getRoomPlayers(roomCode: string): Player[] {
  const room = rooms.get(roomCode);
  return room ? Array.from(room.players.values()) : [];
}

/**
 * Set room revealed status
 */
export function setRoomRevealed(roomCode: string, revealed: boolean): boolean {
  const room = rooms.get(roomCode);

  if (!room) {
    return false;
  }

  room.isRevealed = revealed;
  room.lastActivity = Date.now();

  return true;
}

/**
 * Clear all cards in a room (for reset)
 */
export function clearAllCards(roomCode: string): boolean {
  const room = rooms.get(roomCode);

  if (!room) {
    return false;
  }

  room.players.forEach((player) => {
    player.card = null;
  });

  room.isRevealed = false;
  room.lastActivity = Date.now();

  return true;
}

/**
 * Clean up empty or stale rooms
 */
export function cleanupRooms(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [code, room] of rooms.entries()) {
    // Remove rooms with no players that have been inactive
    if (
      room.players.size === 0 &&
      now - room.lastActivity > ROOM_CLEANUP_TIMEOUT
    ) {
      rooms.delete(code);
      cleaned++;
      console.log(`Cleaned up stale room: ${code}`);
    }
  }

  return cleaned;
}

/**
 * Get total number of active rooms
 */
export function getActiveRoomCount(): number {
  return rooms.size;
}

/**
 * Start periodic cleanup task
 */
export function startCleanupTask(): NodeJS.Timeout {
  const interval = setInterval(() => {
    const cleaned = cleanupRooms();
    if (cleaned > 0) {
      console.log(`Cleanup: Removed ${cleaned} stale room(s)`);
    }
  }, 60000); // Check every minute

  return interval;
}

/**
 * Get admin statistics for all rooms
 */
export function getAdminStats(): AdminStats {
  let totalPlayers = 0;
  let playersWithCards = 0;
  let playersWithoutCards = 0;
  let emptyRooms = 0;
  let roomsWithPlayers = 0;
  let revealedRooms = 0;
  let hiddenRooms = 0;

  // Initialize card distribution with zeros
  const cardDistribution: CardStats['distribution'] = {} as CardStats['distribution'];
  for (const card of CARD_VALUES) {
    cardDistribution[card] = 0;
  }

  for (const room of rooms.values()) {
    const playerCount = room.players.size;
    totalPlayers += playerCount;

    if (playerCount === 0) {
      emptyRooms++;
    } else {
      roomsWithPlayers++;
    }

    if (room.isRevealed) {
      revealedRooms++;
    } else {
      hiddenRooms++;
    }

    for (const player of room.players.values()) {
      if (player.card !== null) {
        playersWithCards++;
        cardDistribution[player.card]++;
      } else {
        playersWithoutCards++;
      }
    }
  }

  const totalRooms = rooms.size;
  const averagePerRoom = totalRooms > 0 ? totalPlayers / totalRooms : 0;

  return {
    timestamp: Date.now(),
    rooms: {
      total: totalRooms,
      empty: emptyRooms,
      withPlayers: roomsWithPlayers,
      revealed: revealedRooms,
      hidden: hiddenRooms,
    },
    players: {
      total: totalPlayers,
      averagePerRoom: Math.round(averagePerRoom * 100) / 100,
      withCards: playersWithCards,
      withoutCards: playersWithoutCards,
    },
    cards: {
      distribution: cardDistribution,
    },
  };
}
