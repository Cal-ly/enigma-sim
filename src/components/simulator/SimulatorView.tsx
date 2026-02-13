import { useState, useCallback, useRef } from 'react';
import { useEnigma } from '../../hooks/useEnigma';
import { MachineConfig } from './MachineConfig';
import { PlugboardConfig } from './PlugboardConfig';
import { RotorDisplay } from './RotorDisplay';
import { Lampboard } from './Lampboard';
import { Keyboard } from './Keyboard';
import type { Letter } from '../../types';

const LAMP_DURATION_MS = 200;

export function SimulatorView() {
  const enigma = useEnigma();
  const [litLamp, setLitLamp] = useState<Letter | null>(null);
  const lampTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleKeyPress = useCallback(
    (letter: string) => {
      if (enigma.hasRotorConflict) return;

      const result = enigma.pressKey(letter);
      if (!result) return;

      // Light the output lamp briefly
      if (lampTimerRef.current) clearTimeout(lampTimerRef.current);
      setLitLamp(result.outputLetter);
      lampTimerRef.current = setTimeout(() => setLitLamp(null), LAMP_DURATION_MS);
    },
    [enigma],
  );

  const handleResetPositions = useCallback(() => {
    enigma.resetPositions();
    setLitLamp(null);
  }, [enigma]);

  const handleClearAll = useCallback(() => {
    enigma.configure({
      rotors: [
        { name: 'I', ringSetting: 1, position: 'A' },
        { name: 'II', ringSetting: 1, position: 'A' },
        { name: 'III', ringSetting: 1, position: 'A' },
      ],
      reflector: 'UKW-B',
      plugboardPairs: [],
    });
    setLitLamp(null);
  }, [enigma]);

  // Format message in 5-letter groups for readability
  const formatMessage = (text: string): string => {
    return text.replace(/(.{5})/g, '$1 ').trim();
  };

  return (
    <div className="simulator">
      <MachineConfig
        config={enigma.config}
        hasRotorConflict={enigma.hasRotorConflict}
        onUpdateRotor={enigma.updateRotor}
        onUpdateReflector={enigma.updateReflector}
      />

      <PlugboardConfig
        pairs={enigma.config.plugboardPairs}
        onAddPair={enigma.addPlugboardPair}
        onRemovePair={enigma.removePlugboardPair}
      />

      <RotorDisplay positions={enigma.state.rotorPositions} />

      <Lampboard litLamp={litLamp} />

      <Keyboard
        onKeyPress={handleKeyPress}
        disabled={enigma.hasRotorConflict}
      />

      <section className="message-display">
        <h3>Messages</h3>
        <div className="message-rows">
          <div className="message-row">
            <span className="message-row-label">Input</span>
            <span className="message-row-text">
              {enigma.state.inputHistory
                ? formatMessage(enigma.state.inputHistory)
                : '\u00A0'}
            </span>
          </div>
          <div className="message-row">
            <span className="message-row-label">Output</span>
            <span className="message-row-text">
              {enigma.state.outputHistory
                ? formatMessage(enigma.state.outputHistory)
                : '\u00A0'}
            </span>
          </div>
        </div>
      </section>

      <div className="controls">
        <button onClick={handleResetPositions}>Reset Positions</button>
        <button onClick={handleClearAll}>Clear All</button>
      </div>
    </div>
  );
}
