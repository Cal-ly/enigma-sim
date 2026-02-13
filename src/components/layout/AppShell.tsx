import { useState, useEffect } from 'react';
import { TabNav } from './TabNav';
import { ErrorBoundary } from './ErrorBoundary';
import { SimulatorView } from '../simulator/SimulatorView';
import { TutorialView } from '../tutorial/TutorialView';
import { HistoryView } from '../history/HistoryView';
import type { Tab } from './TabNav';

const TAB_TITLES: Record<Tab, string> = {
  simulator: 'Simulator',
  tutorial: 'How It Works',
  history: 'History',
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('simulator');

  useEffect(() => {
    document.title = `${TAB_TITLES[activeTab]} — Enigma Machine Simulator`;
  }, [activeTab]);

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-surface border-b border-border">
        <h1 className="m-0 text-base sm:text-xl font-semibold tracking-wide">
          <span className="text-accent">Enigma</span> Machine Simulator
        </h1>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="main-content" className="flex-1 p-3 sm:p-4 md:p-6 max-w-[960px] mx-auto w-full">
        {activeTab === 'simulator' && (
          <div role="tabpanel" id="tabpanel-simulator" aria-labelledby="tab-simulator">
            <ErrorBoundary fallbackMessage="The simulator encountered an error. Try resetting the configuration.">
              <SimulatorView />
            </ErrorBoundary>
          </div>
        )}
        {activeTab === 'tutorial' && (
          <div role="tabpanel" id="tabpanel-tutorial" aria-labelledby="tab-tutorial">
            <ErrorBoundary fallbackMessage="The tutorial encountered an error.">
              <TutorialView />
            </ErrorBoundary>
          </div>
        )}
        {activeTab === 'history' && (
          <div role="tabpanel" id="tabpanel-history" aria-labelledby="tab-history">
            <ErrorBoundary>
              <HistoryView />
            </ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
}
