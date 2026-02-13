/**
 * Reflector (Umkehrwalze): a fixed wiring that maps each letter to exactly
 * one other letter, ensuring the signal returns back through the rotors.
 *
 * The reflector never steps. Its wiring guarantees that no letter maps to
 * itself — this is the fundamental reason an Enigma machine can never encrypt
 * a letter as itself (a critical cryptographic weakness exploited by codebreakers).
 */

import { REFLECTOR_WIRINGS, letterToIndex } from './constants';
import type { ReflectorName } from '../types';

export class Reflector {
  /** Wiring: index i maps to wiring[i] */
  private readonly wiring: number[];

  readonly name: ReflectorName;

  constructor(name: ReflectorName) {
    this.name = name;
    const wiringStr = REFLECTOR_WIRINGS[name];
    this.wiring = Array.from(wiringStr, (ch) => letterToIndex(ch));
  }

  /** Pass a signal through the reflector */
  reflect(inputIndex: number): number {
    return this.wiring[inputIndex];
  }
}
