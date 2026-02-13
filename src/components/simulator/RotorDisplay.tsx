import type { Letter } from '../../types';

type RotorDisplayProps = {
  positions: [Letter, Letter, Letter];
};

const LABELS = ['L', 'M', 'R'] as const;

export function RotorDisplay({ positions }: RotorDisplayProps) {
  return (
    <div className="rotor-display" aria-label="Rotor positions">
      {positions.map((pos, i) => (
        <div key={i} className="rotor-window">
          <span className="rotor-window-label">{LABELS[i]}</span>
          <div className="rotor-window-letter" aria-label={`${LABELS[i]} rotor: ${pos}`}>
            {pos}
          </div>
        </div>
      ))}
    </div>
  );
}
