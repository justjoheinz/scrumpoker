/**
 * GameControls - Reveal and Reset buttons
 */

'use client';

interface GameControlsProps {
  isRevealed: boolean;
  playersWithCards: number;
  totalPlayers: number;
  onReveal: () => void;
  onReset: () => void;
}

export default function GameControls({
  isRevealed,
  playersWithCards,
  totalPlayers,
  onReveal,
  onReset,
}: GameControlsProps) {
  const canReveal = !isRevealed && playersWithCards >= 1;
  const canReset = isRevealed;

  return (
    <div className="card">
      <div className="card-content">
      
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          {/* Reveal Button */}
          <button
            className="btn waves-effect waves-light blue"
            onClick={onReveal}
            disabled={!canReveal}
            style={{ flex: '1', minWidth: '200px' }}
          >
            <i className="material-icons left">visibility</i>
            Reveal Cards
          </button>

          {/* Reset Button */}
          <button
            className="btn waves-effect waves-light orange"
            onClick={onReset}
            disabled={!canReset}
            style={{ flex: '1', minWidth: '200px' }}
          >
            <i className="material-icons left">refresh</i>
            Reset Game
          </button>
        </div>

        {/* Helper text */}
        <div style={{ marginTop: '15px' }}>
          {!isRevealed && (
            <p className="grey-text">
              <i className="material-icons tiny">info</i>{' '}
              {playersWithCards}/{totalPlayers} players have selected cards
              {!canReveal && (
                <span> - Need at least 1 player with a card to reveal</span>
              )}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
