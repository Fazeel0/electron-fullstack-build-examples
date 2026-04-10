import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

function App() {
  const [showSettings, setShowSettings] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-white">
        {/* Header */}
        <header className="px-8 pt-7 pb-5 flex justify-between items-center border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-black text-sm">D</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DevPulse</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1 ml-11">{greeting} · <span className="text-slate-400">{dateStr}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => queryClient.invalidateQueries()}
              title="Refresh all data"
              className="p-2.5 text-slate-500 hover:text-white bg-slate-800/60 rounded-xl transition-colors hover:bg-slate-700/60"
            >
              <RefreshCw size={16} />
            </button>
            <button
              id="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Settings"
              className="p-2.5 text-slate-500 hover:text-white bg-slate-800/60 rounded-xl transition-colors hover:bg-slate-700/60"
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="px-8 py-6">
          <Dashboard />
        </main>

        {/* Settings modal */}
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
