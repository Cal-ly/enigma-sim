import { useState } from 'react';
import { ALPHABET } from '../../engine';
import type { Letter } from '../../types';

type PlugboardConfigProps = {
  pairs: [Letter, Letter][];
  onAddPair: (a: Letter, b: Letter) => void;
  onRemovePair: (index: number) => void;
};

export function PlugboardConfig({ pairs, onAddPair, onRemovePair }: PlugboardConfigProps) {
  const [letterA, setLetterA] = useState('');
  const [letterB, setLetterB] = useState('');

  // Letters already in use by existing pairs
  const usedLetters = new Set(pairs.flatMap(([a, b]) => [a, b]));
  const availableLetters = ALPHABET.split('').filter((ch) => !usedLetters.has(ch));
  const canAddMore = pairs.length < 13 && availableLetters.length >= 2;

  const handleAdd = () => {
    if (letterA && letterB && letterA !== letterB) {
      onAddPair(letterA, letterB);
      setLetterA('');
      setLetterB('');
    }
  };

  // When a letter is selected for A, B can't be the same
  const availableForB = availableLetters.filter((ch) => ch !== letterA);

  return (
    <section className="plugboard-config">
      <h3>Plugboard ({pairs.length}/13 pairs)</h3>

      <div className="plugboard-pairs">
        {pairs.length === 0 && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No pairs configured (passthrough)
          </span>
        )}
        {pairs.map(([a, b], i) => (
          <div key={`${a}${b}`} className="plugboard-pair">
            <span>{a}↔{b}</span>
            <button
              onClick={() => onRemovePair(i)}
              aria-label={`Remove pair ${a}-${b}`}
              title="Remove pair"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {canAddMore && (
        <div className="plugboard-add">
          <select
            value={letterA}
            onChange={(e) => {
              setLetterA(e.target.value);
              // Reset B if it conflicts
              if (e.target.value === letterB) setLetterB('');
            }}
            aria-label="First letter"
          >
            <option value="">—</option>
            {availableLetters.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          <span style={{ color: 'var(--color-text-muted)' }}>↔</span>
          <select
            value={letterB}
            onChange={(e) => setLetterB(e.target.value)}
            aria-label="Second letter"
          >
            <option value="">—</option>
            {availableForB.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!letterA || !letterB}
          >
            Add
          </button>
        </div>
      )}
    </section>
  );
}
