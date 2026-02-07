
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppState, Challenge, Team } from '../types';
import { Sword, Check, X, Loader2, Calendar, Clock, MessageSquare } from 'lucide-react';
import { addRowToSheets, updateChallengeStatusInSheets } from '../services/storage';

interface ChallengesProps {
  state: AppState;
  onUpdate: (challenges: Challenge[]) => void;
}

// Helpers to fix Google Sheets date/time quirks
const cleanDate = (dateStr: string) => {
  if (!dateStr) return '--/--/--';
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
  }
  return dateStr;
};

const cleanTime = (timeStr: string) => {
  if (!timeStr) return '--:--';
  const d = new Date(timeStr);
  if (!isNaN(d.getTime()) && timeStr.includes('T')) {
    return d.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  }
  return timeStr.substring(0, 5);
};

const Challenges: React.FC<ChallengesProps> = ({ state, onUpdate }) => {
  const location = useLocation();
  const [challengerId, setChallengerId] = useState('');
  const [challengedId, setChallengedId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (location.state?.challengedId) {
      setChallengedId(String(location.state.challengedId));
    }
  }, [location.state]);

  const sendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengerId || !challengedId || String(challengerId) === String(challengedId)) {
      return alert('Selecione times válidos e diferentes!');
    }

    setIsSending(true);
    const id = Math.random().toString(36).substr(2, 9);
    const createdAt = Date.now();
    const newChallenge: Challenge = {
      id,
      challengerTeamId: String(challengerId),
      challengedTeamId: String(challengedId),
      date,
      time,
      message,
      status: 'Pendente',
      createdAt
    };

    await addRowToSheets('Challenges', [
      id, challengerId, challengedId, date, time, message, 'Pendente', createdAt
    ]);

    onUpdate([...state.challenges, newChallenge]);
    alert('Desafio enviado com sucesso!');
    setMessage('');
    setIsSending(false);
  };

  const updateStatus = async (id: string, status: 'Aceito' | 'Recusado') => {
    await updateChallengeStatusInSheets(id, status);
    onUpdate(state.challenges.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="space-y-12 pb-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Formulário de Envio */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="space-y-1">
            <h1 className="text-3xl font-black font-heading italic uppercase text-white tracking-tighter">Marcar Confronto</h1>
            <p className="text-zinc-500 text-sm">Oficialize o duelo e intime seu rival.</p>
          </div>
          
          <form onSubmit={sendChallenge} className="ea-card p-6 rounded-3xl space-y-5 border-t-2 border-t-blue-500 shadow-xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Seu Time</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={challengerId} onChange={(e) => setChallengerId(e.target.value)}>
                  <option value="">Escolha seu clube...</option>
                  {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Rival</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={challengedId} onChange={(e) => setChallengedId(e.target.value)}>
                  <option value="">Escolha o rival...</option>
                  {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Data</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="date" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Hora</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="time" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Mensagem</label>
              <textarea 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-h-[60px] text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-700" 
                placeholder="Ex: Prepare o lencinho..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button 
              disabled={isSending}
              className="w-full ea-gradient py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSending ? <Loader2 className="animate-spin" size={20} /> : <Sword size={20} />}
              {isSending ? 'Enviando...' : 'Lançar Desafio'}
            </button>
          </form>
        </div>

        {/* Mural de Desafios */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black font-heading italic uppercase flex items-center gap-3 text-white">
              <Sword size={24} className="text-blue-500" /> Mural de Desafios
            </h2>
            <div className="bg-zinc-900 px-3 py-1 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-800">
              {state.challenges.length} Ativos
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.challenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/20 rounded-[2rem] border-2 border-dashed border-zinc-800/50">
                <Sword size={48} className="text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-bold uppercase italic text-sm">Nenhum desafio no mural.</p>
              </div>
            ) : [...state.challenges].sort((a,b) => b.createdAt - a.createdAt).map(c => {
              const challenger = state.teams.find(t => String(t.id) === String(c.challengerTeamId));
              const challenged = state.teams.find(t => String(t.id) === String(c.challengedTeamId));
              
              return (
                <div key={c.id} className="ea-card rounded-2xl overflow-hidden border-zinc-800/50 shadow-lg transition-all hover:border-blue-500/40 group">
                  <div className="px-4 py-2 bg-zinc-950/80 flex items-center justify-between border-b border-zinc-900/50">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      c.status === 'Pendente' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                      c.status === 'Aceito' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.1)]' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-1">
                       <Calendar size={10} /> Criado: {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <img 
                          src={challenger?.logo || 'https://placehold.co/60x60/18181b/3b82f6?text=?'} 
                          alt={challenger?.name} 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-zinc-800 bg-zinc-900 shadow-lg shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-black text-xs md:text-sm text-zinc-100 truncate uppercase italic leading-tight">{challenger?.name || 'Clube ?'}</h4>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase truncate">Pres: {challenger?.president || '---'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center px-1">
                        <span className="font-heading font-black text-blue-500 text-[10px] italic">VS</span>
                      </div>

                      <div className="flex-1 flex items-center justify-end gap-3 min-w-0 text-right">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-black text-xs md:text-sm text-zinc-100 truncate uppercase italic leading-tight">{challenged?.name || 'Clube ?'}</h4>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase truncate">Pres: {challenged?.president || '---'}</p>
                        </div>
                        <img 
                          src={challenged?.logo || 'https://placehold.co/60x60/18181b/3b82f6?text=?'} 
                          alt={challenged?.name} 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-zinc-800 bg-zinc-900 shadow-lg shrink-0" 
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-900/50 pt-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-blue-500" />
                          <span className="text-[10px] font-black text-zinc-200 uppercase italic">
                            {cleanDate(c.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-blue-500" />
                          <span className="text-[10px] font-black text-zinc-200 uppercase italic">
                            {cleanTime(c.time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {c.message && (
                      <div className="mt-2 p-2 bg-zinc-900/40 rounded-xl border border-zinc-800/30 flex gap-2 italic">
                        <MessageSquare size={12} className="text-blue-500/40 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-zinc-500 font-medium leading-normal line-clamp-1">
                          "{c.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {c.status === 'Pendente' && (
                    <div className="px-4 py-2.5 bg-zinc-950/60 border-t border-zinc-900 flex gap-2">
                      <button 
                        onClick={() => updateStatus(c.id, 'Aceito')} 
                        className="flex-1 py-1.5 bg-green-500/10 text-green-400 rounded-lg font-black text-[9px] uppercase tracking-widest border border-green-500/20 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check size={10} /> ACEITAR
                      </button>
                      <button 
                        onClick={() => updateStatus(c.id, 'Recusado')} 
                        className="flex-1 py-1.5 bg-red-500/10 text-red-400 rounded-lg font-black text-[9px] uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <X size={10} /> RECUSAR
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Challenges;
