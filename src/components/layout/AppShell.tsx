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
        {activeTab === 'simulator' && <SimulatorView />}
        {activeTab === 'tutorial' && <TutorialView />}
        {activeTab === 'history' && <HistoryView />}
      </main>
    </div>
  );
}
