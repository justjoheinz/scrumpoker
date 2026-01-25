/**
 * PlayerList - Display all players with their card status
 */

'use client';

import { Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
  isRevealed: boolean;
}

export default function PlayerList({
  players,
  currentPlayerId,
  isRevealed,
}: PlayerListProps) {
  const renderCardStatus = (player: Player) => {
    if (player.card === null) {
      // No card selected
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="grey-text">No card</span>
        </div>
      );
    }

    if (isRevealed && player.card) {
      // Show actual card value
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="poker-card"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            {player.card}
          </div>
        </div>
      );
    }

    // Card selected but not revealed - show face down
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          className="card-face-down"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '1.2rem',
          }}
        >
          <i className="material-icons">style</i>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-content">
        <span className="card-title">
          Players
        </span>

        {players.length === 0 ? (
          <p className="grey-text">No players in room yet</p>
        ) : (
          <ul className="collection">
            {players.map((player) => (
              <li
                key={player.id}
                className={`collection-item player-item ${
                  player.id === currentPlayerId ? 'current-player' : ''
                }`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <strong>{player.name}</strong>
                    {player.id === currentPlayerId && (
                      <span
                        className="badge teal white-text"
                        style={{ marginLeft: '10px' }}
                      >
                        You
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {renderCardStatus(player)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
