/**
 * Tests for URL state encoding/decoding.
 */
import { describe, it, expect } from 'vitest';
import { encodeConfig, decodeConfig } from '../../src/utils/urlState';
import type { MachineConfig } from '../../src/types';

const DEFAULT_CONFIG: MachineConfig = {
  rotors: [
    { name: 'I', ringSetting: 1, position: 'A' },
    { name: 'II', ringSetting: 1, position: 'A' },
    { name: 'III', ringSetting: 1, position: 'A' },
  ],
  reflector: 'UKW-B',
  plugboardPairs: [],
};

describe('URL State', () => {
  describe('encodeConfig', () => {
    it('encodes a basic 3-rotor config', () => {
      const hash = encodeConfig(DEFAULT_CONFIG);
      expect(hash).toBe('r=I-01-A.II-01-A.III-01-A&f=UKW-B');
    });

    it('encodes plugboard pairs', () => {
      const config: MachineConfig = {
        ...DEFAULT_CONFIG,
        plugboardPairs: [['A', 'B'], ['C', 'D']],
      };
      const hash = encodeConfig(config);
      expect(hash).toContain('p=AB.CD');
    });

    it('encodes M4 config with greek rotor', () => {
      const config: MachineConfig = {
        ...DEFAULT_CONFIG,
        reflector: 'UKW-B-thin',
        greekRotor: { name: 'Beta', ringSetting: 5, position: 'K' },
      };
      const hash = encodeConfig(config);
      expect(hash).toContain('g=Beta-05-K');
      expect(hash).toContain('f=UKW-B-thin');
    });

    it('pads ring settings to two digits', () => {
      const config: MachineConfig = {
        ...DEFAULT_CONFIG,
        rotors: [
          { name: 'V', ringSetting: 26, position: 'Z' },
          { name: 'IV', ringSetting: 3, position: 'M' },
          { name: 'I', ringSetting: 10, position: 'A' },
        ],
      };
      const hash = encodeConfig(config);
      expect(hash).toContain('V-26-Z');
      expect(hash).toContain('IV-03-M');
      expect(hash).toContain('I-10-A');
    });
  });

  describe('decodeConfig', () => {
    it('round-trips a basic config', () => {
      const hash = encodeConfig(DEFAULT_CONFIG);
      const decoded = decodeConfig(hash);
      expect(decoded).toEqual(DEFAULT_CONFIG);
    });

    it('round-trips an M4 config', () => {
      const config: MachineConfig = {
        rotors: [
          { name: 'IV', ringSetting: 12, position: 'G' },
          { name: 'II', ringSetting: 1, position: 'A' },
          { name: 'V', ringSetting: 26, position: 'Z' },
        ],
        reflector: 'UKW-C-thin',
        greekRotor: { name: 'Gamma', ringSetting: 8, position: 'N' },
        plugboardPairs: [['A', 'Z'], ['B', 'Y']],
      };
      const hash = encodeConfig(config);
      const decoded = decodeConfig(hash);
      expect(decoded).toEqual(config);
    });

    it('round-trips config with plugboard pairs', () => {
      const config: MachineConfig = {
        ...DEFAULT_CONFIG,
        plugboardPairs: [['E', 'Q'], ['R', 'T'], ['U', 'I']],
      };
      const hash = encodeConfig(config);
      expect(decodeConfig(hash)).toEqual(config);
    });

    it('strips leading # from hash', () => {
      const hash = '#' + encodeConfig(DEFAULT_CONFIG);
      const decoded = decodeConfig(hash);
      expect(decoded).toEqual(DEFAULT_CONFIG);
    });

    it('returns null for empty string', () => {
      expect(decodeConfig('')).toBeNull();
    });

    it('returns null for invalid rotor name', () => {
      expect(decodeConfig('r=X-01-A.II-01-A.III-01-A&f=UKW-B')).toBeNull();
    });

    it('returns null for invalid ring setting', () => {
      expect(decodeConfig('r=I-00-A.II-01-A.III-01-A&f=UKW-B')).toBeNull();
      expect(decodeConfig('r=I-27-A.II-01-A.III-01-A&f=UKW-B')).toBeNull();
    });

    it('returns null for invalid position letter', () => {
      expect(decodeConfig('r=I-01-1.II-01-A.III-01-A&f=UKW-B')).toBeNull();
    });

    it('returns null for invalid reflector', () => {
      expect(decodeConfig('r=I-01-A.II-01-A.III-01-A&f=UKW-X')).toBeNull();
    });

    it('returns null for thin reflector without greek rotor', () => {
      expect(decodeConfig('r=I-01-A.II-01-A.III-01-A&f=UKW-B-thin')).toBeNull();
    });

    it('returns null for standard reflector with greek rotor', () => {
      expect(decodeConfig('r=I-01-A.II-01-A.III-01-A&f=UKW-B&g=Beta-01-A')).toBeNull();
    });

    it('returns null for wrong number of rotors', () => {
      expect(decodeConfig('r=I-01-A.II-01-A&f=UKW-B')).toBeNull();
    });

    it('returns null for same-letter plugboard pair', () => {
      expect(decodeConfig('r=I-01-A.II-01-A.III-01-A&f=UKW-B&p=AA')).toBeNull();
    });

    it('returns null for missing rotors param', () => {
      expect(decodeConfig('f=UKW-B')).toBeNull();
    });

    it('returns null for missing reflector param', () => {
      expect(decodeConfig('r=I-01-A.II-01-A.III-01-A')).toBeNull();
    });
  });
});
