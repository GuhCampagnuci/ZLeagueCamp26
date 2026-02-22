
import React, { useMemo, useState } from 'react';
import { AppState, MatchReport } from '../types';
import { Trophy, Calendar, Search, Activity, Ban, Footprints, User, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryProps {
  state: AppState;
}

const MatchHistory: React.FC<HistoryProps> = ({ state }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const sortedReports = useMemo(() => {
    return [...state.reports]
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter(r => {
        const homeTeam = state.teams.find(t => String(t.id) === String(r.homeTeamId));
        const awayTeam = state.teams.find(t => String(t.id) === String(r.awayTeamId));
        const search = searchTerm.toLowerCase();
        return (
          homeTeam?.name.toLowerCase().includes(search) || 
          awayTeam?.name.toLowerCase().includes(search) ||
          homeTeam?.president.toLowerCase().includes(search) ||
          awayTeam?.president.toLowerCase().includes(search)
        );
      });
  }, [state.reports, state.teams, searchTerm]);

  const MatchCard: React.FC<{ report: MatchReport }> = ({ report }) => {
    const homeTeam = state.teams.find(t => String(t.id) === String(report.homeTeamId));
    const awayTeam = state.teams.find(t => String(t.id) === String(report.awayTeamId));
    const isExpanded = expandedMatch === report.id;

    // Filtros de eventos usando PlayerStats vinculado
    const scorers = report.playerStats.filter(s => (Number(s.goals) > 0 || Number(s.assists) > 0));
    const bookings = report.playerStats.filter(s => (Number(s.yellowCards) > 0 || Number(s.redCards) > 0));
    const injuries = report.playerStats.filter(s => s.injury);

    return (
      <div className={`ea-card rounded-3xl overflow-hidden transition-all border-l-4 ${isExpanded ? 'border-l-blue-500 bg-zinc-900/40' : 'border-l-zinc-800'}`}>
        <button 
          onClick={() => setExpandedMatch(isExpanded ? null : report.id)}
          className="w-full p-6 hover:bg-zinc-800/20 transition-colors text-left"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:hidden">
              <Calendar size={12} /> {new Date(report.timestamp).toLocaleDateString('pt-BR')}
            </div>

            {/* Mandante */}
            <div className="flex items-center gap-4 md:flex-1 min-w-0 justify-end">
              <div className="text-right flex flex-col items-end">
                <span className="font-heading font-black text-sm md:text-base text-zinc-100 uppercase italic truncate">{homeTeam?.name || '---'}</span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter flex items-center gap-1">
                   <User size={10} /> {homeTeam?.president || '---'}
                </span>
              </div>
              <img 
                src={homeTeam?.logo || 'https://placehold.co/100x100/18181b/3b82f6?text=?'} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shadow-lg" 
                alt="" 
              />
            </div>

            {/* Placar Central */}
            <div className="flex flex-col items-center">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center px-8 py-3 shadow-2xl gap-4">
                <span className="text-4xl font-black italic text-blue-500">{report.homeScore}</span>
                <span className="text-xl font-black italic text-zinc-700">X</span>
                <span className="text-4xl font-black italic text-blue-500">{report.awayScore}</span>
              </div>
              <span className="hidden md:flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-3">
                <Calendar size={10} /> {new Date(report.timestamp).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Visitante */}
            <div className="flex items-center gap-4 md:flex-1 min-w-0 justify-start">
              <img 
                src={awayTeam?.logo || 'https://placehold.co/100x100/18181b/3b82f6?text=?'} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shadow-lg" 
                alt="" 
              />
              <div className="text-left flex flex-col items-start">
                <span className="font-heading font-black text-sm md:text-base text-zinc-100 uppercase italic truncate">{awayTeam?.name || '---'}</span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter flex items-center gap-1">
                   <User size={10} /> {awayTeam?.president || '---'}
                </span>
              </div>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="p-8 bg-zinc-950/50 border-t border-zinc-900 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Eventos de Gols */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Footprints size={14} /> Gols & Assistências
                </h4>
                <div className="space-y-2">
                  {scorers.length === 0 ? <p className="text-[10px] text-zinc-600 italic">Sem scout registrado para esta partida.</p> : 
                    scorers.map((s, i) => {
                      const player = state.teams.flatMap(t => t.squad).find(pl => String(pl.id) === String(s.playerId));
                      return (
                        <div key={i} className="flex items-center justify-between text-[11px] font-bold p-2 bg-zinc-900/50 rounded-lg">
                          <span className="text-zinc-300 uppercase italic truncate max-w-[120px]">{player?.name || 'Jogador'}</span>
                          <div className="flex gap-2">
                             {Number(s.goals) > 0 && <span className="text-blue-400 font-black">{s.goals}G</span>}
                             {Number(s.assists) > 0 && <span className="text-zinc-500 font-black">{s.assists}A</span>}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>

              {/* Disciplina */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Ban size={14} /> Disciplina
                </h4>
                <div className="space-y-2">
                  {bookings.length === 0 ? <p className="text-[10px] text-zinc-600 italic">Jogo limpo, sem cartões.</p> : 
                    bookings.map((s, i) => {
                      const player = state.teams.flatMap(t => t.squad).find(pl => String(pl.id) === String(s.playerId));
                      return (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-bold p-2 bg-zinc-900/50 rounded-lg">
                          <div className="flex gap-1">
                             {Number(s.yellowCards) > 0 && <div className="w-2.5 h-3.5 bg-yellow-500 rounded-sm shadow-sm" />}
                             {Number(s.redCards) > 0 && <div className="w-2.5 h-3.5 bg-red-600 rounded-sm shadow-sm" />}
                          </div>
                          <span className="text-zinc-300 uppercase italic truncate">{player?.name || 'Jogador'}</span>
                        </div>
                      );
                    })
                  }
                </div>
              </div>

              {/* Saúde */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} /> Departamento Médico
                </h4>
                <div className="space-y-2">
                  {injuries.length === 0 ? <p className="text-[10px] text-zinc-600 italic">Nenhuma lesão reportada.</p> : 
                    injuries.map((s, i) => {
                      const player = state.teams.flatMap(t => t.squad).find(pl => String(pl.id) === String(s.playerId));
                      return (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-orange-400 uppercase italic p-2 bg-zinc-900/50 rounded-lg">
                          <Activity size={12} />
                          <span>{player?.name || 'Jogador'}</span>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-end">
               <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">CÓDIGO DA PARTIDA: {report.id}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading italic uppercase text-white tracking-tighter leading-none">Histórico de <span className="text-blue-500">Partidas</span></h1>
          <p className="text-zinc-500 text-sm mt-2">Relatório completo de todos os confrontos oficiais.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar time ou presidente..." 
            className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 w-full md:w-72 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedReports.length === 0 ? (
          <div className="p-20 text-center bg-zinc-900/20 border-2 border-dashed border-zinc-800/50 rounded-[3rem]">
            <Trophy size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-zinc-600 font-bold uppercase italic text-sm tracking-widest">Ainda não há registros de partidas.</p>
          </div>
        ) : (
          sortedReports.map(report => <MatchCard key={report.id} report={report} />)
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
