/**
 * Rotor: models a single Enigma rotor with its wiring, position, ring setting,
 * and stepping behaviour.
 *
 * ## Offset calculation
 *
 * A rotor's wiring is fixed on the physical rotor core. Two adjustable offsets
 * modify which contacts align with the entry plate:
 *
 * - **Position** (Grundstellung): the letter visible in the window. Rotated by
 *   stepping. Shifts the effective input *forward* through the alphabet.
 * - **Ring setting** (Ringstellung): rotates the letter ring relative to the
 *   wiring core. Shifts the effective input *backward*.
 *
 * The net offset applied to an input index before looking up the wiring is
 * `position - ringSetting`. The same offset is removed from the output.
 */

import {
  ROTOR_WIRINGS,
  ROTOR_NOTCHES,
  ALPHABET_SIZE,
  letterToIndex,
  indexToLetter,
  mod,
} from './constants';
import type { AnyRotorName, RotorName } from '../types';

export class Rotor {
  /** Forward wiring: index i maps to wiringForward[i] */
  private readonly wiringForward: number[];
  /** Reverse wiring: inverse of wiringForward */
  private readonly wiringReverse: number[];
  /** The notch letter — when the rotor is at this position, it triggers turnover.
   *  -1 for greek (Beta/Gamma) rotors which never trigger turnover. */
  private readonly notch: number;

  /** Current rotor position (0–25, where 0 = A) */
  private _position: number;
  /** Ring setting offset (0–25) */
  private readonly _ringSetting: number;

  readonly name: AnyRotorName;

  constructor(name: AnyRotorName, ringSetting: number, initialPosition: string) {
    if (ringSetting < 1 || ringSetting > 26) {
      throw new Error(`Ring setting must be 1–26, got: ${ringSetting}`);
    }
    if (!/^[A-Z]$/.test(initialPosition)) {
      throw new Error(`Initial position must be a single letter A–Z, got: "${initialPosition}"`);
    }

    this.name = name;

    const wiringStr = ROTOR_WIRINGS[name];
    this.wiringForward = Array.from(wiringStr, (ch) => letterToIndex(ch));

    // Build the inverse mapping for the reverse pass
    this.wiringReverse = new Array<number>(ALPHABET_SIZE);
    for (let i = 0; i < ALPHABET_SIZE; i++) {
      this.wiringReverse[this.wiringForward[i]] = i;
    }

    this.notch = (name in ROTOR_NOTCHES)
      ? letterToIndex(ROTOR_NOTCHES[name as RotorName])
      : -1; // Greek rotors (Beta/Gamma) have no notch

    // Ring setting: externally 1–26, internally 0–25
    this._ringSetting = ringSetting - 1;
    this._position = letterToIndex(initialPosition);
  }

  /** Current position as 0–25 index */
  get position(): number {
    return this._position;
  }

  /** Current position as letter A–Z */
  get positionLetter(): string {
    return indexToLetter(this._position);
  }

  /** Ring setting as 0–25 index */
  get ringSetting(): number {
    return this._ringSetting;
  }

  /**
   * Pass a signal through the rotor in the forward direction
   * (right-to-left, entry plate → reflector side).
   *
   * The offset shifts the input into the rotor's frame of reference (accounting
   * for position and ring setting), looks up the wired output, then shifts back.
   */
  forward(inputIndex: number): number {
    const offset = this._position - this._ringSetting;
    const shiftedInput = mod(inputIndex + offset, ALPHABET_SIZE);
    const wiringOutput = this.wiringForward[shiftedInput];
    return mod(wiringOutput - offset, ALPHABET_SIZE);
  }

  /**
   * Pass a signal through the rotor in the reverse direction
   * (left-to-right, reflector side → entry plate).
   */
  reverse(inputIndex: number): number {
    const offset = this._position - this._ringSetting;
    const shiftedInput = mod(inputIndex + offset, ALPHABET_SIZE);
    const wiringOutput = this.wiringReverse[shiftedInput];
    return mod(wiringOutput - offset, ALPHABET_SIZE);
  }

  /** Advance the rotor by one position (wraps at Z → A) */
  step(): void {
    this._position = mod(this._position + 1, ALPHABET_SIZE);
  }

  /**
   * Check whether this rotor is currently at its notch position.
   * Used by the stepping mechanism to determine turnover.
   */
  atNotch(): boolean {
    return this._position === this.notch;
  }

  /** Reset position to a given letter */
  resetPosition(letter: string): void {
    this._position = letterToIndex(letter);
  }
}
