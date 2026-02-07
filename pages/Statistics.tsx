
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { Trophy, Award, Footprints, Star, User, Ban, AlertCircle, Activity } from 'lucide-react';

interface StatisticsProps {
  state: AppState;
}

interface PlayerRanking {
  id: string;
  name: string;
  team: string;
  value: number;
}

const Statistics: React.FC<StatisticsProps> = ({ state }) => {
  // Calculate rankings
  const { topScorers, topAssisters, topYellowCards, topRedCards, topInjuries } = useMemo(() => {
    const goalsMap: Record<string, number> = {};
    const assistsMap: Record<string, number> = {};
    const yellowMap: Record<string, number> = {};
    const redMap: Record<string, number> = {};
    const injuryMap: Record<string, number> = {};

    state.reports.forEach((report) => {
      // Verificação defensiva: garante que playerStats existe e é um array
      if (!report.playerStats || !Array.isArray(report.playerStats)) return;

      report.playerStats.forEach((stat) => {
        if (stat.goals > 0) {
          goalsMap[stat.playerId] = (goalsMap[stat.playerId] || 0) + stat.goals;
        }
        if (stat.assists > 0) {
          assistsMap[stat.playerId] = (assistsMap[stat.playerId] || 0) + stat.assists;
        }
        if (stat.yellowCards > 0) {
          yellowMap[stat.playerId] = (yellowMap[stat.playerId] || 0) + stat.yellowCards;
        }
        if (stat.redCards > 0) {
          redMap[stat.playerId] = (redMap[stat.playerId] || 0) + stat.redCards;
        }
        if (stat.injury) {
          injuryMap[stat.playerId] = (injuryMap[stat.playerId] || 0) + 1;
        }
      });
    });

    const allPlayers = state.teams.flatMap((t) => 
      t.squad.map(p => ({ ...p, teamName: t.name }))
    );

    const formatRanking = (map: Record<string, number>): PlayerRanking[] => {
      return Object.entries(map)
        .map(([playerId, value]) => {
          const player = allPlayers.find((p) => String(p.id) === String(playerId));
          return {
            id: playerId,
            name: player?.name || 'Jogador Desconhecido',
            team: player?.teamName || 'N/A',
            value,
          };
        })
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
        .slice(0, 10);
    };

    return {
      topScorers: formatRanking(goalsMap),
      topAssisters: formatRanking(assistsMap),
      topYellowCards: formatRanking(yellowMap),
      topRedCards: formatRanking(redMap),
      topInjuries: formatRanking(injuryMap),
    };
  }, [state]);

  const RankingList = ({ title, data, icon: Icon, colorClass, unit, small = false }: { 
    title: string, 
    data: PlayerRanking[], 
    icon: any, 
    colorClass: string,
    unit: string,
    small?: boolean
  }) => (
    <div className={`ea-card rounded-3xl overflow-hidden border-t-4 border-t-zinc-800 flex flex-col ${small ? 'h-full' : ''}`}>
      <div className={`p-5 bg-gradient-to-b from-zinc-900 to-transparent flex items-center justify-between border-b border-zinc-800/50`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
            <Icon className={colorClass.replace('bg-', 'text-')} size={small ? 18 : 22} />
          </div>
          <h2 className={`font-heading font-black uppercase italic tracking-tight ${small ? 'text-sm' : 'text-lg'}`}>{title}</h2>
        </div>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">TOP 10</span>
      </div>
      <div className="p-3 space-y-1.5 flex-1">
        {data.length === 0 ? (
          <p className="text-zinc-600 text-[10px] italic p-6 text-center">Nenhum registro.</p>
        ) : (
          data.map((player, index) => (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                index === 0 ? 'bg-zinc-800/40 border border-zinc-700/50' : 'hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-5 text-center font-black italic text-xs ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-zinc-300' : 
                  index === 2 ? 'text-orange-400' : 'text-zinc-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className={`font-bold text-zinc-100 truncate flex items-center gap-1.5 ${small ? 'text-[11px]' : 'text-xs'}`}>
                    {player.name}
                    {index === 0 && !small && <Star size={10} className="fill-yellow-500 text-yellow-500" />}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase truncate">{player.team}</span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className={`font-black italic ${small ? 'text-lg' : 'text-xl'} ${index === 0 ? colorClass.replace('bg-', 'text-') : 'text-zinc-200'}`}>
                  {player.value}
                </span>
                <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-tighter">{unit}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black font-heading italic uppercase tracking-tighter text-white">
          Hall da <span className="text-blue-500">Fama</span>
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto text-sm">Os números não mentem. Confira quem está dominando (e quem está sofrendo) nos campos.</p>
      </div>

      {/* Main Stats: Goals and Assists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RankingList 
          title="Artilheiros" 
          data={topScorers} 
          icon={Trophy} 
          colorClass="bg-yellow-500" 
          unit="Gols"
        />
        <RankingList 
          title="Garçons" 
          data={topAssisters} 
          icon={Award} 
          colorClass="bg-blue-500" 
          unit="Assistências"
        />
      </div>

      {/* Disciplinary and Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankingList 
          title="Bad Boys (Amarelo)" 
          data={topYellowCards} 
          icon={AlertCircle} 
          colorClass="bg-yellow-400" 
          unit="Cartões"
          small
        />
        <RankingList 
          title="Expulsos (Vermelho)" 
          data={topRedCards} 
          icon={Ban} 
          colorClass="bg-red-600" 
          unit="Cartões"
          small
        />
        <RankingList 
          title="Departamento Médico" 
          data={topInjuries} 
          icon={Activity} 
          colorClass="bg-orange-500" 
          unit="Lesões"
          small
        />
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gols Totais', value: state.reports.reduce((acc, r) => acc + (Number(r.homeScore) || 0) + (Number(r.awayScore) || 0), 0), icon: Footprints },
          { label: 'Partidas Realizadas', value: state.reports.length, icon: User },
          { label: 'Média de Gols', value: state.reports.length ? (((state.reports.reduce((acc, r) => acc + (Number(r.homeScore) || 0) + (Number(r.awayScore) || 0), 0)) / state.reports.length)).toFixed(1) : '0.0', icon: Star },
          { label: 'Cartões Aplicados', value: state.reports.reduce((acc, r) => acc + (Array.isArray(r.playerStats) ? r.playerStats.reduce((pa, s) => pa + (Number(s.yellowCards) || 0) + (Number(s.redCards) || 0), 0) : 0), 0), icon: AlertCircle },
        ].map((stat, i) => (
          <div key={i} className="ea-card p-5 rounded-3xl flex flex-col items-center justify-center text-center space-y-1 border-b-2 border-b-zinc-800 hover:border-b-blue-500 transition-colors">
            <stat.icon size={18} className="text-zinc-500 mb-1" />
            <span className="text-3xl font-black italic text-white">{stat.value}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
