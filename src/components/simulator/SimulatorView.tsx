import { useState, useCallback, useRef, useEffect } from 'react';
import { useEnigma } from '../../hooks/useEnigma';
import { encodeConfig } from '../../utils/urlState';
import { MachineConfig } from './MachineConfig';
import { PlugboardConfig } from './PlugboardConfig';
import { RotorDisplay } from './RotorDisplay';
import { Lampboard } from './Lampboard';
import { Keyboard } from './Keyboard';
import { FrequencyAnalysis } from './FrequencyAnalysis';
import type { Letter } from '../../types';

const LAMP_DURATION_MS = 200;

function formatMessage(text: string): string {
  return text.replace(/(.{5})/g, '$1 ').trim();
}

const btnCls =
  'bg-surface-alt text-foreground border border-border rounded-default px-4 py-1.5 cursor-pointer text-[0.85rem] transition-all duration-150 hover:bg-accent hover:border-accent';

export function SimulatorView() {
  const enigma = useEnigma();
  const [litLamp, setLitLamp] = useState<Letter | null>(null);
  const [batchInput, setBatchInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const lampTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (lampTimerRef.current) clearTimeout(lampTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const handleKeyPress = useCallback(
    (letter: string) => {
      if (enigma.hasRotorConflict) return;
      const result = enigma.pressKey(letter);
      if (!result) return;
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
      // Clipboard API not available
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

  const handleShareLink = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${encodeConfig(enigma.config)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback(true);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      shareTimerRef.current = setTimeout(() => setShareFeedback(false), 1500);
    } catch {
      // Clipboard not available
    }
  }, [enigma.config]);

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <MachineConfig
        config={enigma.config}
        hasRotorConflict={enigma.hasRotorConflict}
        onUpdateRotor={enigma.updateRotor}
        onUpdateReflector={enigma.updateReflector}
        onToggleM4={enigma.toggleM4}
        onUpdateGreekRotor={enigma.updateGreekRotor}
      />

      <PlugboardConfig
        pairs={enigma.config.plugboardPairs}
        onAddPair={enigma.addPlugboardPair}
        onRemovePair={enigma.removePlugboardPair}
      />

      <RotorDisplay positions={enigma.state.rotorPositions} />
      <Lampboard litLamp={litLamp} />
      <Keyboard onKeyPress={handleKeyPress} disabled={enigma.hasRotorConflict} />

      {/* Messages */}
      <section className="bg-surface rounded-default p-3 sm:p-4 border border-border" aria-live="polite">
        <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-widest text-muted">
          Messages
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 items-baseline">
            <span className="text-xs uppercase text-muted min-w-[60px] shrink-0">Input</span>
            <span className="font-mono text-base tracking-widest break-all min-h-[1.4em]">
              {enigma.state.inputHistory ? formatMessage(enigma.state.inputHistory) : '\u00A0'}
            </span>
          </div>
          <div className="flex gap-3 items-baseline">
            <span className="text-xs uppercase text-muted min-w-[60px] shrink-0">Output</span>
            <span className="font-mono text-base tracking-widest break-all min-h-[1.4em]">
              {enigma.state.outputHistory ? formatMessage(enigma.state.outputHistory) : '\u00A0'}
            </span>
            {enigma.state.outputHistory && (
              <button
                className="bg-transparent border border-border rounded-default text-muted cursor-pointer text-base px-2 py-0.5 ml-2 shrink-0 transition-colors duration-150 hover:text-accent hover:border-accent"
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

      <FrequencyAnalysis text={enigma.state.outputHistory} />

      {/* Batch Encrypt */}
      <section className="py-2">
        <h3 className="text-[0.85rem] uppercase tracking-widest text-muted mb-1.5">
          Batch Encrypt
        </h3>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBatchEncrypt(); }}
            placeholder="Paste or type a message…"
            aria-label="Batch input text"
            disabled={enigma.hasRotorConflict}
            className="flex-1 bg-surface text-foreground border border-border rounded-default px-3 py-1.5 font-mono text-[0.9rem] placeholder:text-muted focus:outline-2 focus:outline-accent focus:outline-offset-1"
          />
          <button
            onClick={handleBatchEncrypt}
            disabled={enigma.hasRotorConflict || !batchInput.trim()}
            className={`${btnCls} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Encrypt
          </button>
        </div>
      </section>

      {/* Controls */}
      <div className="flex gap-2 justify-center flex-wrap py-1">
        <button className={btnCls} onClick={enigma.randomize}>Random Config</button>
        <button className={btnCls} onClick={handleShareLink}>
          {shareFeedback ? '✓ Copied!' : 'Share Link'}
        </button>
        <button className={btnCls} onClick={handleResetPositions}>Reset Positions</button>
        <button className={btnCls} onClick={handleClearAll}>Clear All</button>
      </div>
    </div>
  );
}
