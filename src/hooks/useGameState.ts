/**
 * useGameState hook - Manages game state synchronization with server
 */

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  ServerEvents,
  RoomStatePayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  CardSelectedPayload,
  CardsRevealedPayload,
  GameResetPayload,
  ErrorPayload,
  RemovedFromRoomPayload,
} from '@/types/socket-events';
import { Player } from '@/types/game';

// Client-side player type with explicit hasCard tracking
export interface ClientPlayer extends Player {
  hasCard: boolean;
}

interface GameState {
  players: ClientPlayer[];
  isRevealed: boolean;
  currentPlayerId: string | null;
  error: string | null;
  removedFromRoom: RemovedFromRoomPayload | null;
}

export function useGameState(socket: Socket | null) {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    isRevealed: false,
    currentPlayerId: null,
    error: null,
    removedFromRoom: null,
  });

  useEffect(() => {
    if (!socket) return;

    // Room state - full synchronization
    socket.on(ServerEvents.ROOM_STATE, (payload: RoomStatePayload) => {
      console.log('Room state received:', payload);
      setGameState({
        players: payload.players.map((p) => ({ ...p, hasCard: p.card !== null })),
        isRevealed: payload.isRevealed,
        currentPlayerId: payload.currentPlayerId,
        error: null,
        removedFromRoom: null,
      });
    });

    // Player joined
    socket.on(ServerEvents.PLAYER_JOINED, (payload: PlayerJoinedPayload) => {
      console.log('Player joined:', payload.player.name);
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players, { ...payload.player, hasCard: payload.player.card !== null }],
      }));
    });

    // Player left
    socket.on(ServerEvents.PLAYER_LEFT, (payload: PlayerLeftPayload) => {
      console.log('Player left:', payload.playerName);
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== payload.playerId),
      }));
    });

    // Card selected
    socket.on(ServerEvents.CARD_SELECTED, (payload: CardSelectedPayload) => {
      console.log('Card selected by player:', payload.playerId);
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => {
          if (p.id === payload.playerId) {
            // If cardValue is present (sent to selecting player), use actual value
            if (payload.cardValue !== undefined) {
              return { ...p, card: payload.cardValue, hasCard: payload.hasCard };
            } else {
              // For other players, only update hasCard (card value remains unknown)
              return { ...p, hasCard: payload.hasCard };
            }
          }
          return p;
        }),
      }));
    });

    // Cards revealed (full player data with card values)
    socket.on(ServerEvents.CARDS_REVEALED, (payload: CardsRevealedPayload) => {
      console.log('Cards revealed');
      setGameState((prev) => ({
        ...prev,
        players: payload.players.map((p) => ({ ...p, hasCard: p.card !== null })),
        isRevealed: true,
      }));
    });

    // Game reset
    socket.on(ServerEvents.GAME_RESET, (payload: GameResetPayload) => {
      console.log('Game reset');
      setGameState((prev) => ({
        ...prev,
        players: payload.players.map((p) => ({ ...p, hasCard: p.card !== null })),
        isRevealed: false,
      }));
    });

    // Error
    socket.on(ServerEvents.ERROR, (payload: ErrorPayload) => {
      console.error('Server error:', payload.message);
      setGameState((prev) => ({
        ...prev,
        error: payload.message,
      }));
    });

    // Removed from room
    socket.on(ServerEvents.REMOVED_FROM_ROOM, (payload: RemovedFromRoomPayload) => {
      console.log('Removed from room:', payload);
      setGameState((prev) => ({
        ...prev,
        removedFromRoom: payload,
      }));
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off(ServerEvents.ROOM_STATE);
      socket.off(ServerEvents.PLAYER_JOINED);
      socket.off(ServerEvents.PLAYER_LEFT);
      socket.off(ServerEvents.CARD_SELECTED);
      socket.off(ServerEvents.CARDS_REVEALED);
      socket.off(ServerEvents.GAME_RESET);
      socket.off(ServerEvents.ERROR);
      socket.off(ServerEvents.REMOVED_FROM_ROOM);
    };
  }, [socket]);

  return gameState;
}
