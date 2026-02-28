/**
 * GameControls - Reveal and Reset buttons
 */

"use client";

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
        <span className="section-label">Controls</span>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Reveal Button */}
          <button
            className="btn btn-accent"
            onClick={onReveal}
            disabled={!canReveal}
            style={{ flex: "1", minWidth: "200px" }}
          >
            Reveal
          </button>

          {/* Reset Button */}
          <button
            className="btn btn-accent"
            onClick={onReset}
            disabled={!canReset}
            style={{ flex: "1", minWidth: "200px" }}
          >
            Reset
          </button>
        </div>

        <div className="game-controls-status">
          {!isRevealed && (
            <span style={playersWithCards > 0 && playersWithCards === totalPlayers ? { color: 'var(--color-accent)' } : undefined}>
              {playersWithCards}/{totalPlayers} players have selected cards
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
