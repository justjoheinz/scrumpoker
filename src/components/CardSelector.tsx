/**
 * CardSelector - Card selection UI for Scrum Poker
 */

'use client';

import { CARD_VALUES, CardValue } from '@/types/game';

interface CardSelectorProps {
  selectedCard: CardValue | null;
  onSelectCard: (card: CardValue) => void;
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
            <i className="material-icons tiny">lock</i> Card selection disabled (cards revealed)
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
              onClick={() => !disabled && onSelectCard(card)}
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

        {selectedCard && !disabled && (
          <p style={{ marginTop: '20px', color: '#26a69a' }}>
            <i className="material-icons tiny">check_circle</i> You selected: <strong>{selectedCard}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
