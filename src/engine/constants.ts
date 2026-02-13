/**
 * Historical wiring tables for the Wehrmacht Enigma I machine.
 *
 * Wiring strings represent the substitution mapping: position 0 (A) maps to
 * the character at index 0, position 1 (B) maps to the character at index 1, etc.
 *
 * Sources: Crypto Museum (https://www.cryptomuseum.com/crypto/enigma/wiring.htm)
 */

import type { RotorName, ReflectorName, AnyRotorName } from '../types';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const ALPHABET_SIZE = 26;

/** Convert letter to index (A=0, B=1, ... Z=25) */
export function letterToIndex(letter: string): number {
  return letter.charCodeAt(0) - 65; // 'A' = 65
}

/** Convert index to letter (0=A, 1=B, ... 25=Z) */
export function indexToLetter(index: number): string {
  return String.fromCharCode(((index % 26) + 26) % 26 + 65);
}

/** Modular arithmetic that always returns a non-negative result */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Rotor wiring definitions: maps input index → output character */
export const ROTOR_WIRINGS: Record<AnyRotorName, string> = {
  'I':     'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  'II':    'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  'III':   'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  'IV':    'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  'V':     'VZBRGITYUPSDNHLXAWMJQOFECK',
  'Beta':  'LEYJVCNIXWPBQMDRTAKZGFUHOS',
  'Gamma': 'FSOKANUERHMBTIYCWLQPZXVGJD',
};

/**
 * Rotor notch positions.
 *
 * When the rotor is AT this position and the next key is pressed,
 * the rotor to its left will step. For rotor I with notch 'Q',
 * when rotor I is at Q and a key is pressed, the next rotor steps
 * (the Q→R transition triggers the turnover).
 */
export const ROTOR_NOTCHES: Record<RotorName, string> = {
  'I':   'Q',
  'II':  'E',
  'III': 'V',
  'IV':  'J',
  'V':   'Z',
};

/** Reflector wiring definitions (standard + M4 thin) */
export const REFLECTOR_WIRINGS: Record<ReflectorName, string> = {
  'UKW-B':      'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  'UKW-C':      'FVPJIAOYEDRZXWGCTKUQSBNMHL',
  'UKW-B-thin': 'ENKQAUYWJICOPBLMDXZVFTHRGS',
  'UKW-C-thin': 'RDOBJNTKVEHMLFCWZAXGYIPSUQ',
};
