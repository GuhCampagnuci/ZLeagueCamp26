
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Availability, Team } from '../types';
import { Calendar, Plus, Clock, Trash2, User, Sword, Loader2 } from 'lucide-react';
import { addRowToSheets } from '../services/storage';

interface AvailabilityProps {
  state: AppState;
  onUpdate: (avail: Availability[]) => void;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Função para converter horários do Sheets (ISO/UTC) para o horário local do usuário
const formatTime = (timeStr: string) => {
  if (!timeStr) return '--:--';
  
  // Tenta converter a string ISO (ex: 1899-12-30T22:30:00.000Z) para Date
  const d = new Date(timeStr);
  
  // Se for uma data válida e contiver 'T' (indicativo de objeto Date do Sheets convertido para ISO)
  if (!isNaN(d.getTime()) && timeStr.includes('T')) {
    return d.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  }
  
  // Fallback para strings simples "HH:mm" que já estejam corretas
  return timeStr.substring(0, 5);
};

const AvailabilityPage: React.FC<AvailabilityProps> = ({ state, onUpdate }) => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [day, setDay] = useState<string>('Segunda');
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('22:00');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return alert('Selecione seu time!');

    setIsSaving(true);
    const id = Math.random().toString(36).substr(2, 9);
    const newAvail: Availability = {
      id,
      teamId: selectedTeam,
      day: day as any,
      startTime: start,
      endTime: end
    };

    // Salva no Sheets
    await addRowToSheets('Availabilities', [id, selectedTeam, day, start, end]);
    
    // Atualiza estado local
    onUpdate([...state.availabilities, newAvail]);
    setIsSaving(false);
  };

  const removeAvail = (id: string) => {
    onUpdate(state.availabilities.filter(a => a.id !== id));
  };

  const handleChallenge = (teamId: string) => {
    navigate('/challenges', { state: { challengedId: teamId } });
  };

  const groupedAvailabilities = useMemo(() => {
    const groups: Record<string, Availability[]> = {};
    state.availabilities.forEach(avail => {
      const tId = String(avail.teamId);
      if (!groups[tId]) {
        groups[tId] = [];
      }
      groups[tId].push(avail);
    });

    Object.keys(groups).forEach(teamId => {
      groups[teamId].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    });

    return groups;
  }, [state.availabilities]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="ea-card p-6 rounded-2xl border-blue-500/30 sticky top-24">
          <h2 className="font-heading font-black text-xl mb-4 flex items-center gap-2 italic uppercase text-white">
            <Plus size={20} className="text-blue-500" /> Postar Horário
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Time</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Selecione...</option>
                {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Dia da Semana</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Das</label>
                <input 
                  type="time" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 outline-none text-zinc-100" 
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">Até</label>
                <input 
                  type="time" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 outline-none text-zinc-100" 
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full ea-gradient py-3 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all mt-4 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
              {isSaving ? 'Salvando...' : 'Adicionar ao Mural'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black font-heading italic uppercase text-white">Mural de Disponibilidade</h1>
          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-widest">
            {Object.keys(groupedAvailabilities).length} Times Ativos
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(groupedAvailabilities).length === 0 ? (
            <div className="text-zinc-500 italic p-12 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl col-span-2">
              <Calendar size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum presidente postou agenda ainda.</p>
              <p className="text-xs mt-2">Seja o primeiro a marcar território!</p>
            </div>
          ) : (
            (Object.entries(groupedAvailabilities) as [string, Availability[]][]).map(([teamId, avails]) => {
              const team = state.teams.find(t => String(t.id) === String(teamId));
              
              return (
                <div key={teamId} className="ea-card rounded-2xl flex flex-col overflow-hidden border-t-2 border-t-blue-500">
                  <div className="p-5 bg-gradient-to-b from-zinc-900/80 to-transparent border-b border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <img src={team?.logo} className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shadow-lg bg-zinc-800" alt={team?.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black font-heading text-lg text-zinc-100 truncate uppercase italic leading-none mb-1">{team?.name || 'Time não encontrado'}</h4>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <User size={12} className="text-blue-500" />
                          <span className="text-[10px] uppercase font-bold tracking-widest truncate">{team?.president || '---'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Clock size={12} /> Agenda Semanal
                    </div>
                    {avails.map(avail => (
                      <div key={avail.id} className="group flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/30 hover:border-blue-500/30 hover:bg-zinc-800/60 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-zinc-100 uppercase italic">{avail.day}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {formatTime(avail.startTime)} <span className="text-zinc-700 mx-1">às</span> {formatTime(avail.endTime)}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeAvail(avail.id)}
                          className="text-zinc-700 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover horário"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-zinc-950/40 mt-auto border-t border-zinc-900">
                    <button 
                      onClick={() => handleChallenge(teamId)}
                      className="w-full py-2 text-[10px] font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                    >
                      Desafiar agora <Sword size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
