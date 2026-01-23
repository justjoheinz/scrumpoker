/**
 * Socket.io event type definitions
 * Type-safe contract between client and server
 */

import { CardValue, Player } from './game';

// ========== Client -> Server Events ==========

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  reconnectPlayerId?: string; // for reconnection attempts
}

export interface SelectCardPayload {
  roomCode: string;
  card: CardValue | null;  // null means unselect
}

export interface RevealCardsPayload {
  roomCode: string;
}

export interface ResetGamePayload {
  roomCode: string;
}

export interface RemovePlayerPayload {
  roomCode: string;
  playerId: string;
}

// ========== Server -> Client Events ==========

export interface RoomStatePayload {
  roomCode: string;
  players: Player[];          // all players in room
  isRevealed: boolean;
  currentPlayerId: string;    // the socket ID of the receiving client
}

export interface PlayerJoinedPayload {
  player: Player;
}

export interface PlayerLeftPayload {
  playerId: string;
  playerName: string;
}

export interface CardSelectedPayload {
  playerId: string;
  hasCard: boolean;  // true if card selected, but value hidden until reveal
  cardValue?: CardValue | null;  // only sent to the selecting player for UI feedback
}

export interface CardsRevealedPayload {
  players: Player[];  // sorted by card value, then name
}

export interface GameResetPayload {
  players: Player[];  // sorted alphabetically by name
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

export interface RemovedFromRoomPayload {
  roomCode: string;
  reason: 'self' | 'other';  // 'self' if they removed themselves, 'other' if removed by someone else
}

// ========== Callback Types ==========

export interface JoinRoomResponse {
  success: boolean;
  error?: string;
  playerId?: string;
}

// ========== Socket Event Names (type-safe constants) ==========

export const ClientEvents = {
  JOIN_ROOM: 'join-room',
  SELECT_CARD: 'select-card',
  REVEAL_CARDS: 'reveal-cards',
  RESET_GAME: 'reset-game',
  REMOVE_PLAYER: 'remove-player',
} as const;

export const ServerEvents = {
  ROOM_STATE: 'room-state',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  CARD_SELECTED: 'card-selected',
  CARDS_REVEALED: 'cards-revealed',
  GAME_RESET: 'game-reset',
  ERROR: 'error',
  REMOVED_FROM_ROOM: 'removed-from-room',
} as const;
