/**
 * Game domain type definitions
 */

export type CardValue = "1" | "2" | "3" | "5" | "8" | "13" | "20" | "X";

export const CARD_VALUES: CardValue[] = [
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "20",
  "X",
];

export const CARD_ORDER: Record<CardValue, number> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "5": 5,
  "8": 8,
  "13": 13,
  "20": 20,
  X: 99, // X sorted last
};

export interface Player {
  id: string; // socket.id
  name: string; // player name (unique within room)
  card: CardValue | null; // selected card (null if not chosen)
  joinedAt: number; // timestamp
  isModerator: boolean; // moderator can observe and control but not vote
}

export interface Room {
  code: string; // room code (6-char alphanumeric)
  players: Map<string, Player>; // playerId -> Player
  isRevealed: boolean; // whether cards are face up
  createdAt: number; // timestamp
  lastActivity: number; // timestamp of last action
}

export const MAX_PLAYERS_PER_ROOM = 20;
export const RECONNECTION_GRACE_PERIOD = 30000; // 30 seconds
export const ROOM_CLEANUP_TIMEOUT = 30 * 60 * 1000; // 30 minutes
