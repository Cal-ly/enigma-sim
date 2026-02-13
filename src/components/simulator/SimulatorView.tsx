import { useState, useCallback, useRef, useEffect } from 'react';
import { useEnigma } from '../../hooks/useEnigma';
import { MachineConfig } from './MachineConfig';
import { PlugboardConfig } from './PlugboardConfig';
import { RotorDisplay } from './RotorDisplay';
import { Lampboard } from './Lampboard';
import { Keyboard } from './Keyboard';
import type { Letter } from '../../types';

const LAMP_DURATION_MS = 200;

/** Format message in 5-letter groups for readability */
function formatMessage(text: string): string {
  return text.replace(/(.{5})/g, '$1 ').trim();
}

export function SimulatorView() {
  const enigma = useEnigma();
  const [litLamp, setLitLamp] = useState<Letter | null>(null);
  const [batchInput, setBatchInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const lampTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up timers on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => {
      if (lampTimerRef.current) clearTimeout(lampTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

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

  const handleCopyOutput = useCallback(async () => {
    if (!enigma.state.outputHistory) return;
    try {
      await navigator.clipboard.writeText(formatMessage(enigma.state.outputHistory));
      setCopyFeedback(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyFeedback(false), 1500);
    } catch {
      // Clipboard API not available — ignore silently
    }
  }, [enigma.state.outputHistory]);

  const handleBatchEncrypt = useCallback(() => {
    const letters = batchInput.toUpperCase().replace(/[^A-Z]/g, '');
    if (!letters || enigma.hasRotorConflict) return;

    for (const ch of letters) {
      enigma.pressKey(ch);
    }
    setBatchInput('');
  }, [batchInput, enigma]);

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

      <section className="message-display" aria-live="polite">
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
            {enigma.state.outputHistory && (
              <button
                className="copy-btn"
                onClick={handleCopyOutput}
                aria-label="Copy output to clipboard"
                title="Copy output"
              >
                {copyFeedback ? '✓' : '⎘'}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="batch-input">
        <h3>Batch Encrypt</h3>
        <div className="batch-row">
          <input
            type="text"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBatchEncrypt(); }}
            placeholder="Paste or type a message…"
            aria-label="Batch input text"
            disabled={enigma.hasRotorConflict}
          />
          <button
            onClick={handleBatchEncrypt}
            disabled={enigma.hasRotorConflict || !batchInput.trim()}
          >
            Encrypt
          </button>
        </div>
      </section>

      <div className="controls">
        <button onClick={enigma.randomize}>Random Config</button>
        <button onClick={handleResetPositions}>Reset Positions</button>
        <button onClick={handleClearAll}>Clear All</button>
      </div>
    </div>
  );
}
