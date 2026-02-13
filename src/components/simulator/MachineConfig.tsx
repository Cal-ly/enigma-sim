import { ALPHABET } from '../../engine';
import type { MachineConfig, RotorName, ReflectorName } from '../../types';

const ROTOR_OPTIONS: RotorName[] = ['I', 'II', 'III', 'IV', 'V'];
const REFLECTOR_OPTIONS: ReflectorName[] = ['UKW-B', 'UKW-C'];
const SLOT_LABELS = ['Left', 'Middle', 'Right'] as const;

type MachineConfigProps = {
  config: MachineConfig;
  hasRotorConflict: boolean;
  onUpdateRotor: (
    slot: 0 | 1 | 2,
    field: 'name' | 'ringSetting' | 'position',
    value: RotorName | number | string,
  ) => void;
  onUpdateReflector: (reflector: ReflectorName) => void;
};

export function MachineConfig({
  config,
  hasRotorConflict,
  onUpdateRotor,
  onUpdateReflector,
}: MachineConfigProps) {
  return (
    <section className="machine-config">
      <h3>Machine Configuration</h3>

      <div className="config-row" style={{ marginBottom: '0.75rem' }}>
        <div className="config-group">
          <label htmlFor="reflector-select">Reflector</label>
          <select
            id="reflector-select"
            value={config.reflector}
            onChange={(e) => onUpdateReflector(e.target.value as ReflectorName)}
          >
            {REFLECTOR_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rotor-configs">
        {([0, 1, 2] as const).map((slot) => {
          const rotorCfg = config.rotors[slot];
          const usedByOthers = config.rotors
            .filter((_, i) => i !== slot)
            .map((r) => r.name);

          return (
            <div key={slot} className="rotor-config-slot">
              <h4>{SLOT_LABELS[slot]} Rotor</h4>
              <div className="config-row">
                <div className="config-group">
                  <label htmlFor={`rotor-${slot}-name`}>Rotor</label>
                  <select
                    id={`rotor-${slot}-name`}
                    value={rotorCfg.name}
                    onChange={(e) => onUpdateRotor(slot, 'name', e.target.value as RotorName)}
                  >
                    {ROTOR_OPTIONS.map((r) => (
                      <option
                        key={r}
                        value={r}
                        disabled={usedByOthers.includes(r)}
                      >
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor={`rotor-${slot}-ring`}>Ring</label>
                  <select
                    id={`rotor-${slot}-ring`}
                    value={rotorCfg.ringSetting}
                    onChange={(e) => onUpdateRotor(slot, 'ringSetting', Number(e.target.value))}
                  >
                    {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {String(n).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor={`rotor-${slot}-pos`}>Position</label>
                  <select
                    id={`rotor-${slot}-pos`}
                    value={rotorCfg.position}
                    onChange={(e) => onUpdateRotor(slot, 'position', e.target.value)}
                  >
                    {ALPHABET.split('').map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasRotorConflict && (
        <p className="config-error">Each rotor slot must use a different rotor.</p>
      )}
    </section>
  );
}
