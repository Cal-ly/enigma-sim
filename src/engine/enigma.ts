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
  private readonly reflector: Reflector;
  private readonly plugboard: Plugboard;
  private readonly config: MachineConfig;
  private readonly initialPositions: [Letter, Letter, Letter];

  constructor(config: MachineConfig) {
    // Validate distinct rotors
    const rotorNames = config.rotors.map((r) => r.name);
    if (new Set(rotorNames).size !== 3) {
      throw new Error('All three rotor slots must have distinct rotors');
    }

    this.config = config;
    const [left, middle, right] = config.rotors;

    this.leftRotor = new Rotor(left.name, left.ringSetting, left.position);
    this.middleRotor = new Rotor(middle.name, middle.ringSetting, middle.position);
    this.rightRotor = new Rotor(right.name, right.ringSetting, right.position);
    this.reflector = new Reflector(config.reflector);
    this.plugboard = new Plugboard(config.plugboardPairs);

    this.initialPositions = [left.position, middle.position, right.position];
  }

  /**
   * Encrypt a single letter, returning the full result with signal trace.
   * Input must be a single uppercase A–Z character.
   */
  encryptLetter(letter: string): EncryptionResult {
    if (!/^[A-Z]$/.test(letter)) {
      throw new Error(`Input must be a single uppercase letter A-Z, got: "${letter}"`);
    }

    const positionsBefore: [Letter, Letter, Letter] = [
      this.leftRotor.positionLetter,
      this.middleRotor.positionLetter,
      this.rightRotor.positionLetter,
    ];

    // Step rotors BEFORE encryption
    this.stepRotors();

    const positionsAfter: [Letter, Letter, Letter] = [
      this.leftRotor.positionLetter,
      this.middleRotor.positionLetter,
      this.rightRotor.positionLetter,
    ];

    const steps: SignalStep[] = [];
    let signal = letterToIndex(letter);

    // 1. Plugboard forward
    const afterPlugFwd = this.plugboard.swap(signal);
    steps.push({
      component: 'plugboard',
      direction: 'forward',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterPlugFwd),
    });
    signal = afterPlugFwd;

    // 2. Right rotor forward
    const afterRightFwd = this.rightRotor.forward(signal);
    steps.push({
      component: 'rotor-r',
      direction: 'forward',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterRightFwd),
    });
    signal = afterRightFwd;

    // 3. Middle rotor forward
    const afterMiddleFwd = this.middleRotor.forward(signal);
    steps.push({
      component: 'rotor-m',
      direction: 'forward',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterMiddleFwd),
    });
    signal = afterMiddleFwd;

    // 4. Left rotor forward
    const afterLeftFwd = this.leftRotor.forward(signal);
    steps.push({
      component: 'rotor-l',
      direction: 'forward',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterLeftFwd),
    });
    signal = afterLeftFwd;

    // 5. Reflector
    const afterReflector = this.reflector.reflect(signal);
    steps.push({
      component: 'reflector',
      direction: 'forward',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterReflector),
    });
    signal = afterReflector;

    // 6. Left rotor reverse
    const afterLeftRev = this.leftRotor.reverse(signal);
    steps.push({
      component: 'rotor-l',
      direction: 'reverse',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterLeftRev),
    });
    signal = afterLeftRev;

    // 7. Middle rotor reverse
    const afterMiddleRev = this.middleRotor.reverse(signal);
    steps.push({
      component: 'rotor-m',
      direction: 'reverse',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterMiddleRev),
    });
    signal = afterMiddleRev;

    // 8. Right rotor reverse
    const afterRightRev = this.rightRotor.reverse(signal);
    steps.push({
      component: 'rotor-r',
      direction: 'reverse',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterRightRev),
    });
    signal = afterRightRev;

    // 9. Plugboard reverse (same swap operation — symmetric)
    const afterPlugRev = this.plugboard.swap(signal);
    steps.push({
      component: 'plugboard',
      direction: 'reverse',
      inputLetter: indexToLetter(signal),
      outputLetter: indexToLetter(afterPlugRev),
    });
    signal = afterPlugRev;

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

  /** Get current machine state snapshot */
  getState(): MachineState {
    return {
      config: this.config,
      rotorPositions: [
        this.leftRotor.positionLetter,
        this.middleRotor.positionLetter,
        this.rightRotor.positionLetter,
      ],
    };
  }

  /** Reset rotor positions to their initial values (keeps configuration) */
  reset(): void {
    this.leftRotor.resetPosition(this.initialPositions[0]);
    this.middleRotor.resetPosition(this.initialPositions[1]);
    this.rightRotor.resetPosition(this.initialPositions[2]);
  }

  /**
   * Rotor stepping mechanism with double-step anomaly.
   *
   * Order matters: check notch conditions first, then step.
   * The middle rotor's notch check must happen before any stepping occurs
   * in this cycle — otherwise we'd miss the double-step case.
   */
  private stepRotors(): void {
    const middleAtNotch = this.middleRotor.atNotch();
    const rightAtNotch = this.rightRotor.atNotch();

    // Double-step: middle rotor at its notch triggers both middle + left
    if (middleAtNotch) {
      this.middleRotor.step();
      this.leftRotor.step();
    }
    // Normal turnover: right rotor at notch triggers middle
    else if (rightAtNotch) {
      this.middleRotor.step();
    }

    // Right rotor ALWAYS steps
    this.rightRotor.step();
  }
}
