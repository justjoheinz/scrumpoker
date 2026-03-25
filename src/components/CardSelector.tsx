/**
 * CardSelector - Card selection UI for Scrum Poker
 */

'use client';

import { CARD_VALUES, CardValue } from '@/types/game';

interface CardSelectorProps {
  selectedCard: CardValue | null;
  onSelectCard: (card: CardValue | null) => void;
  disabled: boolean;
}

export default function CardSelector({
  selectedCard,
  onSelectCard,
  disabled,
}: CardSelectorProps) {
  return (
    <div id="card-selector" className="card">
      <div className="card-content">
        <span className="section-label">Select Your Card</span>

        <div className="card-selector-grid">
          {CARD_VALUES.map((card) => (
            <button
              key={card}
              id={`card-${card}`}
              className={`poker-card-btn${selectedCard === card ? ' selected' : ''}`}
              onClick={() => onSelectCard(selectedCard === card ? null : card)}
              disabled={disabled}
              aria-pressed={selectedCard === card}
              aria-label={`Select ${card}`}
              data-testid={`card-${card}`}
            >
              {card}
            </button>
          ))}
        </div>

        <div className="game-controls-status">
          {disabled && (
            <span>Cards revealed — selection disabled</span>
          )}
        </div>
      </div>
    </div>
  );
}
