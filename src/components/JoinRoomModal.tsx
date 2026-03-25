/**
 * JoinRoomModal - Modal for entering player name to join room
 */

'use client';

import { useState, useEffect } from 'react';

interface JoinRoomModalProps {
  roomCode: string;
  onJoin: (playerName: string, isModerator: boolean) => void;
  onCancel?: () => void;
  isOpen: boolean;
  error?: string;
  isJoining?: boolean;
}

export default function JoinRoomModal({
  roomCode,
  onJoin,
  onCancel,
  isOpen,
  error,
  isJoining = false,
}: JoinRoomModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const storedName = sessionStorage.getItem(`player_${roomCode}_name`);
    const storedIsModerator = sessionStorage.getItem(`player_${roomCode}_isModerator`);
    if (storedName) {
      setPlayerName(storedName);
    } else {
      const defaultName = localStorage.getItem('scrumpoker_default_name');
      if (defaultName) setPlayerName(defaultName);
    }
    if (storedIsModerator === 'true') setIsModerator(true);
  }, [roomCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!playerName.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    if (playerName.trim().length > 50) {
      setLocalError('Name must be 50 characters or less');
      return;
    }

    onJoin(playerName.trim(), isModerator);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="card modal-card">
        <div className="card-content">
          <span className="section-label">Join Room {roomCode}</span>

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setLocalError('');
                }}
                placeholder="Your name"
                maxLength={50}
                autoFocus
                disabled={isJoining}
              />
              <label htmlFor="player-name" className="active">
                Your Name
              </label>
              {(localError || error) && (
                <span className="helper-text red-text">{localError || error}</span>
              )}
            </div>

            <div className="modal-moderator">
              <label>
                <input
                  id="moderator-checkbox"
                  type="checkbox"
                  checked={isModerator}
                  onChange={(e) => setIsModerator(e.target.checked)}
                  disabled={isJoining}
                />
                <span>Moderator (no card selection)</span>
              </label>
            </div>

            <div className="modal-actions">
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                  disabled={isJoining}
                >
                  Cancel
                </button>
              )}
              <button
                id="join-room-button"
                type="submit"
                className="btn btn-accent"
                disabled={isJoining || !playerName.trim()}
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
