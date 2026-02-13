/**
 * EnigmaMachine: orchestrates the full encryption signal path through
 * plugboard, three rotors, reflector, and back.
 *
 * ## Signal path (for each keypress)
 *
 * 1. **Stepping** occurs BEFORE encryption (including double-step anomaly).
 * 2. Plugboard (forward swap)
 * 3. Right rotor (forward)
 * 4. Middle rotor (forward)
 * 5. Left rotor (forward)
 * 6. Reflector
 * 7. Left rotor (reverse)
 * 8. Middle rotor (reverse)
 * 9. Right rotor (reverse)
 * 10. Plugboard (reverse swap — same operation, since plugboard is symmetric)
 *
 * ## Double-step anomaly
 *
 * The historical stepping mechanism, executed before each keypress:
 * 1. If the middle rotor is at its notch → both middle AND left rotors step.
 * 2. Else if the right rotor is at its notch → middle rotor steps.
 * 3. The right rotor ALWAYS steps.
 *
 * The "anomaly": the middle rotor can step on two consecutive keypresses —
 * once because the right rotor triggered it (step 2), and again on the very
 * next keypress because it's now at its own notch (step 1).
 */

import { Rotor } from './rotor';
import { Reflector } from './reflector';
import { Plugboard } from './plugboard';
import { letterToIndex, indexToLetter } from './constants';
import type {
  MachineConfig,
  EncryptionResult,
  SignalStep,
  MachineState,
  Letter,
} from '../types';

export class EnigmaMachine {
  private readonly leftRotor: Rotor;
  private readonly middleRotor: Rotor;
  private readonly rightRotor: Rotor;
  private readonly greekRotor: Rotor | null;
  private readonly reflector: Reflector;
  private readonly plugboard: Plugboard;
  private readonly config: MachineConfig;
  private readonly initialPositions: Letter[];
  private readonly isM4: boolean;

  constructor(config: MachineConfig) {
    // Validate distinct standard rotors
    const rotorNames = config.rotors.map((r) => r.name);
    if (new Set(rotorNames).size !== 3) {
      throw new Error('All three rotor slots must have distinct rotors');
    }

    this.isM4 = !!config.greekRotor;

    // Validate M4 constraints
    const thinReflectors = ['UKW-B-thin', 'UKW-C-thin'];
    if (this.isM4 && !thinReflectors.includes(config.reflector)) {
      throw new Error('M4 mode requires a thin reflector (UKW-B-thin or UKW-C-thin)');
    }
    if (!this.isM4 && thinReflectors.includes(config.reflector)) {
      throw new Error('Thin reflectors require a greek rotor (Beta or Gamma)');
    }

    this.config = config;
    const [left, middle, right] = config.rotors;

    this.leftRotor = new Rotor(left.name, left.ringSetting, left.position);
    this.middleRotor = new Rotor(middle.name, middle.ringSetting, middle.position);
    this.rightRotor = new Rotor(right.name, right.ringSetting, right.position);

    if (config.greekRotor) {
      this.greekRotor = new Rotor(
        config.greekRotor.name,
        config.greekRotor.ringSetting,
        config.greekRotor.position,
      );
    } else {
      this.greekRotor = null;
    }

    this.reflector = new Reflector(config.reflector);
    this.plugboard = new Plugboard(config.plugboardPairs);

    this.initialPositions = config.greekRotor
      ? [config.greekRotor.position, left.position, middle.position, right.position]
      : [left.position, middle.position, right.position];
  }

