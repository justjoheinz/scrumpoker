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
    <div className="card">
      <div className="card-content">
        <span className="card-title">Select Your Card</span>
        {disabled && (
          <p className="grey-text">
            <i className="material-icons tiny">lock</i> <strong>Card selection disabled (cards revealed)</strong>
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '15px',
            marginTop: '20px',
          }}
        >
          {CARD_VALUES.map((card) => (
            <div
              key={card}
              className={`poker-card card ${selectedCard === card ? 'selected' : ''} ${
                disabled ? '' : ''
              }`}
              onClick={() => {
                if (disabled) return;
                // Toggle: if clicking selected card, unselect it (pass null)
                onSelectCard(selectedCard === card ? null : card);
              }}
              style={{
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <div className="card-content">
                {card}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
