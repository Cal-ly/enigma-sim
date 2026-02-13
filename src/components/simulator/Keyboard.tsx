import { useEffect, useCallback } from 'react';

type KeyboardProps = {
  onKeyPress: (letter: string) => void;
  disabled?: boolean;
};

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export function Keyboard({ onKeyPress, disabled }: KeyboardProps) {
  const handlePhysicalKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const active = document.activeElement;
      if (active && (active instanceof HTMLInputElement ||
                     active instanceof HTMLSelectElement ||
                     active instanceof HTMLTextAreaElement)) {
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        onKeyPress(key);
      }
    },
    [onKeyPress, disabled],
  );

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKey);
    return () => window.removeEventListener('keydown', handlePhysicalKey);
  }, [handlePhysicalKey]);

  return (
    <div className="flex flex-col items-center gap-[0.35rem] py-2" role="group" aria-label="Enigma keyboard">
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-[0.35rem]">
          {row.map((letter) => (
            <button
              key={letter}
              className="w-9 h-9 flex items-center justify-center rounded-default bg-key-bg border border-border font-mono text-[0.85rem] font-bold text-foreground cursor-pointer select-none transition-all duration-100 hover:bg-key-hover active:bg-key-active active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => !disabled && onKeyPress(letter)}
              disabled={disabled}
              aria-label={`Key ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
