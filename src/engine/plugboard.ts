/**
 * Plugboard (Steckerbrett): performs symmetric letter-pair substitution
 * before and after the signal passes through the rotors.
 *
 * Each pair swaps two letters bidirectionally. With no pairs, the plugboard
 * is a passthrough. Up to 13 pairs can be configured (leaving no unpaired letter
 * if all 13 are used — but any count 0–13 is valid).
 */

import { ALPHABET_SIZE, letterToIndex } from './constants';
import type { Letter } from '../types';

export class Plugboard {
  /** Swap table: index i maps to swapTable[i]. Unpaired letters map to themselves. */
  private readonly swapTable: number[];

  constructor(pairs: [Letter, Letter][]) {
    Plugboard.validate(pairs);

    this.swapTable = Array.from({ length: ALPHABET_SIZE }, (_, i) => i);

    for (const [a, b] of pairs) {
      const ai = letterToIndex(a);
      const bi = letterToIndex(b);
      this.swapTable[ai] = bi;
      this.swapTable[bi] = ai;
    }
  }

  /** Swap a letter through the plugboard */
  swap(inputIndex: number): number {
    return this.swapTable[inputIndex];
  }

  /** Validate plugboard pair configuration */
  private static validate(pairs: [Letter, Letter][]): void {
    if (pairs.length > 13) {
      throw new Error(`Plugboard cannot have more than 13 pairs (got ${pairs.length})`);
    }

    const used = new Set<string>();
    for (const [a, b] of pairs) {
      if (a === b) {
        throw new Error(`Plugboard pair cannot map a letter to itself: ${a}`);
      }
      if (used.has(a)) {
        throw new Error(`Letter ${a} is used in multiple plugboard pairs`);
      }
      if (used.has(b)) {
        throw new Error(`Letter ${b} is used in multiple plugboard pairs`);
      }
      used.add(a);
      used.add(b);
    }
  }
}
