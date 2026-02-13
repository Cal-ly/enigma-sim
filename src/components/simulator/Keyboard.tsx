import { useEffect, useCallback } from 'react';

type KeyboardProps = {
  onKeyPress: (letter: string) => void;
  disabled?: boolean;
};

/**
 * Keyboard layout matches the historical Enigma QWERTZ layout.
 */
const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export function Keyboard({ onKeyPress, disabled }: KeyboardProps) {
  const handlePhysicalKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      // Ignore if modifier keys are held (allow browser shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Don't capture keys when a form element is focused (e.g. config selects,
      // plugboard inputs, text fields) — only encrypt when focus is on body,
      // the keyboard itself, or a non-interactive element.
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
    <div className="keyboard" role="group" aria-label="Enigma keyboard">
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((letter) => (
            <button
              key={letter}
              className="key"
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
