import { useState, useCallback, useMemo } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { EnigmaMachine } from '../../engine/enigma';
import type { MachineConfig, RotorName, ReflectorName, Letter } from '../../types';

/* ─── sample messages ─────────────────────────────────────────────── */

const SAMPLE_MESSAGES = [
  'ANGRIFFDERBRITISCHENPANZERBEGINNTUMZWOELFUHR',
  'GEHEIMEKOMMANDOSACHESOFORTOEFFNEN',
  'WETTERBERICHT FUER NORDATLANTIK',
  'ANFORDERUNGSOFORTIGERUNTERSTUETZUNG',
  'KOORDINATENNEUNUNDZWANZIGGRADUNDVIER',
  'TREFFPUNKTSIEBENUHRAMHAUPTQUARTIER',
  'NACHSCHUBISTAMMORGENEINGETROFFEN',
  'POSITIONFEINDLICHEFLOTTEDREIGRUPPEN',
  'AUFKLAERUNGSERGEBNISFOLGTINZWEISTUNDEN',
  'MELDUNGANDIEFLOTTENBASISWILHELMSHAVEN',
];

/* ─── helpers ─────────────────────────────────────────────────────── */

const ROTORS: RotorName[] = ['I', 'II', 'III', 'IV', 'V'];
const REFLECTORS: ReflectorName[] = ['UKW-B', 'UKW-C'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLetter(): Letter {
  return ALPHABET[Math.floor(Math.random() * 26)];
}

function pickDistinct<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function randomRingSetting(): number {
  return Math.floor(Math.random() * 26) + 1;
}

function generatePlugboardPairs(count: number): [Letter, Letter][] {
  const available = [...ALPHABET];
  const pairs: [Letter, Letter][] = [];
  for (let i = 0; i < count; i++) {
    const a = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const b = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    pairs.push([a, b]);
  }
  return pairs;
}

function formatGroups(text: string): string {
  return text.replace(/(.{5})/g, '$1 ').trim();
}

type Order = {
  config: MachineConfig;
  groundSetting: [Letter, Letter, Letter];
  messageKey: [Letter, Letter, Letter];
  plaintext: string;
  indicator: string;  // encrypted message key
  ciphertext: string; // encrypted plaintext body
  direction: 'encrypt' | 'decrypt';
};

function generateOrder(): Order {
  const [r1, r2, r3] = pickDistinct(ROTORS, 3);
  const reflector = pick(REFLECTORS);
  const pairs = generatePlugboardPairs(Math.floor(Math.random() * 4) + 6); // 6-9 pairs
  const groundSetting: [Letter, Letter, Letter] = [randomLetter(), randomLetter(), randomLetter()];
  const messageKey: [Letter, Letter, Letter] = [randomLetter(), randomLetter(), randomLetter()];

  const config: MachineConfig = {
    rotors: [
      { name: r1, ringSetting: randomRingSetting(), position: groundSetting[0] },
      { name: r2, ringSetting: randomRingSetting(), position: groundSetting[1] },
      { name: r3, ringSetting: randomRingSetting(), position: groundSetting[2] },
    ],
    reflector,
    plugboardPairs: pairs,
  };

  // Encrypt the message key using ground setting
  const indicatorMachine = new EnigmaMachine(config);
  const indicator = messageKey.map((l) => indicatorMachine.encryptLetter(l).outputLetter).join('');

  // Encrypt plaintext using message key
  const msgConfig: MachineConfig = {
    ...config,
    rotors: [
      { ...config.rotors[0], position: messageKey[0] },
      { ...config.rotors[1], position: messageKey[1] },
      { ...config.rotors[2], position: messageKey[2] },
    ],
  };
  const bodyMachine = new EnigmaMachine(msgConfig);
  const raw = pick(SAMPLE_MESSAGES).replace(/[^A-Z]/g, '');
  const ciphertext = [...raw].map((l) => bodyMachine.encryptLetter(l).outputLetter).join('');

  const direction = Math.random() < 0.5 ? 'encrypt' : 'decrypt';

  return { config, groundSetting, messageKey, plaintext: raw, indicator, ciphertext, direction };
}

/* ─── step definitions ─────────────────────────────────────────────── */

const ENCRYPT_STEPS = [
  'Read the daily key sheet and set rotors, rings, reflector, and plugboard on the simulator.',
  'Set the rotor start positions to the ground setting shown above.',
  'Type the three-letter message key on the keyboard to generate the indicator group.',
  'Now set the rotor start positions to the message key.',
  'Type the plaintext message. The output is your ciphertext.',
  'Your transmitted message: indicator group + ciphertext in five-letter blocks.',
];

const DECRYPT_STEPS = [
  'Read the daily key sheet and set rotors, rings, reflector, and plugboard on the simulator.',
  'Set the rotor start positions to the ground setting shown above.',
  'Type the three-letter indicator group to recover the original message key.',
  'Now set the rotor start positions to the recovered message key.',
  'Type the ciphertext body. The output is the original plaintext.',
  'You have decrypted the message!',
];

/* ─── component ───────────────────────────────────────────────────── */

export function TodaysOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handleGenerate = useCallback(() => {
    setOrder(generateOrder());
    setCurrentStep(0);
    setRevealed(false);
  }, []);

  const steps = useMemo(
    () => (order?.direction === 'encrypt' ? ENCRYPT_STEPS : DECRYPT_STEPS),
    [order?.direction],
  );

  return (
    <CollapsibleSection title="Today's Order">
      <div className="space-y-4 text-[0.85rem] leading-relaxed text-foreground/90">
        {!order ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3">
              Generate a daily key sheet with a message to encrypt or decrypt.
              Follow the step-by-step guide using the simulator above.
            </p>
            <button
              onClick={handleGenerate}
              className="bg-accent text-white border-none rounded-default px-5 py-2 cursor-pointer text-[0.85rem] hover:brightness-110 transition-all duration-150"
            >
              Generate Today's Order
            </button>
          </div>
        ) : (
          <>
            {/* Daily Key Sheet */}
            <div className="bg-bg rounded-default border border-border p-3 font-mono text-[0.8rem] space-y-1.5">
              <div className="text-accent font-bold uppercase tracking-wider text-[0.7rem] mb-2">
                ── Daily Key Sheet ──
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <span className="text-muted">Rotors:</span>
                <span>{order.config.rotors.map((r) => r.name).join(' — ')}</span>
                <span className="text-muted">Rings:</span>
                <span>{order.config.rotors.map((r) => String(r.ringSetting).padStart(2, '0')).join(' — ')}</span>
                <span className="text-muted">Reflector:</span>
                <span>{order.config.reflector}</span>
                <span className="text-muted">Plugboard:</span>
                <span className="break-all">
                  {order.config.plugboardPairs.map(([a, b]) => `${a}${b}`).join(' ')}
                </span>
                <span className="text-muted">Ground:</span>
                <span>{order.groundSetting.join(' ')}</span>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-bg rounded-default border border-accent/40 p-3 space-y-2">
              <div className="text-accent font-bold uppercase tracking-wider text-[0.7rem]">
                ── Mission: {order.direction === 'encrypt' ? 'Encrypt' : 'Decrypt'} ──
              </div>
              {order.direction === 'encrypt' ? (
                <>
                  <div>
                    <span className="text-muted text-xs uppercase">Message Key: </span>
                    <span className="font-mono tracking-widest">{order.messageKey.join('')}</span>
                  </div>
                  <div>
                    <span className="text-muted text-xs uppercase">Plaintext: </span>
                    <span className="font-mono tracking-widest break-all">{formatGroups(order.plaintext)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-muted text-xs uppercase">Indicator: </span>
                    <span className="font-mono tracking-widest">{order.indicator}</span>
                  </div>
                  <div>
                    <span className="text-muted text-xs uppercase">Ciphertext: </span>
                    <span className="font-mono tracking-widest break-all">{formatGroups(order.ciphertext)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Step-by-step guide */}
            <div className="space-y-2">
              <div className="text-muted text-xs uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="bg-bg rounded-default border border-border p-3">
                <p className="m-0">
                  <span className="text-accent font-bold mr-1.5">{currentStep + 1}.</span>
                  {steps[currentStep]}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  className="bg-surface-alt text-foreground border border-border rounded-default px-3 py-1 cursor-pointer text-[0.8rem] hover:bg-accent hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="bg-surface-alt text-foreground border border-border rounded-default px-3 py-1 cursor-pointer text-[0.8rem] hover:bg-accent hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Next →
                </button>
                <button
                  onClick={() => setRevealed((r) => !r)}
                  className="bg-surface-alt text-foreground border border-border rounded-default px-3 py-1 cursor-pointer text-[0.8rem] hover:bg-accent hover:border-accent transition-all duration-150 ml-auto"
                >
                  {revealed ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>
            </div>

            {/* Answer reveal */}
            {revealed && (
              <div className="bg-bg rounded-default border border-accent/40 p-3 space-y-1 font-mono text-[0.8rem]">
                <div className="text-accent font-bold uppercase tracking-wider text-[0.7rem] mb-1">
                  ── Answer ──
                </div>
                <div>
                  <span className="text-muted">Indicator: </span>
                  <span className="tracking-widest">{order.indicator}</span>
                  <span className="text-muted"> → Message Key: </span>
                  <span className="tracking-widest">{order.messageKey.join('')}</span>
                </div>
                <div>
                  <span className="text-muted">Plaintext: </span>
                  <span className="tracking-widest break-all">{formatGroups(order.plaintext)}</span>
                </div>
                <div>
                  <span className="text-muted">Ciphertext: </span>
                  <span className="tracking-widest break-all">{formatGroups(order.ciphertext)}</span>
                </div>
              </div>
            )}

            {/* New order */}
            <div className="text-center pt-1">
              <button
                onClick={handleGenerate}
                className="bg-transparent text-accent border border-accent rounded-default px-4 py-1.5 cursor-pointer text-[0.8rem] hover:bg-accent hover:text-white transition-all duration-150"
              >
                New Order
              </button>
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
