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
  reconnectPlayer,
} from '../game/room-manager';
import { Player } from '@/types/game';
import {
  revealCards,
  resetGame,
} from '../game/game-logic';
import { RECONNECTION_GRACE_PERIOD } from '@/types/game';
import { startCleanupTask } from '../game/room-manager';
import { createLogger } from '../logger';

const log = createLogger('socket');

// Track disconnected players with timeouts for reconnection grace period
const disconnectedPlayers = new Map<
  string,
  { roomCode: string; timeout: NodeJS.Timeout }
>();

export function setupSocketHandlers(io: SocketIOServer): void {
  log.info('Setting up Socket.io handlers');

  // Start periodic room cleanup
  startCleanupTask();

  io.on('connection', (socket: Socket) => {
    log.debug(`Client connected: ${socket.id}`);

    let currentRoomCode: string | null = null;

    // ========== JOIN ROOM ==========
    socket.on(
      ClientEvents.JOIN_ROOM,
      (payload: JoinRoomPayload, callback: (response: JoinRoomResponse) => void) => {
        const { roomCode, playerName, reconnectPlayerId, isModerator = false } = payload;

        let player: Player | undefined;
        let isReconnection = false;

        // Attempt reconnection if valid reconnectPlayerId provided
        if (reconnectPlayerId) {
          // Clear any pending disconnect timeout
          if (disconnectedPlayers.has(reconnectPlayerId)) {
            const { timeout } = disconnectedPlayers.get(reconnectPlayerId)!;
            clearTimeout(timeout);
            disconnectedPlayers.delete(reconnectPlayerId);
          }

          // Try to reconnect if old player exists in room with matching name
          // (handles race condition where join-room arrives before disconnect)
          const oldPlayer = getPlayer(roomCode, reconnectPlayerId);
          if (oldPlayer && oldPlayer.name.toLowerCase() === playerName.toLowerCase()) {
            player = reconnectPlayer(roomCode, reconnectPlayerId, socket.id);
            if (player) {
              isReconnection = true;
            }
          }
        }

        // Fall back to normal join if not reconnecting
        if (!player) {
          const result = addPlayer(roomCode, socket.id, playerName, isModerator);
          if (!result.success) {
            callback({ success: false, error: result.error });
            return;
          }
          player = getPlayer(roomCode, socket.id);
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

          // Only broadcast join if NOT a reconnection (seamless for others)
          if (!isReconnection && player) {
            const joinedPayload: PlayerJoinedPayload = { player };
            socket.to(roomCode).emit(ServerEvents.PLAYER_JOINED, joinedPayload);
          }
        }
      }
    );

    // ========== SELECT CARD ==========
    socket.on(ClientEvents.SELECT_CARD, (payload: SelectCardPayload) => {
      const { roomCode, card } = payload;

      // Moderators cannot select cards
      const player = getPlayer(roomCode, socket.id);
      if (player?.isModerator) {
        return;
      }

      // Handle both select and unselect
      const success = updatePlayerCard(roomCode, socket.id, card);

      if (success) {
        // Notify all players (UI uses isRevealed to hide card values)
        const cardSelectedPayload: CardSelectedPayload = {
          playerId: socket.id,
          card,
        };
        io.to(roomCode).emit(ServerEvents.CARD_SELECTED, cardSelectedPayload);
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
      log.debug(`Client disconnected: ${socket.id}`);

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

          log.debug(
            `Player ${player.name} disconnected. Grace period: ${RECONNECTION_GRACE_PERIOD}ms`
          );
        }
      }
    });
  });
}
