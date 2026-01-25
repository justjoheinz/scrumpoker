'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useGameState } from '@/hooks/useGameState';
import JoinRoomModal from '@/components/JoinRoomModal';
import PlayerList from '@/components/PlayerList';
import CardSelector from '@/components/CardSelector';
import GameControls from '@/components/GameControls';
import AlertBanner from '@/components/AlertBanner';
import RemovedFromRoom from '@/components/RemovedFromRoom';
import Navigation from '@/components/Navigation';
import { CardValue } from '@/types/game';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;

  const { socket, connectionStatus, joinRoom, selectCard, removePlayer, revealCards, resetGame } = useSocket();
  const gameState = useGameState(socket);

  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Get current player's selected card
  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);
  const selectedCard = currentPlayer?.card ?? null;

  const handleJoinRoom = useCallback(async (playerName: string, isModerator: boolean) => {
    setIsJoining(true);
    setJoinError('');

    const response = await joinRoom(roomCode, playerName, isModerator);

    setIsJoining(false);

    if (response.success) {
      setHasJoined(true);
    } else {
      setJoinError(response.error || 'Failed to join room');
      // Clear stored data if join failed
      localStorage.removeItem(`player_${roomCode}_id`);
      localStorage.removeItem(`player_${roomCode}_name`);
      localStorage.removeItem(`player_${roomCode}_isModerator`);
    }
  }, [joinRoom, roomCode]);

  // Check if already joined (from localStorage)
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player_${roomCode}_id`);
    const storedPlayerName = localStorage.getItem(`player_${roomCode}_name`);
    const storedIsModerator = localStorage.getItem(`player_${roomCode}_isModerator`) === 'true';

    // If we have stored data and socket is connected, try to rejoin
    if (storedPlayerId && storedPlayerName && socket && connectionStatus === 'connected' && !hasJoined) {
      handleJoinRoom(storedPlayerName, storedIsModerator);
    }
  }, [socket, connectionStatus, roomCode, hasJoined, handleJoinRoom]);

  const handleSelectCard = (card: CardValue | null) => {
    selectCard(roomCode, card);
  };

  const handleLeaveRoom = useCallback(() => {
    if (gameState.currentPlayerId) {
      removePlayer(roomCode, gameState.currentPlayerId);
    }
  }, [removePlayer, roomCode, gameState.currentPlayerId]);

  const handleReveal = () => {
    revealCards(roomCode);
  };

  const handleReset = () => {
    resetGame(roomCode);
  };

  // Get stored player name for removed from room message
  const storedPlayerName = typeof window !== 'undefined'
    ? localStorage.getItem(`player_${roomCode}_name`) || 'Player'
    : 'Player';

  // Get current player name for navigation
  const currentPlayerName = currentPlayer?.name;

  // Check if current player is a moderator
  const isModerator = currentPlayer?.isModerator ?? false;

  // Filter out moderators from player list and counts
  const visiblePlayers = gameState.players.filter((p) => !p.isModerator);
  const visiblePlayersWithCards = visiblePlayers.filter((p) => p.card !== null).length;

  return (
    <>
      <Navigation
        roomInfo={{
          roomCode,
          playerName: currentPlayerName,
          playerCount: visiblePlayers.length,
          connectionStatus,
        }}
        onLeaveRoom={hasJoined ? handleLeaveRoom : undefined}
      />

      {/* Removed from Room Overlay */}
      {gameState.removedFromRoom && (
        <RemovedFromRoom
          roomCode={roomCode}
          playerName={storedPlayerName}
          reason={gameState.removedFromRoom.reason}
        />
      )}

      {/* Alert Banners */}
      {connectionStatus === 'disconnected' && hasJoined && !gameState.removedFromRoom && (
        <AlertBanner
          message="Connection lost. Please check your internet connection."
          type="error"
        />
      )}
      {gameState.error && (
        <AlertBanner
          message={gameState.error}
          type="warning"
          onClose={() => {
            // Clear error - would need to add setter in useGameState
          }}
        />
      )}

      {/* Join Room Modal */}
      <JoinRoomModal
        roomCode={roomCode}
        onJoin={handleJoinRoom}
        isOpen={!hasJoined && connectionStatus === 'connected'}
        error={joinError}
        isJoining={isJoining}
      />

      <main>
        <div className="container">
          <div className="row">
            <div className="col s12">
            {/* Card Selector - hide for moderators */}
            {hasJoined && !isModerator && (
              <CardSelector
                selectedCard={selectedCard}
                onSelectCard={handleSelectCard}
                disabled={gameState.isRevealed}
              />
            )}

            {/* Game Controls */}
            {hasJoined && (
              <GameControls
                isRevealed={gameState.isRevealed}
                playersWithCards={visiblePlayersWithCards}
                totalPlayers={visiblePlayers.length}
                onReveal={handleReveal}
                onReset={handleReset}
              />
            )}
            {/* Player List - excludes moderators */}
            {hasJoined && (
              <PlayerList
                players={visiblePlayers}
                currentPlayerId={gameState.currentPlayerId}
                isRevealed={gameState.isRevealed}
              />
            )}
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
