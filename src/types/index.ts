/**
 * Shared TypeScript types for the Enigma simulator.
 *
 * These types define the public API surface of the engine and are used
 * by both the engine internals and the React UI layer.
 */

/** Historical rotor identifiers (Wehrmacht Enigma I) */
export type RotorName = 'I' | 'II' | 'III' | 'IV' | 'V';

/** M4 Naval Enigma greek-wheel identifiers */
export type GreekRotorName = 'Beta' | 'Gamma';

/** Any rotor that can be instantiated */
export type AnyRotorName = RotorName | GreekRotorName;

/** Historical reflector identifiers */
export type ReflectorName = 'UKW-B' | 'UKW-C' | 'UKW-B-thin' | 'UKW-C-thin';

/** A single letter A–Z */
export type Letter = string;

/** Rotor configuration for one slot */
export type RotorConfig = {
  name: RotorName;
  ringSetting: number;    // 1–26 (externally), converted to 0–25 internally
  position: Letter;       // Initial position A–Z
};

/** Greek-wheel configuration for M4 machines */
export type GreekRotorConfig = {
  name: GreekRotorName;
  ringSetting: number;
  position: Letter;
};

/** Full machine configuration */
export type MachineConfig = {
  rotors: [RotorConfig, RotorConfig, RotorConfig]; // [left, middle, right]
  greekRotor?: GreekRotorConfig;                    // M4 only (Beta or Gamma)
  reflector: ReflectorName;
  plugboardPairs: [Letter, Letter][];               // e.g. [['A','B'], ['C','D']]
};

/** One step in the signal path through the machine */
export type SignalStep = {
  component: 'plugboard' | 'rotor-r' | 'rotor-m' | 'rotor-l' | 'rotor-g' | 'reflector';
  direction: 'forward' | 'reverse';
  inputLetter: Letter;
  outputLetter: Letter;
};

/** Complete result of encrypting a single letter */
export type EncryptionResult = {
  inputLetter: Letter;
  outputLetter: Letter;
  steps: SignalStep[];
  rotorPositionsBefore: Letter[];   // 3 or 4 elements ([G,] L, M, R)
  rotorPositionsAfter: Letter[];
};

/** Snapshot of the machine's current state */
export type MachineState = {
  config: MachineConfig;
  rotorPositions: Letter[];         // 3 or 4 elements
};

/** Extended step info for tutorial display, including "keypress" and "output" bookend steps */
export type TutorialStep = {
  stepIndex: number;
  totalSteps: number;
  label: string;
  description: string;
  highlightComponent: SignalStep['component'] | 'input' | 'output';
  direction: 'forward' | 'reverse' | 'none';
  inputLetter: string;
  outputLetter: string;
};

/** A section within a history chapter */
export type HistorySection = {
  id: string;
  title: string;
  paragraphs: string[];
};

/** A top-level history chapter containing multiple sections */
export type HistoryChapter = {
  id: string;
  title: string;
  sections: HistorySection[];
};
