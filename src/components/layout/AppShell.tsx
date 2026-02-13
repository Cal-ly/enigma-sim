import { useState } from 'react';
import { TabNav } from './TabNav';
import { SimulatorView } from '../simulator/SimulatorView';
import { TutorialView } from '../tutorial/TutorialView';
import { HistoryView } from '../history/HistoryView';
import type { Tab } from './TabNav';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('simulator');

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>
          <span>Enigma</span> Machine Simulator
        </h1>
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-content">
        {activeTab === 'simulator' && (
          <div role="tabpanel" id="tabpanel-simulator" aria-labelledby="tab-simulator">
            <SimulatorView />
          </div>
        )}
        {activeTab === 'tutorial' && (
          <div role="tabpanel" id="tabpanel-tutorial" aria-labelledby="tab-tutorial">
            <TutorialView />
          </div>
        )}
        {activeTab === 'history' && (
          <div role="tabpanel" id="tabpanel-history" aria-labelledby="tab-history">
            <HistoryView />
          </div>
        )}
      </main>
    </div>
  );
}
