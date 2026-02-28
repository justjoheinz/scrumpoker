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
        <div className="player-card-placeholder">
          <span className="grey-text">—</span>
        </div>
      );
    }

    if (isRevealed && player.card) {
      // Show actual card value
      return (
        <div className="player-card-revealed">
          {player.card}
        </div>
      );
    }

    // Card selected but not revealed - flat dark block
    return (
      <div className="card-face-down" />
    );
  };

  return (
    <div className="card">
      <div className="card-content">
        <span className="section-label">Players</span>

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
