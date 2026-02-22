
import React, { useState, useMemo } from 'react';
import { AppState, Team, Player } from '../types';
import { Search, ChevronDown, ChevronUp, User, Filter, ArrowDownAz } from 'lucide-react';

interface SquadsProps {
  state: AppState;
}

type SortOption = 'overall' | 'position';

const CATEGORIES = {
  ATACANTES: ['ATA', 'PD', 'PE', 'SA'],
  MEIO_CAMPISTAS: ['VOL', 'MC', 'MEI', 'ME', 'MD'],
  DEFENSORES: ['ZAG', 'LD', 'LE'],
  GOLEIROS: ['GOL']
};

const Squads: React.FC<SquadsProps> = ({ state }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('overall');

  const filteredTeams = state.teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.president.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.squad.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleTeam = (id: string) => {
    setExpandedTeam(expandedTeam === id ? null : id);
  };

  const renderPositions = (posString: string) => {
    if (!posString) return null;
    const positions = posString.split('/');
    return (
      <div className="flex flex-wrap gap-1">
        {positions.map((p, i) => (
          <span 
            key={i} 
            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shrink-0 ${
              i === 0 
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20' 
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {p.trim()}
          </span>
        ))}
      </div>
    );
  };

  const getPlayerCategory = (posString: string) => {
    if (!posString) return 'OUTROS';
    const mainPos = posString.split('/')[0].trim().toUpperCase();
    
    if (CATEGORIES.ATACANTES.includes(mainPos)) return 'ATACANTES';
    if (CATEGORIES.MEIO_CAMPISTAS.includes(mainPos)) return 'MEIO-CAMPISTAS';
    if (CATEGORIES.DEFENSORES.includes(mainPos)) return 'DEFENSORES';
    if (CATEGORIES.GOLEIROS.includes(mainPos)) return 'GOLEIROS';
    return 'OUTROS';
  };

  const sortPlayers = (players: Player[]) => {
    return [...players].sort((a, b) => {
      if (sortBy === 'overall') {
        return b.overall - a.overall;
      } else {
        return a.position.localeCompare(b.position);
      }
    });
  };

  const renderSquadTable = (players: Player[]) => {
    const categoriesOrder = ['ATACANTES', 'MEIO-CAMPISTAS', 'DEFENSORES', 'GOLEIROS', 'OUTROS'];
    const sorted = sortPlayers(players);
    
    const grouped: Record<string, Player[]> = {};
    sorted.forEach(p => {
      const cat = getPlayerCategory(p.position);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });

    return (
      <div className="space-y-8">
        {categoriesOrder.map(cat => {
          const catPlayers = grouped[cat];
          if (!catPlayers || catPlayers.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {cat}
              </h3>
              
              {/* Header do Grid */}
              <div className="grid grid-cols-12 gap-4 px-2 pb-2 text-zinc-600 uppercase text-[9px] font-black tracking-widest border-b border-zinc-900/50">
                <div className="col-span-5 md:col-span-4">Jogador</div>
                <div className="col-span-4 md:col-span-4">Posição</div>
                <div className="col-span-1 text-center">OVR</div>
                <div className="col-span-2 md:col-span-3 text-right">Origem</div>
              </div>

              <div className="divide-y divide-zinc-900/30">
                {catPlayers.map(player => (
                  <div key={player.id} className="grid grid-cols-12 gap-4 items-center py-3 px-2 hover:bg-zinc-900/40 transition-colors group">
                    {/* Jogador */}
                    <div className="col-span-5 md:col-span-4 truncate">
                      <span className="font-black text-zinc-100 italic uppercase text-xs truncate block">
                        {player.name}
                      </span>
                    </div>

                    {/* Posição - Largura Flexível mas controlada */}
                    <div className="col-span-4 md:col-span-4 overflow-hidden">
                      {renderPositions(player.position)}
                    </div>

                    {/* Overall - Largura Fixa Centrada */}
                    <div className="col-span-1 flex justify-center">
                      <span className={`inline-block w-8 py-0.5 rounded font-black text-[10px] italic text-center ${
                        player.overall >= 90 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 
                        player.overall >= 85 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {player.overall}
                      </span>
                    </div>

                    {/* Time Origem - Alinhado à Direita */}
                    <div className="col-span-2 md:col-span-3 text-right">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight group-hover:text-zinc-300 transition-colors truncate block">
                        {/* Tenta ler 'team' ou 'origem' caso o nome na planilha mude */}
                        {player.team || (player as any).origem || '---'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading italic uppercase text-white">Elencos & Presidentes</h1>
          <p className="text-zinc-500">Gestão tática e visualização de plantéis.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
             <button 
              onClick={() => setSortBy('overall')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${sortBy === 'overall' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <ArrowDownAz size={12} /> OVR
             </button>
             <button 
              onClick={() => setSortBy('position')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${sortBy === 'position' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <Filter size={12} /> Posição
             </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 w-full md:w-60 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
            <User size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-zinc-500 italic">Nenhum time ou presidente encontrado.</p>
          </div>
        ) : filteredTeams.map(team => (
          <div key={team.id} className={`ea-card rounded-2xl overflow-hidden transition-all border-l-2 ${expandedTeam === team.id ? 'border-l-blue-500 ring-1 ring-blue-500/20' : 'border-l-zinc-800'}`}>
            <button 
              onClick={() => toggleTeam(team.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-lg object-cover border border-zinc-800 shadow-md" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[9px] font-black text-white">
                    {team.squad.length}
                  </div>
                </div>
                <div className="text-left">
                  <h2 className="font-heading font-black text-lg text-white uppercase italic leading-none mb-1">{team.name}</h2>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">PRESIDENTE:</span>
                      <span className="text-[10px] text-blue-400 font-black uppercase italic">{team.president}</span>
                    </div>
                    {team.ea_id && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">ID EA:</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{team.ea_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {expandedTeam === team.id ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} className="text-zinc-600" />}
              </div>
            </button>

            {expandedTeam === team.id && (
              <div className="p-5 bg-zinc-950/40 border-t border-zinc-900 animate-in slide-in-from-top-2 duration-300">
                {team.squad.length === 0 ? (
                   <div className="py-8 text-center text-zinc-600 italic text-xs border border-dashed border-zinc-900 rounded-xl">
                      Nenhum jogador vinculado a este time na planilha.
                   </div>
                ) : renderSquadTable(team.squad)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Squads;
