import { ALPHABET } from '../../engine';
import type { MachineConfig, RotorName, ReflectorName, GreekRotorName } from '../../types';

const ROTOR_OPTIONS: RotorName[] = ['I', 'II', 'III', 'IV', 'V'];
const GREEK_ROTOR_OPTIONS: GreekRotorName[] = ['Beta', 'Gamma'];
const REFLECTOR_3: ReflectorName[] = ['UKW-B', 'UKW-C'];
const REFLECTOR_M4: ReflectorName[] = ['UKW-B-thin', 'UKW-C-thin'];
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
  onToggleM4: () => void;
  onUpdateGreekRotor?: (
    field: 'name' | 'ringSetting' | 'position',
    value: GreekRotorName | number | string,
  ) => void;
};

const selectCls =
  'bg-bg text-foreground border border-border rounded-default px-2 py-1.5 text-[0.9rem] font-mono min-w-[60px] focus:outline-none focus:border-accent';

export function MachineConfig({
  config,
  hasRotorConflict,
  onUpdateRotor,
  onUpdateReflector,
  onToggleM4,
  onUpdateGreekRotor,
}: MachineConfigProps) {
  const isM4 = !!config.greekRotor;
  const reflectorOptions = isM4 ? REFLECTOR_M4 : REFLECTOR_3;

  return (
    <section className="bg-surface rounded-default p-3 sm:p-4 border border-border">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="m-0 text-[0.85rem] uppercase tracking-widest text-muted">
          Machine Configuration
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-[0.8rem] text-muted">
          <input
            type="checkbox"
            checked={isM4}
            onChange={onToggleM4}
            className="accent-accent"
          />
          M4 Naval
        </label>
      </div>

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
            {reflectorOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rotor slots */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {/* Greek rotor (M4 only) */}
        {isM4 && config.greekRotor && onUpdateGreekRotor && (
          <div className="bg-bg rounded-default p-3 border border-accent/40">
            <h4 className="m-0 mb-2 text-[0.8rem] text-accent">Greek Rotor</h4>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="greek-rotor-name" className="text-xs text-muted uppercase tracking-wide">
                  Rotor
                </label>
                <select
                  id="greek-rotor-name"
                  value={config.greekRotor.name}
                  onChange={(e) => onUpdateGreekRotor('name', e.target.value as GreekRotorName)}
                  className={selectCls}
                >
                  {GREEK_ROTOR_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="greek-rotor-ring" className="text-xs text-muted uppercase tracking-wide">
                  Ring
                </label>
                <select
                  id="greek-rotor-ring"
                  value={config.greekRotor.ringSetting}
                  onChange={(e) => onUpdateGreekRotor('ringSetting', Number(e.target.value))}
                  className={selectCls}
                >
                  {Array.from({ length: 26 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="greek-rotor-pos" className="text-xs text-muted uppercase tracking-wide">
                  Position
                </label>
                <select
                  id="greek-rotor-pos"
                  value={config.greekRotor.position}
                  onChange={(e) => onUpdateGreekRotor('position', e.target.value)}
                  className={selectCls}
                >
                  {ALPHABET.split('').map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Standard 3 rotor slots */}
        {([0, 1, 2] as const).map((slot) => {
          const rotorCfg = config.rotors[slot];
          const usedByOthers = config.rotors
            .filter((_, i) => i !== slot)
            .map((r) => r.name);

          return (
            <div key={slot} className="bg-bg rounded-default p-3 border border-border">
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
                      <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
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
