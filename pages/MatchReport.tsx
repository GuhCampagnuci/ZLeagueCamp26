
import React, { useState, useMemo } from 'react';
import { AppState, MatchReport, Team, PlayerMatchStats, Player } from '../types';
import { ClipboardList, Trophy, Plus, Save, Activity, Ban, Award, UserPlus, Trash2, Loader2, Footprints } from 'lucide-react';
import { addRowToSheets } from '../services/storage';

interface ReportProps {
  state: AppState;
  onUpdate: (reports: MatchReport[]) => void;
}

const MatchReportPage: React.FC<ReportProps> = ({ state, onUpdate }) => {
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [reporterId, setReporterId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedPlayersStats, setSelectedPlayersStats] = useState<PlayerMatchStats[]>([]);
  const [homePlayerSelect, setHomePlayerSelect] = useState('');
  const [awayPlayerSelect, setAwayPlayerSelect] = useState('');

  const homeTeam = useMemo(() => state.teams.find(t => String(t.id) === String(homeId)), [homeId, state.teams]);
  const awayTeam = useMemo(() => state.teams.find(t => String(t.id) === String(awayId)), [awayId, state.teams]);

  const addPlayerToReport = (playerId: string, teamId: string) => {
    if (!playerId) return;
    if (selectedPlayersStats.find(s => s.playerId === playerId)) {
      alert("Este jogador já foi adicionado!");
      return;
    }

    const newStat: PlayerMatchStats = {
      playerId,
      teamId,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      injury: false
    };

    setSelectedPlayersStats(prev => [...prev, newStat]);
    setHomePlayerSelect('');
    setAwayPlayerSelect('');
  };

  const removePlayerFromReport = (playerId: string) => {
    setSelectedPlayersStats(prev => prev.filter(s => s.playerId !== playerId));
  };

  const updatePlayerStat = (playerId: string, field: keyof PlayerMatchStats, value: any) => {
    setSelectedPlayersStats(prev => prev.map(s => 
      s.playerId === playerId ? { ...s, [field]: value } : s
    ));
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeId || !awayId || homeId === awayId || !reporterId) {
      return alert('Preencha os dados da partida corretamente!');
    }

    setIsSaving(true);
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    // 1. Salva o Resumo da Partida na aba Reports
    // Colunas: id, homeTeamId, awayTeamId, homeScore, awayScore, reporterTeamId, timestamp
    await addRowToSheets('Reports', [
      id, homeId, awayId, homeScore, awayScore, reporterId, timestamp
    ]);

    // 2. Salva cada Scout individual na nova aba PlayerStats
    // Colunas: matchId, playerId, teamId, goals, assists, yellowCards, redCards, injury
    for (const stat of selectedPlayersStats) {
      await addRowToSheets('PlayerStats', [
        id, // link com matchId
        stat.playerId,
        stat.teamId,
        stat.goals,
        stat.assists,
        stat.yellowCards,
        stat.redCards,
        stat.injury
      ]);
    }

    const newReport: MatchReport = {
      id,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore,
      awayScore,
      reporterTeamId: reporterId,
      timestamp,
      playerStats: selectedPlayersStats
    };

    onUpdate([...state.reports, newReport]);
    alert('Partida reportada e sincronizada com sucesso!');
    
    // Reset form
    setHomeId('');
    setAwayId('');
    setHomeScore(0);
    setAwayScore(0);
    setReporterId('');
    setSelectedPlayersStats([]);
    setIsSaving(false);
  };

  const renderPlayerRow = (stat: PlayerMatchStats) => {
    const team = state.teams.find(t => String(t.id) === String(stat.teamId));
    const player = team?.squad.find(p => String(p.id) === String(stat.playerId));

    return (
      <div key={stat.playerId} className="ea-card flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl border-zinc-800/50 hover:border-blue-500/30 transition-all group">
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
          <img src={team?.logo} className="w-8 h-8 rounded-lg object-cover bg-zinc-900 border border-zinc-800" alt="" />
          <div className="truncate">
            <h4 className="font-black text-xs text-white uppercase italic truncate">{player?.name || 'Jogador'}</h4>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{player?.position}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex flex-col items-center">
             <input type="number" min="0" className="w-10 bg-zinc-950 border border-zinc-800 rounded p-1 text-center text-xs text-blue-500 font-black outline-none" 
              value={stat.goals} onChange={(e) => updatePlayerStat(stat.playerId, 'goals', parseInt(e.target.value) || 0)} />
             <span className="text-[7px] font-black text-zinc-600 uppercase mt-1">Gols</span>
          </div>
          <div className="flex flex-col items-center">
             <input type="number" min="0" className="w-10 bg-zinc-950 border border-zinc-800 rounded p-1 text-center text-xs text-zinc-300 font-black outline-none" 
              value={stat.assists} onChange={(e) => updatePlayerStat(stat.playerId, 'assists', parseInt(e.target.value) || 0)} />
             <span className="text-[7px] font-black text-zinc-600 uppercase mt-1">Assis</span>
          </div>
          
          <button type="button" onClick={() => updatePlayerStat(stat.playerId, 'yellowCards', stat.yellowCards ? 0 : 1)}
            className={`w-5 h-7 rounded border transition-all ${stat.yellowCards ? 'bg-yellow-500 border-yellow-400' : 'bg-zinc-900 border-zinc-800'}`} />
          
          <button type="button" onClick={() => updatePlayerStat(stat.playerId, 'redCards', stat.redCards ? 0 : 1)}
            className={`w-5 h-7 rounded border transition-all ${stat.redCards ? 'bg-red-600 border-red-500' : 'bg-zinc-900 border-zinc-800'}`} />

          <button type="button" onClick={() => updatePlayerStat(stat.playerId, 'injury', !stat.injury)}
            className={`p-1.5 rounded border transition-all ${stat.injury ? 'text-orange-500 bg-orange-500/10 border-orange-500/50' : 'text-zinc-700 bg-zinc-900 border-zinc-800'}`}>
            <Activity size={12} />
          </button>

          <button type="button" onClick={() => removePlayerFromReport(stat.playerId)} className="p-1.5 text-zinc-700 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black font-heading italic uppercase text-white tracking-tighter">Reportar Partida</h1>
        <p className="text-zinc-500 text-sm font-medium">Súmula oficial com scout individual por atleta.</p>
      </div>

      <form onSubmit={submitReport} className="space-y-6">
        <div className="ea-card rounded-[2.5rem] p-8 border-t-4 border-t-blue-500 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 relative z-10">
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mandante</label>
              <div className="flex flex-col items-center gap-4">
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" 
                  value={homeId} onChange={(e) => setHomeId(e.target.value)}>
                  <option value="">Time...</option>
                  {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input type="number" min="0" className="w-20 h-20 bg-zinc-900 border-2 border-zinc-800 rounded-3xl text-4xl font-black text-center outline-none text-white"
                  value={homeScore} onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black italic text-blue-500 shadow-xl">VS</div>
            </div>

            <div className="space-y-4 text-center">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visitante</label>
              <div className="flex flex-col items-center gap-4">
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" 
                  value={awayId} onChange={(e) => setAwayId(e.target.value)}>
                  <option value="">Time...</option>
                  {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input type="number" min="0" className="w-20 h-20 bg-zinc-900 border-2 border-zinc-800 rounded-3xl text-4xl font-black text-center outline-none text-white"
                  value={awayScore} onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ea-card p-5 rounded-2xl space-y-4 border-l-2 border-l-blue-500">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">Ação Mandante</h3>
            <div className="flex gap-2">
              <select disabled={!homeTeam} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white disabled:opacity-50"
                value={homePlayerSelect} onChange={(e) => setHomePlayerSelect(e.target.value)}>
                <option value="">Jogador...</option>
                {homeTeam?.squad.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
              </select>
              <button type="button" onClick={() => addPlayerToReport(homePlayerSelect, homeId)} disabled={!homePlayerSelect}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 disabled:opacity-50">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="ea-card p-5 rounded-2xl space-y-4 border-r-2 border-r-blue-500">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-end gap-2">Ação Visitante</h3>
            <div className="flex gap-2">
              <select disabled={!awayTeam} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white disabled:opacity-50"
                value={awayPlayerSelect} onChange={(e) => setAwayPlayerSelect(e.target.value)}>
                <option value="">Jogador...</option>
                {awayTeam?.squad.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
              </select>
              <button type="button" onClick={() => addPlayerToReport(awayPlayerSelect, awayId)} disabled={!awayPlayerSelect}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 disabled:opacity-50">
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-3 px-1">
              <Footprints size={18} className="text-blue-500" />
              <h3 className="text-lg font-black font-heading italic uppercase text-white">Súmula da Partida</h3>
           </div>
           <div className="space-y-3">
             {selectedPlayersStats.length === 0 ? (
               <div className="p-12 text-center bg-zinc-900/20 border-2 border-dashed border-zinc-800/50 rounded-3xl">
                 <p className="text-zinc-600 font-bold uppercase italic text-xs">Adicione os destaques do jogo acima.</p>
               </div>
             ) : (
               selectedPlayersStats.map(renderPlayerRow)
             )}
           </div>
        </div>

        <div className="ea-card p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border-t-2 border-t-blue-500">
          <div className="space-y-1.5 w-full md:w-64">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Responsável</label>
            <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" 
              value={reporterId} onChange={(e) => setReporterId(e.target.value)}>
              <option value="">Quem reporta...</option>
              {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={isSaving}
            className="w-full md:w-auto ea-gradient px-12 py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 text-white shadow-2xl disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Gravando...' : 'Finalizar Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchReportPage;
