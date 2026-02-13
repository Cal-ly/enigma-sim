import { useState } from 'react';
import { ALPHABET } from '../../engine';
import type { Letter } from '../../types';

type PlugboardConfigProps = {
  pairs: [Letter, Letter][];
  onAddPair: (a: Letter, b: Letter) => void;
  onRemovePair: (index: number) => void;
};

const selectCls =
  'bg-bg text-foreground border border-border rounded-default px-1.5 py-1 font-mono text-[0.85rem]';

export function PlugboardConfig({ pairs, onAddPair, onRemovePair }: PlugboardConfigProps) {
  const [letterA, setLetterA] = useState('');
  const [letterB, setLetterB] = useState('');

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

  const availableForB = availableLetters.filter((ch) => ch !== letterA);

  return (
    <section className="bg-surface rounded-default p-3 sm:p-4 border border-border">
      <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-widest text-muted">
        Plugboard ({pairs.length}/13 pairs)
      </h3>

      <div className="flex gap-2 flex-wrap mb-3 min-h-8">
        {pairs.length === 0 && (
          <span className="text-muted text-[0.85rem]">
            No pairs configured (passthrough)
          </span>
        )}
        {pairs.map(([a, b], i) => (
          <div
            key={`${a}${b}`}
            className="flex items-center gap-0.5 bg-surface-alt rounded-default px-2 py-1 font-mono text-[0.85rem]"
          >
            <span>{a}↔{b}</span>
            <button
              onClick={() => onRemovePair(i)}
              aria-label={`Remove pair ${a}-${b}`}
              title="Remove pair"
              className="bg-transparent border-none text-accent cursor-pointer text-xs px-1 ml-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {canAddMore && (
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={letterA}
            onChange={(e) => {
              setLetterA(e.target.value);
              if (e.target.value === letterB) setLetterB('');
            }}
            aria-label="First letter"
            className={selectCls}
          >
            <option value="">—</option>
            {availableLetters.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          <span className="text-muted">↔</span>
          <select
            value={letterB}
            onChange={(e) => setLetterB(e.target.value)}
            aria-label="Second letter"
            className={selectCls}
          >
            <option value="">—</option>
            {availableForB.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!letterA || !letterB}
            className="bg-surface-alt text-foreground border border-border rounded-default px-3 py-1 cursor-pointer text-[0.85rem] transition-all duration-150 hover:not-disabled:bg-accent hover:not-disabled:border-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      )}
    </section>
  );
}
