import type { Letter } from '../../types';

type LampboardProps = {
  litLamp: Letter | null;
};

/**
 * Lampboard layout follows the historical Enigma keyboard layout:
 * Row 1: Q W E R T Z U I O
 * Row 2: A S D F G H J K
 * Row 3: P Y X C V B N M L
 */
const LAMP_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export function Lampboard({ litLamp }: LampboardProps) {
  return (
    <div className="lampboard" aria-label="Lampboard" role="status">
      {LAMP_ROWS.map((row, ri) => (
        <div key={ri} className="lampboard-row">
          {row.map((letter) => (
            <div
              key={letter}
              className={`lamp${litLamp === letter ? ' lit' : ''}`}
              aria-label={`Lamp ${letter}${litLamp === letter ? ' (lit)' : ''}`}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
