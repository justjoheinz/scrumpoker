/**
 * RemovedFromRoom - Display when player is removed from room
 */

'use client';

import { useRouter } from 'next/navigation';

interface RemovedFromRoomProps {
  roomCode: string;
  playerName: string;
  reason: 'self' | 'other';
}

export default function RemovedFromRoom({
  roomCode,
  playerName,
  reason,
}: RemovedFromRoomProps) {
  const router = useRouter();

  const handleRejoin = () => {
    // Clear sessionStorage to allow rejoining
    sessionStorage.removeItem(`player_${roomCode}_id`);
    sessionStorage.removeItem(`player_${roomCode}_name`);
    sessionStorage.removeItem(`player_${roomCode}_isModerator`);
    // Reload the page to rejoin
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="removed-overlay">
      <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="card-content">
          <span className="card-title">
            <i className="material-icons left" style={{ color: 'var(--color-status-orange)' }}>
              info
            </i>
            {reason === 'self' ? 'You Left the Room' : 'You Were Removed from the Room'}
          </span>

          <p style={{ marginTop: '20px', fontSize: '1.1rem' }}>
            {reason === 'self' ? (
              <>
                <strong>{playerName}</strong>, you have left the room.
              </>
            ) : (
              <>
                <strong>{playerName}</strong>, you have been removed from the room by another
                player.
              </>
            )}
          </p>

          <div className="removed-info-box">
            <p className="removed-info-text">
              <strong>Room Code:</strong> {roomCode}
            </p>
            <p className="removed-info-text-spaced">
              <strong>Room URL:</strong>{' '}
              <code className="removed-code">
                {window.location.origin}/room/{roomCode}
              </code>
            </p>
          </div>

          <p className="removed-help-text">
            You can rejoin the room by clicking the button below or by visiting the room URL again.
          </p>
        </div>

        <div className="card-action" style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn waves-effect waves-light teal"
            onClick={handleRejoin}
            style={{ flex: 1 }}
          >
            <i className="material-icons left">refresh</i>
            Rejoin Room
          </button>

          <button
            className="btn waves-effect waves-light grey"
            onClick={handleGoHome}
            style={{ flex: 1 }}
          >
            <i className="material-icons left">home</i>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
