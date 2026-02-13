import { useState } from 'react';
import type { ReactNode } from 'react';

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="bg-surface rounded-default border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full p-3 sm:p-4 bg-transparent border-none text-left cursor-pointer text-foreground hover:bg-surface-alt/30 transition-colors duration-150"
      >
        <h3 className="m-0 text-[0.85rem] uppercase tracking-widest text-muted">
          {title}
        </h3>
        <span
          className={`text-muted text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-border">
          {children}
        </div>
      )}
    </section>
  );
}
