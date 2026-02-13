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

const selectCls =
  'bg-bg text-foreground border border-border rounded-default px-2 py-1.5 text-[0.9rem] font-mono min-w-[60px] focus:outline-none focus:border-accent';

export function MachineConfig({
  config,
  hasRotorConflict,
  onUpdateRotor,
  onUpdateReflector,
}: MachineConfigProps) {
  return (
    <section className="bg-surface rounded-default p-4 border border-border">
      <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-widest text-muted">
        Machine Configuration
      </h3>

      {/* Reflector row */}
      <div className="flex gap-4 items-end flex-wrap mb-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="reflector-select" className="text-xs text-muted uppercase tracking-wide">
            Reflector
          </label>
          <select
            id="reflector-select"
            value={config.reflector}
            onChange={(e) => onUpdateReflector(e.target.value as ReflectorName)}
            className={selectCls}
          >
            {REFLECTOR_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rotor slots */}
      <div className="flex gap-5 flex-wrap">
        {([0, 1, 2] as const).map((slot) => {
          const rotorCfg = config.rotors[slot];
          const usedByOthers = config.rotors
            .filter((_, i) => i !== slot)
            .map((r) => r.name);

          return (
            <div key={slot} className="bg-bg rounded-default p-3 border border-border min-w-[140px]">
              <h4 className="m-0 mb-2 text-[0.8rem] text-accent">{SLOT_LABELS[slot]} Rotor</h4>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`rotor-${slot}-name`} className="text-xs text-muted uppercase tracking-wide">
                    Rotor
                  </label>
                  <select
                    id={`rotor-${slot}-name`}
                    value={rotorCfg.name}
                    onChange={(e) => onUpdateRotor(slot, 'name', e.target.value as RotorName)}
                    className={selectCls}
                  >
                    {ROTOR_OPTIONS.map((r) => (
                      <option key={r} value={r} disabled={usedByOthers.includes(r)}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={`rotor-${slot}-ring`} className="text-xs text-muted uppercase tracking-wide">
                    Ring
                  </label>
                  <select
                    id={`rotor-${slot}-ring`}
                    value={rotorCfg.ringSetting}
                    onChange={(e) => onUpdateRotor(slot, 'ringSetting', Number(e.target.value))}
                    className={selectCls}
                  >
                    {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {String(n).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={`rotor-${slot}-pos`} className="text-xs text-muted uppercase tracking-wide">
                    Position
                  </label>
                  <select
                    id={`rotor-${slot}-pos`}
                    value={rotorCfg.position}
                    onChange={(e) => onUpdateRotor(slot, 'position', e.target.value)}
                    className={selectCls}
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
        <p className="text-accent text-[0.8rem] mt-2">
          Each rotor slot must use a different rotor.
        </p>
      )}
    </section>
  );
}
