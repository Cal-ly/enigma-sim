import type { Letter } from '../../types';

type LampboardProps = {
  litLamp: Letter | null;
};

const LAMP_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export function Lampboard({ litLamp }: LampboardProps) {
  return (
    <div className="flex flex-col items-center gap-[0.35rem] py-2" aria-label="Lampboard" role="status">
      {LAMP_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-[0.35rem]">
          {row.map((letter) => {
            const isLit = litLamp === letter;
            return (
              <div
                key={letter}
                className={`w-9 h-9 flex items-center justify-center rounded-full border-2 font-mono text-[0.85rem] font-bold transition-all duration-50
                  ${isLit
                    ? 'bg-lamp-on text-bg border-lamp-on lamp-glow'
                    : 'bg-lamp-off border-border text-muted'
                  }`}
                aria-label={`Lamp ${letter}${isLit ? ' (lit)' : ''}`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
