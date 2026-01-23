/**
 * useSocket hook - Manages Socket.io client connection
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ClientEvents,
  ServerEvents,
  JoinRoomPayload,
  JoinRoomResponse,
  SelectCardPayload,
  RevealCardsPayload,
  ResetGamePayload,
  RemovePlayerPayload,
} from '@/types/socket-events';
import { CardValue } from '@/types/game';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface UseSocketReturn {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  joinRoom: (roomCode: string, playerName: string) => Promise<JoinRoomResponse>;
  selectCard: (roomCode: string, card: CardValue | null) => void;
  revealCards: (roomCode: string) => void;
  resetGame: (roomCode: string) => void;
  removePlayer: (roomCode: string, playerId: string) => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    // Create socket connection
    const socketInstance = io({
      transports: ['websocket', 'polling'],
    });

    setConnectionStatus('connecting');

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnectionStatus('connected');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('disconnected');
    });

    socketInstance.io.on('reconnect_attempt', () => {
      console.log('Socket reconnecting...');
      setConnectionStatus('reconnecting');
    });

    socketInstance.io.on('reconnect', () => {
      console.log('Socket reconnected');
      setConnectionStatus('connected');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.close();
    };
  }, []);

  // Join room with callback-based response
  const joinRoom = useCallback(
    (roomCode: string, playerName: string): Promise<JoinRoomResponse> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ success: false, error: 'Socket not connected' });
          return;
        }

        // Get reconnect ID from localStorage if exists
        const reconnectPlayerId = localStorage.getItem(`player_${roomCode}_id`) || undefined;

        const payload: JoinRoomPayload = {
          roomCode,
          playerName,
          reconnectPlayerId,
        };

        socket.emit(ClientEvents.JOIN_ROOM, payload, (response: JoinRoomResponse) => {
          if (response.success && response.playerId) {
            // Store player info in localStorage for reconnection
            localStorage.setItem(`player_${roomCode}_id`, response.playerId);
            localStorage.setItem(`player_${roomCode}_name`, playerName);
          }
          resolve(response);
        });
      });
    },
    [socket]
  );

  // Select a card (or unselect if card is null)
  const selectCard = useCallback(
    (roomCode: string, card: CardValue | null) => {
      if (!socket) return;

      const payload: SelectCardPayload = {
        roomCode,
        card,  // Can now be null for unselection
      };

      socket.emit(ClientEvents.SELECT_CARD, payload);
    },
    [socket]
  );

  // Reveal all cards
  const revealCards = useCallback(
    (roomCode: string) => {
      if (!socket) return;

      const payload: RevealCardsPayload = {
        roomCode,
      };

      socket.emit(ClientEvents.REVEAL_CARDS, payload);
    },
    [socket]
  );

  // Reset game
  const resetGame = useCallback(
    (roomCode: string) => {
      if (!socket) return;

      const payload: ResetGamePayload = {
        roomCode,
      };

      socket.emit(ClientEvents.RESET_GAME, payload);
    },
    [socket]
  );

  // Remove a player
  const removePlayer = useCallback(
    (roomCode: string, playerId: string) => {
      if (!socket) return;

      const payload: RemovePlayerPayload = {
        roomCode,
        playerId,
      };

      socket.emit(ClientEvents.REMOVE_PLAYER, payload);
    },
    [socket]
  );

  return {
    socket,
    connectionStatus,
    joinRoom,
    selectCard,
    revealCards,
    resetGame,
    removePlayer,
  };
}
