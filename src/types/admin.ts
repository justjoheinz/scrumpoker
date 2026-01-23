/**
 * Admin statistics type definitions
 */

import { CardValue } from './game';

export interface RoomStats {
  total: number;
  empty: number;
  withPlayers: number;
  revealed: number;
  hidden: number;
}

export interface PlayerStats {
  total: number;
  averagePerRoom: number;
  withCards: number;
  withoutCards: number;
}

export interface CardStats {
  distribution: Record<CardValue, number>;
}

export interface AdminStats {
  timestamp: number;
  rooms: RoomStats;
  players: PlayerStats;
  cards: CardStats;
}
