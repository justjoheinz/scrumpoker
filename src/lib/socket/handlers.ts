/**
 * Socket.io event handlers
 * Sets up all WebSocket event listeners and handlers
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  ClientEvents,
  ServerEvents,
  JoinRoomPayload,
  JoinRoomResponse,
  SelectCardPayload,
  RevealCardsPayload,
  ResetGamePayload,
  RemovePlayerPayload,
  RoomStatePayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  CardSelectedPayload,
  CardsRevealedPayload,
  GameResetPayload,
  RemovedFromRoomPayload,
} from '@/types/socket-events';
import {
  addPlayer,
  removePlayer,
  updatePlayerCard,
  getRoomState,
  getPlayer,
} from '../game/room-manager';
import {
  revealCards,
  resetGame,
} from '../game/game-logic';
import { RECONNECTION_GRACE_PERIOD } from '@/types/game';
import { startCleanupTask } from '../game/room-manager';

// Track disconnected players with timeouts for reconnection grace period
const disconnectedPlayers = new Map<
  string,
  { roomCode: string; timeout: NodeJS.Timeout }
>();

export function setupSocketHandlers(io: SocketIOServer): void {
  console.log('Setting up Socket.io handlers...');

  // Start periodic room cleanup
  startCleanupTask();

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    let currentRoomCode: string | null = null;

    // ========== JOIN ROOM ==========
    socket.on(
      ClientEvents.JOIN_ROOM,
      (payload: JoinRoomPayload, callback: (response: JoinRoomResponse) => void) => {
        const { roomCode, playerName, reconnectPlayerId } = payload;

        // If reconnecting, clear the disconnection timeout
        if (reconnectPlayerId && disconnectedPlayers.has(reconnectPlayerId)) {
          const { timeout } = disconnectedPlayers.get(reconnectPlayerId)!;
          clearTimeout(timeout);
          disconnectedPlayers.delete(reconnectPlayerId);
          console.log(`Player ${reconnectPlayerId} reconnected`);
        }

        // Add player to room
        const result = addPlayer(roomCode, socket.id, playerName);

        if (!result.success) {
          callback({ success: false, error: result.error });
          return;
        }

        // Join socket.io room
        socket.join(roomCode);
        currentRoomCode = roomCode;

        // Send success response
        callback({ success: true, playerId: socket.id });

        // Get current room state
        const roomState = getRoomState(roomCode);

        if (roomState) {
          // Send full room state to the joining player
          const statePayload: RoomStatePayload = {
            ...roomState,
            currentPlayerId: socket.id,
          };
          socket.emit(ServerEvents.ROOM_STATE, statePayload);

          // Notify other players
          const player = getPlayer(roomCode, socket.id);
          if (player) {
            const joinedPayload: PlayerJoinedPayload = { player };
            socket.to(roomCode).emit(ServerEvents.PLAYER_JOINED, joinedPayload);
          }
        }
      }
    );

    // ========== SELECT CARD ==========
    socket.on(ClientEvents.SELECT_CARD, (payload: SelectCardPayload) => {
      const { roomCode, card } = payload;

      // Handle both select and unselect
      const success = updatePlayerCard(roomCode, socket.id, card);

      if (success) {
        // Notify the selecting player with actual card value (for UI feedback)
        const selfPayload: CardSelectedPayload = {
          playerId: socket.id,
          hasCard: card !== null,
          cardValue: card,  // Send actual value to selecting player
        };
        socket.emit(ServerEvents.CARD_SELECTED, selfPayload);

        // Notify other players (card value hidden until reveal)
        const othersPayload: CardSelectedPayload = {
          playerId: socket.id,
          hasCard: card !== null,
        };
        socket.to(roomCode).emit(ServerEvents.CARD_SELECTED, othersPayload);
      }
    });

    // ========== REVEAL CARDS ==========
    socket.on(ClientEvents.REVEAL_CARDS, (payload: RevealCardsPayload) => {
      const { roomCode } = payload;

      const result = revealCards(roomCode);

      if (result.success && result.players) {
        // Notify all players with sorted list
        const revealPayload: CardsRevealedPayload = {
          players: result.players,
        };
        io.to(roomCode).emit(ServerEvents.CARDS_REVEALED, revealPayload);
      }
    });

    // ========== RESET GAME ==========
    socket.on(ClientEvents.RESET_GAME, (payload: ResetGamePayload) => {
      const { roomCode } = payload;

      const result = resetGame(roomCode);

      if (result.success && result.players) {
        // Notify all players with alphabetically sorted list
        const resetPayload: GameResetPayload = {
          players: result.players,
        };
        io.to(roomCode).emit(ServerEvents.GAME_RESET, resetPayload);
      }
    });

    // ========== REMOVE PLAYER ==========
    socket.on(ClientEvents.REMOVE_PLAYER, (payload: RemovePlayerPayload) => {
      const { roomCode, playerId } = payload;

      const player = getPlayer(roomCode, playerId);

      if (player) {
        // Remove player
        removePlayer(roomCode, playerId);

        // Get the socket of the player being removed
        const targetSocket = io.sockets.sockets.get(playerId);

        if (targetSocket) {
          // Notify the removed player before disconnecting
          const removedPayload: RemovedFromRoomPayload = {
            roomCode,
            reason: socket.id === playerId ? 'self' : 'other',
          };
          targetSocket.emit(ServerEvents.REMOVED_FROM_ROOM, removedPayload);

          // Small delay to ensure the message is received before disconnect
          setTimeout(() => {
            targetSocket.leave(roomCode);
            targetSocket.disconnect(true);
          }, 100);
        }

        // Notify remaining players
        const leftPayload: PlayerLeftPayload = {
          playerId: player.id,
          playerName: player.name,
        };
        io.to(roomCode).emit(ServerEvents.PLAYER_LEFT, leftPayload);
      }
    });

    // ========== DISCONNECT ==========
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (currentRoomCode) {
        // Capture room code in closure for setTimeout
        const roomCode = currentRoomCode;
        const player = getPlayer(roomCode, socket.id);

        if (player) {
          // Set grace period timeout
          const timeout = setTimeout(() => {
            // Remove player after grace period
            removePlayer(roomCode, socket.id);

            // Notify other players
            const leftPayload: PlayerLeftPayload = {
              playerId: socket.id,
              playerName: player.name,
            };
            io.to(roomCode).emit(ServerEvents.PLAYER_LEFT, leftPayload);

            disconnectedPlayers.delete(socket.id);
          }, RECONNECTION_GRACE_PERIOD);

          disconnectedPlayers.set(socket.id, {
            roomCode,
            timeout,
          });

          console.log(
            `Player ${player.name} disconnected. Grace period: ${RECONNECTION_GRACE_PERIOD}ms`
          );
        }
      }
    });
  });
}
