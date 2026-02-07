
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Squads from './pages/Squads';
import AvailabilityPage from './pages/Availability';
import Challenges from './pages/Challenges';
import MatchReportPage from './pages/MatchReport';
import MatchHistory from './pages/MatchHistory';
import Rules from './pages/Rules';
import Statistics from './pages/Statistics';
import { AppState } from './types';
import { getInitialData, saveData, syncFromSheets } from './services/storage';
import { RefreshCcw, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getInitialData());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(false);
    const cloudData = await syncFromSheets();
    if (cloudData) {
      setState(cloudData);
    } else {
      setSyncError(true);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    handleSync();
  }, []);

  const updateAvailabilities = (availabilities: AppState['availabilities']) => {
    setState(prev => ({ ...prev, availabilities }));
    saveData({ ...state, availabilities });
  };

  const updateChallenges = (challenges: AppState['challenges']) => {
    setState(prev => ({ ...prev, challenges }));
    saveData({ ...state, challenges });
  };

  const updateReports = (reports: AppState['reports']) => {
    setState(prev => ({ ...prev, reports }));
    saveData({ ...state, reports });
  };

  return (
    <Router>
      <div className="min-h-screen pb-24 lg:pb-0 lg:pt-16">
        <Navbar />
        
        {syncError && (
          <div className="bg-red-500/10 border-b border-red-500/20 py-2 px-4 text-center animate-in slide-in-from-top duration-300">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <AlertCircle size={14} /> Falha ao conectar com Google Sheets. Operando em modo local.
            </p>
          </div>
        )}

        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className={`fixed top-20 right-4 z-40 bg-zinc-900 border border-zinc-800 p-3 rounded-full hover:bg-zinc-800 transition-all shadow-xl group ${isSyncing ? 'opacity-50' : ''}`}
        >
          <RefreshCcw size={18} className={`${isSyncing ? 'animate-spin text-blue-500' : 'text-zinc-400 group-hover:text-white'}`} />
        </button>

        <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home state={state} />} />
            <Route path="/squads" element={<Squads state={state} />} />
            <Route path="/availability" element={<AvailabilityPage state={state} onUpdate={updateAvailabilities} />} />
            <Route path="/challenges" element={<Challenges state={state} onUpdate={updateChallenges} />} />
            <Route path="/history" element={<MatchHistory state={state} />} />
            <Route path="/report" element={<MatchReportPage state={state} onUpdate={updateReports} />} />
            <Route path="/statistics" element={<Statistics state={state} />} />
            <Route path="/rules" element={<Rules />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
