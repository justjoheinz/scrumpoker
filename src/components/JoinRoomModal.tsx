/**
 * JoinRoomModal - Modal for entering player name to join room
 */

'use client';

import { useState, useEffect } from 'react';

interface JoinRoomModalProps {
  roomCode: string;
  onJoin: (playerName: string, isModerator: boolean) => void;
  isOpen: boolean;
  error?: string;
  isJoining?: boolean;
}

export default function JoinRoomModal({
  roomCode,
  onJoin,
  isOpen,
  error,
  isJoining = false,
}: JoinRoomModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [localError, setLocalError] = useState('');

  // Try to get stored name and moderator status
  // Priority: sessionStorage (room-specific) > localStorage (default name)
  useEffect(() => {
    const storedName = sessionStorage.getItem(`player_${roomCode}_name`);
    const storedIsModerator = sessionStorage.getItem(`player_${roomCode}_isModerator`);
    if (storedName) {
      setPlayerName(storedName);
    } else {
      // Fall back to default name from localStorage
      const defaultName = localStorage.getItem('scrumpoker_default_name');
      if (defaultName) {
        setPlayerName(defaultName);
      }
    }
    if (storedIsModerator === 'true') {
      setIsModerator(true);
    }
  }, [roomCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validate name
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
    <div
      className="modal"
      style={{
        display: 'block',
        position: 'fixed',
        zIndex: 1000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: '#fefefe',
          margin: '10% auto',
          padding: '20px',
          border: '1px solid #888',
          width: '90%',
          maxWidth: '500px',
          borderRadius: '4px',
        }}
      >
        <div className="card">
          <div className="card-content">
            <span className="card-title">Join Room: {roomCode}</span>
            <p>Enter your name to join the estimation session</p>

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

              <div style={{ marginTop: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isModerator}
                    onChange={(e) => setIsModerator(e.target.checked)}
                    disabled={isJoining}
                  />
                  <span>Join as Moderator (observe only, no card selection)</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn waves-effect waves-light teal"
                disabled={isJoining || !playerName.trim()}
                style={{ marginTop: '20px', width: '100%' }}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
                <i className="material-icons right">arrow_forward</i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
