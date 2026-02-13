import { useState } from 'react';
import { TabNav } from './TabNav';
import { SimulatorView } from '../simulator/SimulatorView';
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
        {activeTab === 'tutorial' && (
          <div className="placeholder">
            <h2>How It Works</h2>
            <p>Interactive signal path visualization — coming in Phase 3.</p>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="placeholder">
            <h2>History</h2>
            <p>The story of the Enigma machine — coming in Phase 4.</p>
          </div>
        )}
      </main>
    </div>
  );
}
