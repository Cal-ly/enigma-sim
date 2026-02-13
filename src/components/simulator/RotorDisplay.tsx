import type { Letter } from '../../types';

type RotorDisplayProps = {
  positions: Letter[];
};

const LABELS_3 = ['L', 'M', 'R'] as const;
const LABELS_4 = ['G', 'L', 'M', 'R'] as const;

export function RotorDisplay({ positions }: RotorDisplayProps) {
  const labels = positions.length === 4 ? LABELS_4 : LABELS_3;
  return (
    <div className="flex justify-center gap-3 py-2" aria-label="Rotor positions">
      {positions.map((pos, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[0.7rem] uppercase text-muted tracking-wide">
            {labels[i]}
          </span>
          <div
            className="w-12 h-14 flex items-center justify-center bg-bg border-2 border-border rounded-default font-mono text-2xl font-bold text-lamp-on"
            aria-label={`${labels[i]} rotor: ${pos}`}
          >
            {pos}
          </div>
        </div>
      ))}
    </div>
  );
}
