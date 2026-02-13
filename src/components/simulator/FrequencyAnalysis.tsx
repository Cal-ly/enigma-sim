import { ALPHABET } from '../../engine';

type FrequencyAnalysisProps = {
  text: string;
};

/** Compute letter counts from a string of uppercase letters. */
function getFrequencies(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of ALPHABET) freq.set(ch, 0);
  for (const ch of text) {
    if (freq.has(ch)) freq.set(ch, freq.get(ch)! + 1);
  }
  return freq;
}

export function FrequencyAnalysis({ text }: FrequencyAnalysisProps) {
  if (!text) return null;

  const freq = getFrequencies(text);
  const maxCount = Math.max(...freq.values(), 1);

  return (
    <section className="bg-surface rounded-default p-3 sm:p-4 border border-border">
      <h3 className="m-0 mb-3 text-[0.85rem] uppercase tracking-widest text-muted">
        Frequency Analysis ({text.length} letters)
      </h3>
      <div className="flex items-end gap-px sm:gap-0.5 h-24 sm:h-32">
        {ALPHABET.split('').map((ch) => {
          const count = freq.get(ch) ?? 0;
          const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div
              key={ch}
              className="flex flex-col items-center flex-1 min-w-0"
              title={`${ch}: ${count}`}
            >
              <div className="w-full flex flex-col justify-end h-20 sm:h-28">
                <div
                  className="w-full bg-accent/70 rounded-t-sm transition-all duration-200 min-h-px"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[0.5rem] sm:text-[0.6rem] text-muted font-mono mt-0.5 leading-none">
                {ch}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
