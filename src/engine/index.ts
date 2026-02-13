/**
 * Barrel export for the Enigma engine.
 *
 * This is the public API that the React UI layer imports from.
 * No UI code should import directly from individual engine files.
 */

export { EnigmaMachine } from './enigma';
export { Rotor } from './rotor';
export { Reflector } from './reflector';
export { Plugboard } from './plugboard';
export {
  ALPHABET,
  ALPHABET_SIZE,
  ROTOR_WIRINGS,
  ROTOR_NOTCHES,
  REFLECTOR_WIRINGS,
  letterToIndex,
  indexToLetter,
  mod,
} from './constants';
