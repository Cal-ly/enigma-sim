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

  // Update document title when active tab changes
  useEffect(() => {
    document.title = `${TAB_TITLES[activeTab]} — Enigma Machine Simulator`;
  }, [activeTab]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <h1>
          <span>Enigma</span> Machine Simulator
        </h1>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="main-content" className="app-content">
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
