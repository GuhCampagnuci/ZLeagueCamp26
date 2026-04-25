
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppState, MatchReport } from '../types';
import { Trophy, Flame, Target, ChevronRight, Swords } from 'lucide-react';

interface HomeProps {
  state: AppState;
}

interface TableEntry {
  teamId: string;
  name: string;
  logo: string;
  president: string;
  eaId?: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

const cleanDate = (dateStr: string | number) => {
  if (!dateStr) return '--/--/--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('pt-BR');
};

// ── Bracket sub-components ──────────────────────────────────────────────────

interface BracketSlotProps {
  team?: TableEntry;
  seed?: number;
  isWinner?: boolean;
  result?: MatchReport;
  side: 'home' | 'away';
  isFinal?: boolean;
}

const BracketSlot: React.FC<BracketSlotProps> = ({ team, seed, isWinner, result, side, isFinal }) => {
  const score = result
    ? side === 'home'
      ? (result.homeTeamId === team?.teamId ? result.homeScore : result.awayScore)
      : (result.awayTeamId === team?.teamId ? result.awayScore : result.homeScore)
    : null;

  if (!team) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 opacity-40">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
          <span className="text-[10px] text-zinc-600 font-black">?</span>
        </div>
        <span className="text-xs text-zinc-600 font-bold italic uppercase">A definir</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border transition-all
      ${isWinner
        ? isFinal
          ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
          : 'border-blue-500 bg-blue-500/10'
        : result
          ? 'border-zinc-800 bg-zinc-900/40 opacity-50'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
      }`}>
      {seed !== undefined && (
        <span className="text-[9px] font-black text-zinc-600 w-3 shrink-0">{seed}º</span>
      )}
      <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-800 shrink-0" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-black italic uppercase truncate text-zinc-100">{team.name}</span>
        <span className="text-[9px] text-zinc-500 truncate">{team.president}</span>
      </div>
      {score !== null && (
        <span className={`text-base font-black italic shrink-0 ${isWinner ? 'text-blue-400' : 'text-zinc-600'}`}>
          {score}
        </span>
      )}
    </div>
  );
};

const BracketConnector: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <div className={`flex flex-col items-center justify-center w-12 shrink-0 ${flip ? 'scale-x-[-1]' : ''}`}>
    <div className="w-full flex flex-col gap-0">
      <div className="h-8 border-r-2 border-t-2 border-zinc-700 rounded-tr-lg" />
      <div className="h-8 border-r-2 border-b-2 border-zinc-700 rounded-br-lg" />
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────

const Home: React.FC<HomeProps> = ({ state }) => {
  // Calculate League Table
  const leagueTable = useMemo(() => {
    const table: Record<string, TableEntry> = {};

    state.teams.forEach((team) => {
      table[team.id] = {
        teamId: team.id,
        name: team.name,
        logo: team.logo,
        president: team.president,
        eaId: team.ea_id,
        points: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      };
    });

    state.reports.forEach((report) => {
      const home = table[report.homeTeamId];
      const away = table[report.awayTeamId];

      if (home && away) {
        home.played += 1;
        away.played += 1;
        home.goalsFor += Number(report.homeScore);
        home.goalsAgainst += Number(report.awayScore);
        away.goalsFor += Number(report.awayScore);
        away.goalsAgainst += Number(report.homeScore);

        if (Number(report.homeScore) > Number(report.awayScore)) {
          home.wins += 1;
          home.points += 3;
          away.losses += 1;
        } else if (Number(report.homeScore) < Number(report.awayScore)) {
          away.wins += 1;
          away.points += 3;
          home.losses += 1;
        } else {
          home.draws += 1;
          away.draws += 1;
          home.points += 1;
          away.points += 1;
        }
      }
    });

    return Object.values(table)
      .map((entry) => ({
        ...entry,
        goalDifference: entry.goalsFor - entry.goalsAgainst,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return b.wins - a.wins;
      });
  }, [state.reports, state.teams]);

  const recentChallenges = [...state.challenges].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  const recentReports = [...state.reports].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  // Bracket: top 4 → 1º vs 4º (SF1), 2º vs 3º (SF2)
  const bracketTeams = leagueTable.slice(0, 4);
  const sf1 = [bracketTeams[0], bracketTeams[3]];
  const sf2 = [bracketTeams[1], bracketTeams[2]];

  const findMatchResult = (t1Id: string | undefined, t2Id: string | undefined): MatchReport | undefined => {
    if (!t1Id || !t2Id) return undefined;
    return [...state.reports]
      .filter(r => r.phase === 'Fase Final')
      .sort((a, b) => b.timestamp - a.timestamp)
      .find(r =>
        (r.homeTeamId === t1Id && r.awayTeamId === t2Id) ||
        (r.homeTeamId === t2Id && r.awayTeamId === t1Id)
      );
  };

  const getWinner = (result: MatchReport | undefined, t1: TableEntry | undefined, t2: TableEntry | undefined): TableEntry | undefined => {
    if (!result || !t1 || !t2) return undefined;
    if (Number(result.homeScore) > Number(result.awayScore)) return result.homeTeamId === t1.teamId ? t1 : t2;
    if (Number(result.homeScore) < Number(result.awayScore)) return result.homeTeamId === t1.teamId ? t2 : t1;
    return undefined; // empate
  };

  const sf1Result = findMatchResult(sf1[0]?.teamId, sf1[1]?.teamId);
  const sf2Result = findMatchResult(sf2[0]?.teamId, sf2[1]?.teamId);
  const sf1Winner = getWinner(sf1Result, sf1[0], sf1[1]);
  const sf2Winner = getWinner(sf2Result, sf2[0], sf2[1]);
  const finalResult = sf1Winner && sf2Winner ? findMatchResult(sf1Winner.teamId, sf2Winner.teamId) : undefined;
  const champion = sf1Winner && sf2Winner ? getWinner(finalResult, sf1Winner, sf2Winner) : undefined;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <section className="relative h-[180px] lg:h-[220px] rounded-3xl overflow-hidden flex items-center justify-center text-center px-6 border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1551280857-2b9bbe52cfcd?q=80&w=2070&auto=format&fit=crop" 
          alt="Stadium" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-20 space-y-1">
          <h1 className="text-4xl lg:text-6xl font-black font-heading tracking-tighter italic text-white uppercase">
            Z LEAGUE <span className="text-blue-500">2026</span>
          </h1>
          <p className="text-zinc-400 text-sm lg:text-base font-bold uppercase tracking-[0.3em] opacity-80">1º Temporada</p>
        </div>
      </section>

      {/* ── CHAVE FINAL ── */}
      {bracketTeams.length >= 4 && (
        <section className="ea-card rounded-3xl overflow-hidden border-t-4 border-t-yellow-500">
          <div className="p-6 bg-gradient-to-b from-zinc-900 to-transparent flex items-center gap-2 border-b border-zinc-800/50">
            <Swords size={20} className="text-yellow-500" />
            <h2 className="font-heading font-black text-xl uppercase italic tracking-tight text-white">Fase Final</h2>
            <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">Fase 2</span>
          </div>

          <div className="p-6 overflow-x-auto">
            <div className="flex items-center justify-center gap-0 min-w-[560px]">

              {/* SEMIFINAL 1 */}
              <div className="flex flex-col gap-2 w-44">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center mb-2">Semifinal 1</p>
                <BracketSlot team={sf1[0]} seed={1} isWinner={sf1Winner?.teamId === sf1[0]?.teamId} result={sf1Result} side="home" />
                <BracketSlot team={sf1[1]} seed={4} isWinner={sf1Winner?.teamId === sf1[1]?.teamId} result={sf1Result} side="away" />
              </div>

              {/* CONECTOR SF1 → FINAL */}
              <BracketConnector />

              {/* FINAL */}
              <div className="flex flex-col gap-2 w-44 relative">
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 text-center mb-2">Final</p>
                <BracketSlot team={sf1Winner} isWinner={champion?.teamId === sf1Winner?.teamId} result={finalResult} side="home" isFinal />
                <BracketSlot team={sf2Winner} isWinner={champion?.teamId === sf2Winner?.teamId} result={finalResult} side="away" isFinal />
                {champion && (
                  <div className="absolute -bottom-10 left-0 right-0 flex flex-col items-center gap-1">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Campeão</span>
                    <span className="text-xs font-black italic text-white uppercase">{champion.name}</span>
                  </div>
                )}
              </div>

              {/* CONECTOR FINAL ← SF2 */}
              <BracketConnector flip />

              {/* SEMIFINAL 2 */}
              <div className="flex flex-col gap-2 w-44">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center mb-2">Semifinal 2</p>
                <BracketSlot team={sf2[0]} seed={2} isWinner={sf2Winner?.teamId === sf2[0]?.teamId} result={sf2Result} side="home" />
                <BracketSlot team={sf2[1]} seed={3} isWinner={sf2Winner?.teamId === sf2[1]?.teamId} result={sf2Result} side="away" />
              </div>

            </div>
          </div>
          {champion && <div className="pb-8" />}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="ea-card rounded-3xl overflow-hidden border-t-4 border-t-blue-500">
            <div className="p-6 bg-gradient-to-b from-zinc-900 to-transparent flex items-center justify-between border-b border-zinc-800/50">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                <h2 className="font-heading font-black text-xl uppercase italic tracking-tight text-white">Classificação Geral</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-zinc-950/50 text-[10px] uppercase font-black tracking-widest text-zinc-500 border-b border-zinc-800">
                    <th className="px-4 py-4 text-center">Pos</th>
                    <th className="px-4 py-4">Time</th>
                    <th className="px-4 py-4 text-center">P</th>
                    <th className="px-4 py-4 text-center">J</th>
                    <th className="px-4 py-4 text-center">V</th>
                    <th className="px-4 py-4 text-center">E</th>
                    <th className="px-4 py-4 text-center">D</th>
                    <th className="px-4 py-4 text-center">GP</th>
                    <th className="px-4 py-4 text-center">GC</th>
                    <th className="px-4 py-4 text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {leagueTable.slice(0, -1).map((entry, index) => (
                    <tr key={entry.teamId} className={`hover:bg-zinc-800/30 transition-colors ${index === 0 ? 'bg-blue-500/5' : ''}`}>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-black italic text-lg ${index === 0 ? 'text-yellow-500' : index < 4 ? 'text-blue-400' : 'text-zinc-600'}`}>
                          {index + 1}º
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={entry.logo} alt={entry.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shadow-sm" />
                          <div className="flex flex-col">
                            <span className={`font-bold uppercase italic text-sm ${index === 0 ? 'text-white' : 'text-zinc-300'}`}>
                              {entry.name}
                            </span>
                            <div className="flex flex-col -space-y-0.5">
                              <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                                {entry.president}
                              </span>
                              {entry.eaId && (
                                <span className="text-[9px] text-zinc-500 font-bold uppercase">
                                  ID EA: <span className="text-zinc-400">{entry.eaId}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-blue-500 text-lg">{entry.points}</span>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-zinc-300">{entry.played}</td>
                      <td className="px-4 py-4 text-center text-xs text-zinc-400 font-medium">{entry.wins}</td>
                      <td className="px-4 py-4 text-center text-xs text-zinc-400 font-medium">{entry.draws}</td>
                      <td className="px-4 py-4 text-center text-xs text-zinc-400 font-medium">{entry.losses}</td>
                      <td className="px-4 py-4 text-center text-xs text-zinc-500">{entry.goalsFor}</td>
                      <td className="px-4 py-4 text-center text-xs text-zinc-500">{entry.goalsAgainst}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold text-xs ${entry.goalDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="ea-card p-6 rounded-3xl">
              <h3 className="font-heading font-bold mb-4 flex items-center gap-2 uppercase italic text-orange-500">
                <Flame size={18} /> DESAFIOS RECENTES
              </h3>
              <div className="space-y-3">
                {recentChallenges.length > 0 ? recentChallenges.map(c => {
                  const challenger = state.teams.find(t => t.id === c.challengerTeamId);
                  const challenged = state.teams.find(t => t.id === c.challengedTeamId);
                  return (
                    <div key={c.id} className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-blue-500/50 transition-all">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-zinc-100">{challenger?.name}</span>
                         <span className="text-[10px] text-zinc-600">VS</span>
                         <span className="text-xs font-bold text-zinc-100">{challenged?.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">{cleanDate(c.date)}</span>
                    </div>
                  );
                }) : <p className="text-zinc-500 text-sm italic p-4 text-center">Nenhum desafio ativo.</p>}
              </div>
            </div>
            
            <div className="ea-card p-6 rounded-3xl">
              <h3 className="font-heading font-bold mb-4 flex items-center gap-2 uppercase italic text-yellow-500">
                <Target size={18} /> ÚLTIMOS RESULTADOS
              </h3>
              <div className="space-y-3">
                {recentReports.length > 0 ? recentReports.map(r => {
                  const home = state.teams.find(t => t.id === r.homeTeamId);
                  const away = state.teams.find(t => t.id === r.awayTeamId);
                  return (
                    <div key={r.id} className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold text-zinc-300 w-24 truncate text-right">{home?.name}</span>
                        <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 flex gap-2 font-black text-sm italic mx-2">
                          <span className="text-blue-500">{r.homeScore}</span>
                          <span className="text-zinc-700">-</span>
                          <span className="text-blue-500">{r.awayScore}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300 w-24 truncate">{away?.name}</span>
                      </div>
                    </div>
                  );
                }) : <p className="text-zinc-500 text-sm italic p-4 text-center">Nenhuma partida finalizada.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="ea-card p-6 rounded-3xl border-b-4 border-b-zinc-800">
            <h3 className="font-heading font-black text-lg uppercase italic mb-6 text-white tracking-tight">Status da Liga</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-zinc-900">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Gols Totais</span>
                <span className="font-black italic text-xl text-blue-500">{state.reports.reduce((acc, r) => acc + Number(r.homeScore) + Number(r.awayScore), 0)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Partidas Disputadas</span>
                <span className="font-black italic text-xl text-zinc-100">{state.reports.length}</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 rounded-3xl ea-gradient text-white flex flex-col gap-6 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <Trophy size={160} />
            </div>
            <div className="relative z-10 space-y-2">
              <h3 className="font-heading font-black text-2xl leading-none italic uppercase">Calendário Aberto</h3>
              <p className="text-sm opacity-80 leading-relaxed">Não deixe seu adversário esperando. Mostre quem manda!</p>
            </div>
            <Link 
              to="/availability" 
              className="relative z-10 bg-white text-blue-600 font-black py-4 rounded-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              Ver Agenda <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
