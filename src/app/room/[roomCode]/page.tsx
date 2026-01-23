'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  const selectedCard = currentPlayer?.card || null;

  // Calculate players with cards
  const playersWithCards = gameState.players.filter((p) => p.card !== null).length;

  // Check if already joined (from localStorage)
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player_${roomCode}_id`);
    const storedPlayerName = localStorage.getItem(`player_${roomCode}_name`);

    // If we have stored data and socket is connected, try to rejoin
    if (storedPlayerId && storedPlayerName && socket && connectionStatus === 'connected' && !hasJoined) {
      handleJoinRoom(storedPlayerName);
    }
  }, [socket, connectionStatus, roomCode]);

  const handleJoinRoom = async (playerName: string) => {
    setIsJoining(true);
    setJoinError('');

    const response = await joinRoom(roomCode, playerName);

    setIsJoining(false);

    if (response.success) {
      setHasJoined(true);
    } else {
      setJoinError(response.error || 'Failed to join room');
      // Clear stored data if join failed
      localStorage.removeItem(`player_${roomCode}_id`);
      localStorage.removeItem(`player_${roomCode}_name`);
    }
  };

  const handleSelectCard = (card: CardValue | null) => {
    selectCard(roomCode, card);
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(roomCode, playerId);
  };

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

  return (
    <>
      <Navigation
        roomInfo={{
          roomCode,
          playerName: currentPlayerName,
          playerCount: gameState.players.length,
          connectionStatus,
        }}
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
            {/* Card Selector */}
            {hasJoined && (
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
                playersWithCards={playersWithCards}
                totalPlayers={gameState.players.length}
                onReveal={handleReveal}
                onReset={handleReset}
              />
            )}
            {/* Player List */}
            {hasJoined && (
              <PlayerList
                players={gameState.players}
                currentPlayerId={gameState.currentPlayerId}
                isRevealed={gameState.isRevealed}
                onRemovePlayer={handleRemovePlayer}
              />
            )}
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
