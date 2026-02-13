/**
 * Shared TypeScript types for the Enigma simulator.
 *
 * These types define the public API surface of the engine and are used
 * by both the engine internals and the React UI layer.
 */

/** Historical rotor identifiers (Wehrmacht Enigma I) */
export type RotorName = 'I' | 'II' | 'III' | 'IV' | 'V';

/** Historical reflector identifiers */
export type ReflectorName = 'UKW-B' | 'UKW-C';

/** A single letter A–Z */
export type Letter = string;

/** Rotor configuration for one slot */
export type RotorConfig = {
  name: RotorName;
  ringSetting: number;    // 1–26 (externally), converted to 0–25 internally
  position: Letter;       // Initial position A–Z
};

/** Full machine configuration */
export type MachineConfig = {
  rotors: [RotorConfig, RotorConfig, RotorConfig]; // [left, middle, right]
  reflector: ReflectorName;
  plugboardPairs: [Letter, Letter][];               // e.g. [['A','B'], ['C','D']]
};

/** One step in the signal path through the machine */
export type SignalStep = {
  component: 'plugboard' | 'rotor-r' | 'rotor-m' | 'rotor-l' | 'reflector';
  direction: 'forward' | 'reverse';
  inputLetter: Letter;
  outputLetter: Letter;
};

/** Complete result of encrypting a single letter */
export type EncryptionResult = {
  inputLetter: Letter;
  outputLetter: Letter;
  steps: SignalStep[];
  rotorPositionsBefore: [Letter, Letter, Letter];
  rotorPositionsAfter: [Letter, Letter, Letter];
};

/** Snapshot of the machine's current state */
export type MachineState = {
  config: MachineConfig;
  rotorPositions: [Letter, Letter, Letter];
};