  /**
   * Encrypt a single letter, returning the full result with signal trace.
   * Input must be a single uppercase A–Z character.
   */
  encryptLetter(letter: string): EncryptionResult {
    if (!/^[A-Z]$/.test(letter)) {
      throw new Error(`Input must be a single uppercase letter A-Z, got: "${letter}"`);
    }

    const positionsBefore: Letter[] = this.getPositions();

    // Step rotors BEFORE encryption (greek rotor never steps)
    this.stepRotors();

    const positionsAfter: Letter[] = this.getPositions();

    const steps: SignalStep[] = [];
    let signal = letterToIndex(letter);

    // Helper to record a step
    const record = (component: SignalStep['component'], direction: SignalStep['direction'], before: number, after: number) => {
      steps.push({ component, direction, inputLetter: indexToLetter(before), outputLetter: indexToLetter(after) });
    };

    // 1. Plugboard forward
    const s1 = this.plugboard.swap(signal); record('plugboard', 'forward', signal, s1); signal = s1;
    // 2. Right rotor forward
    const s2 = this.rightRotor.forward(signal); record('rotor-r', 'forward', signal, s2); signal = s2;
    // 3. Middle rotor forward
    const s3 = this.middleRotor.forward(signal); record('rotor-m', 'forward', signal, s3); signal = s3;
    // 4. Left rotor forward
    const s4 = this.leftRotor.forward(signal); record('rotor-l', 'forward', signal, s4); signal = s4;

    // 4b. Greek rotor forward (M4 only)
    if (this.greekRotor) {
      const sg = this.greekRotor.forward(signal); record('rotor-g', 'forward', signal, sg); signal = sg;
    }

    // 5. Reflector
    const s5 = this.reflector.reflect(signal); record('reflector', 'forward', signal, s5); signal = s5;

    // 5b. Greek rotor reverse (M4 only)
    if (this.greekRotor) {
      const sg = this.greekRotor.reverse(signal); record('rotor-g', 'reverse', signal, sg); signal = sg;
    }

    // 6. Left rotor reverse
    const s6 = this.leftRotor.reverse(signal); record('rotor-l', 'reverse', signal, s6); signal = s6;
    // 7. Middle rotor reverse
    const s7 = this.middleRotor.reverse(signal); record('rotor-m', 'reverse', signal, s7); signal = s7;
    // 8. Right rotor reverse
    const s8 = this.rightRotor.reverse(signal); record('rotor-r', 'reverse', signal, s8); signal = s8;
    // 9. Plugboard reverse
    const s9 = this.plugboard.swap(signal); record('plugboard', 'reverse', signal, s9); signal = s9;

    return {
      inputLetter: letter,
      outputLetter: indexToLetter(signal),
      steps,
      rotorPositionsBefore: positionsBefore,
      rotorPositionsAfter: positionsAfter,
    };
  }

  /**
   * Encrypt a string of uppercase letters.
   * Convenience method — calls encryptLetter for each character.
   */
  encryptMessage(message: string): string {
    return Array.from(message, (ch) => this.encryptLetter(ch).outputLetter).join('');
  }

  /** Get current rotor positions. For M4: [G, L, M, R]. For 3-rotor: [L, M, R]. */
  private getPositions(): Letter[] {
    const positions: Letter[] = [];
    if (this.greekRotor) positions.push(this.greekRotor.positionLetter);
    positions.push(
      this.leftRotor.positionLetter,
      this.middleRotor.positionLetter,
      this.rightRotor.positionLetter,
    );
    return positions;
  }

  /** Get current machine state snapshot */
  getState(): MachineState {
    return {
      config: this.config,
      rotorPositions: this.getPositions(),
    };
  }

  /** Reset rotor positions to their initial values (keeps configuration) */
  reset(): void {
    if (this.isM4 && this.greekRotor) {
      this.greekRotor.resetPosition(this.initialPositions[0]);
      this.leftRotor.resetPosition(this.initialPositions[1]);
      this.middleRotor.resetPosition(this.initialPositions[2]);
      this.rightRotor.resetPosition(this.initialPositions[3]);
    } else {
      this.leftRotor.resetPosition(this.initialPositions[0]);
      this.middleRotor.resetPosition(this.initialPositions[1]);
      this.rightRotor.resetPosition(this.initialPositions[2]);
    }
  }

  /**
   * Rotor stepping mechanism with double-step anomaly.
   * Only the three standard rotors participate — the greek rotor NEVER steps.
   */
  private stepRotors(): void {
    const middleAtNotch = this.middleRotor.atNotch();
    const rightAtNotch = this.rightRotor.atNotch();

    if (middleAtNotch) {
      this.middleRotor.step();
      this.leftRotor.step();
    } else if (rightAtNotch) {
      this.middleRotor.step();
    }

    this.rightRotor.step();
  }
}
