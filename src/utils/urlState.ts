/**
 * URL state encoding/decoding for shareable Enigma configurations.
 *
 * Encodes machine config into a compact URL hash fragment.
 * Format: #rotors=I-01-A.II-01-A.III-01-A&ref=UKW-B&plug=AB.CD
 * M4:     #rotors=I-01-A.II-01-A.III-01-A&ref=UKW-B-thin&greek=Beta-01-A&plug=AB.CD
 */

import type { MachineConfig, RotorConfig, RotorName, ReflectorName, GreekRotorName, Letter } from '../types';

const VALID_ROTORS = new Set<string>(['I', 'II', 'III', 'IV', 'V']);
const VALID_GREEK = new Set<string>(['Beta', 'Gamma']);
const VALID_REFLECTORS = new Set<string>(['UKW-B', 'UKW-C', 'UKW-B-thin', 'UKW-C-thin']);
const LETTER_RE = /^[A-Z]$/;

/** Encode a MachineConfig into a URL hash string (without leading #). */
export function encodeConfig(config: MachineConfig): string {
  const parts: string[] = [];

  // Rotors: I-01-A.II-01-A.III-01-A
  const rotorStr = config.rotors
    .map((r) => `${r.name}-${String(r.ringSetting).padStart(2, '0')}-${r.position}`)
    .join('.');
  parts.push(`r=${rotorStr}`);

  // Reflector
  parts.push(`f=${config.reflector}`);

  // Greek rotor (M4)
  if (config.greekRotor) {
    const g = config.greekRotor;
    parts.push(`g=${g.name}-${String(g.ringSetting).padStart(2, '0')}-${g.position}`);
  }

  // Plugboard pairs
  if (config.plugboardPairs.length > 0) {
    const plugStr = config.plugboardPairs.map(([a, b]) => `${a}${b}`).join('.');
    parts.push(`p=${plugStr}`);
  }

  return parts.join('&');
}

/** Decode a URL hash string into a MachineConfig, or null if invalid. */
export function decodeConfig(hash: string): MachineConfig | null {
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!clean) return null;

  const params = new URLSearchParams(clean);

  // Parse rotors
  const rotorStr = params.get('r');
  if (!rotorStr) return null;

  const rotorParts = rotorStr.split('.');
  if (rotorParts.length !== 3) return null;

  function parseRotor(part: string): RotorConfig | null {
    const [name, ringStr, position] = part.split('-');
    const ringSetting = Number(ringStr);
    if (!VALID_ROTORS.has(name)) return null;
    if (isNaN(ringSetting) || ringSetting < 1 || ringSetting > 26) return null;
    if (!position || !LETTER_RE.test(position)) return null;
    return { name: name as RotorName, ringSetting, position };
  }

  const r0 = parseRotor(rotorParts[0]);
  const r1 = parseRotor(rotorParts[1]);
  const r2 = parseRotor(rotorParts[2]);
  if (!r0 || !r1 || !r2) return null;
  const rotors: [RotorConfig, RotorConfig, RotorConfig] = [r0, r1, r2];

  // Parse reflector
  const reflector = params.get('f');
  if (!reflector || !VALID_REFLECTORS.has(reflector)) return null;

  // Parse greek rotor (optional)
  let greekRotor: MachineConfig['greekRotor'] = undefined;
  const greekStr = params.get('g');
  if (greekStr) {
    const [name, ringStr, position] = greekStr.split('-');
    const ringSetting = Number(ringStr);
    if (!VALID_GREEK.has(name)) return null;
    if (isNaN(ringSetting) || ringSetting < 1 || ringSetting > 26) return null;
    if (!position || !LETTER_RE.test(position)) return null;
    greekRotor = { name: name as GreekRotorName, ringSetting, position };
  }

  // Parse plugboard (optional)
  const plugStr = params.get('p');
  const plugboardPairs: [Letter, Letter][] = [];
  if (plugStr) {
    const pairs = plugStr.split('.');
    for (const pair of pairs) {
      if (pair.length !== 2 || !LETTER_RE.test(pair[0]) || !LETTER_RE.test(pair[1])) return null;
      if (pair[0] === pair[1]) return null;
      plugboardPairs.push([pair[0], pair[1]]);
    }
  }

  // Validate rotor uniqueness
  if (new Set(rotors.map((r) => r.name)).size !== 3) return null;

  // Validate M4 constraints
  const isThin = reflector === 'UKW-B-thin' || reflector === 'UKW-C-thin';
  if (isThin && !greekRotor) return null;
  if (!isThin && greekRotor) return null;

  return {
    rotors,
    reflector: reflector as ReflectorName,
    greekRotor,
    plugboardPairs,
  };
}

/** Read config from current URL hash. */
export function readConfigFromURL(): MachineConfig | null {
  if (typeof window === 'undefined') return null;
  return decodeConfig(window.location.hash);
}

/** Write config to URL hash (replaceState, no navigation). */
export function writeConfigToURL(config: MachineConfig): void {
  if (typeof window === 'undefined') return;
  const hash = '#' + encodeConfig(config);
  window.history.replaceState(null, '', hash);
}
