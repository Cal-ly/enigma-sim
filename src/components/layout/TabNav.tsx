import { useCallback } from 'react';

type Tab = 'simulator' | 'tutorial' | 'history';

type TabNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string }[] = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'tutorial', label: 'How It Works' },
  { id: 'history', label: 'History' },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex = -1;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex >= 0) {
        e.preventDefault();
        onTabChange(tabs[nextIndex].id);
      }
    },
    [activeTab, onTabChange],
  );

  return (
    <nav
      className="flex bg-surface border-b-2 border-border"
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`flex-1 sm:flex-initial px-3 sm:px-6 py-2 sm:py-2.5 bg-transparent border-none text-[0.8rem] sm:text-[0.9rem] cursor-pointer transition-colors duration-200 text-center
              ${isActive
                ? 'text-accent tab-active-bar'
                : 'text-muted hover:text-foreground'
              }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export type { Tab };
