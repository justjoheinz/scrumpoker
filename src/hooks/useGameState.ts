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
import { createClientLogger } from '@/lib/logger';

const log = createClientLogger('useGameState');

interface GameState {
  players: Player[];
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
      log.debug('Room state received:', payload);
      setGameState({
        players: payload.players,
        isRevealed: payload.isRevealed,
        currentPlayerId: payload.currentPlayerId,
        error: null,
        removedFromRoom: null,
      });
    });

    // Player joined
    socket.on(ServerEvents.PLAYER_JOINED, (payload: PlayerJoinedPayload) => {
      log.debug('Player joined:', payload.player.name);
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players, payload.player],
      }));
    });

    // Player left
    socket.on(ServerEvents.PLAYER_LEFT, (payload: PlayerLeftPayload) => {
      log.debug('Player left:', payload.playerName);
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== payload.playerId),
      }));
    });

    // Card selected
    socket.on(ServerEvents.CARD_SELECTED, (payload: CardSelectedPayload) => {
      log.debug('Card selected by player:', payload.playerId);
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === payload.playerId ? { ...p, card: payload.card } : p
        ),
      }));
    });

    // Cards revealed (full player data with card values)
    socket.on(ServerEvents.CARDS_REVEALED, (payload: CardsRevealedPayload) => {
      log.debug('Cards revealed');
      setGameState((prev) => ({
        ...prev,
        players: payload.players,
        isRevealed: true,
      }));
    });

    // Game reset
    socket.on(ServerEvents.GAME_RESET, (payload: GameResetPayload) => {
      log.debug('Game reset');
      setGameState((prev) => ({
        ...prev,
        players: payload.players,
        isRevealed: false,
      }));
    });

    // Error
    socket.on(ServerEvents.ERROR, (payload: ErrorPayload) => {
      log.error('Server error:', payload.message);
      setGameState((prev) => ({
        ...prev,
        error: payload.message,
      }));
    });

    // Removed from room
    socket.on(ServerEvents.REMOVED_FROM_ROOM, (payload: RemovedFromRoomPayload) => {
      log.debug('Removed from room:', payload);
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
