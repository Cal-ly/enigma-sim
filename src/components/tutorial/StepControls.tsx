type StepControlsProps = {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
};

const btnCls =
  'bg-surface-alt text-foreground border border-border rounded-default px-4 py-1.5 cursor-pointer text-[0.85rem] transition-all duration-150 hover:not-disabled:bg-accent hover:not-disabled:border-accent disabled:opacity-40 disabled:cursor-not-allowed';

export function StepControls({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
}: StepControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button onClick={onPrev} disabled={currentStep === 0} aria-label="Previous step" className={btnCls}>
        ← Prev
      </button>
      <span className="font-mono text-[0.85rem] text-muted min-w-[100px] text-center">
        Step {currentStep + 1} of {totalSteps}
      </span>
      <button onClick={onNext} disabled={currentStep === totalSteps - 1} aria-label="Next step" className={btnCls}>
        Next →
      </button>
    </div>
  );
}
