
import React from 'react';
import { BookOpen, ShieldCheck, Trophy, Clock, Users, ClipboardList, AlertTriangle, Calendar, Info, Ban } from 'lucide-react';

const Rules: React.FC = () => {
  const sections = [
    {
      title: "1. Visão Geral",
      icon: ShieldCheck,
      content: "O Z LEAGUE 2026 é um campeonato competitivo de FIFA entre clubes controlados por jogadores humanos, com foco em organização, justiça nos agendamentos, transparência nos resultados e engajamento contínuo dos participantes. Este regulamento define as regras oficiais da competição."
    },
    {
      title: "2. Estrutura do Campeonato",
      icon: Trophy,
      content: "Disputado em formato de liga (pontos corridos) com 2 turnos. Critérios de classificação seguem o padrão do Campeonato Brasileiro.",
      details: [
        "Vitória: 3 pontos",
        "Empate: 1 ponto",
        "Derrota: 0 ponto",
        "W.O.: 3 pontos para o vencedor (placar 3x0)"
      ]
    },
    {
      title: "3. Elencos e Jogadores",
      icon: Users,
      content: "Cada time possui um elenco oficial único. A posição principal será sempre a primeira informada (ex: PE/PD/MD → PE).",
      details: [
        "Ajustes via Solicitação de Ajuste (Jogador, Time, Novo Overall, Posições).",
        "Motivos válidos: troca, correção ou contratação.",
        "Ajustes devem ser aprovados pelo dono do time envolvido."
      ]
    },
    {
      title: "4. Disponibilidade",
      icon: Clock,
      content: "Cada time é obrigado a informar sua disponibilidade semanal de jogo publicamente.",
      details: [
        "Mínimo de 4 dias da semana.",
        "Definição clara de Horário Inicial e Final.",
        "Base oficial para validação de desafios e W.O."
      ]
    },
    {
      title: "5. Desafios e Agendamento",
      icon: Calendar,
      content: "Desafios devem ser registrados no sistema informando data e horário sugeridos.",
      details: [
        "Válido apenas se dentro da disponibilidade do desafiado.",
        "Feito com mínimo de 1 dia de antecedência.",
        "O desafiado tem até 24 horas para aceitar ou recusar."
      ]
    },
    {
      title: "6. Regra de W.O. (Walkover)",
      icon: AlertTriangle,
      content: "Punição para times inativos ou que evitam confrontos válidos.",
      details: [
        "3 desafios válidos ignorados/recusados = Derrota por W.O.",
        "Contagem reseta após 1 jogo executado.",
        "Placar padrão de 3 x 0 para o vencedor."
      ]
    },
    {
      title: "7. Registro de Partidas",
      icon: ClipboardList,
      content: "Após o jogo, um dos presidentes deve reportar os dados no sistema.",
      details: [
        "Placar final, Gols e Assistências por jogador.",
        "Cartões (Amarelo/Vermelho) e Lesões (Leve/Média).",
        "O outro time deve confirmar ou contestar o resultado."
      ]
    },
    {
      title: "8. Critérios de Desempate",
      icon: Info,
      content: "Em caso de empate em pontos na tabela da liga:",
      details: [
        "1º Maior número de vitórias.",
        "2º Confronto direto entre os empatantes.",
        "3º Saldo de gols."
      ]
    },
    {
      title: "9. Cartões e Suspensões",
      icon: Ban,
      content: "Regras disciplinares para garantir o fair play e punir excessos em campo.",
      details: [
        "Cartão Vermelho: Suspensão automática do próximo jogo.",
        "3º Cartão Amarelo: Suspensão automática (Acumulativo na liga).",
        "2 Amarelos + 1 Vermelho: Suspensão de 1 jogo (regra do vermelho).",
        "Zerar Cartões: Cartões amarelos são zerados para o Mata-Mata."
      ]
    }
  ];

  const scheduleData = [
    { etapa: 'Draft', inicio: '01/01/2026', fim: '01/02/2026', obs: 'Formação inicial' },
    { etapa: 'Início do Camp', inicio: '02/02/2026', fim: '30/04/2026', obs: 'Liga (2 turnos)' },
    { etapa: '2ª Janela', inicio: '13/02/2026', fim: '15/02/2026', obs: 'Mín. 5 jogos' },
    { etapa: '3ª Janela', inicio: '27/02/2026', fim: '01/03/2026', obs: 'Mín. 12 jogos' },
    { etapa: 'Semi Final', inicio: '02/03/2026', fim: '08/03/2026', obs: '-' },
    { etapa: 'Final', inicio: '09/03/2026', fim: '15/03/2026', obs: '-' },
  ];

  const getStatus = (startStr: string, endStr: string) => {
    const now = new Date();
    // Assuming date format is DD/MM/YYYY
    const parse = (d: string) => {
      if (d === '-') return null;
      const [day, month, year] = d.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    const startDate = parse(startStr);
    const endDate = parse(endStr);

    if (!startDate || !endDate) return "A iniciar";

    // Adjust end date to end of day
    endDate.setHours(23, 59, 59, 999);

    if (now > endDate) return "Encerrada";
    if (now >= startDate && now <= endDate) return "Em andamento...";
    return "A iniciar";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 lg:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full text-blue-500 mb-2 border border-blue-500/20 shadow-xl shadow-blue-500/10">
          <BookOpen size={48} />
        </div>
        <h1 className="text-5xl lg:text-6xl font-black font-heading italic uppercase tracking-tighter text-white">
          Regulamento <span className="text-blue-500">Oficial</span>
        </h1>
        <p className="text-zinc-500 max-w-2xl mx-auto text-sm lg:text-base font-medium">
          Z LEAGUE 2026: A constituição definitiva para presidentes que buscam a glória com honra e estratégia.
        </p>
      </header>

      {/* Grid de Regras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="ea-card p-6 rounded-3xl flex flex-col h-full border-b-2 border-b-zinc-800 hover:border-b-blue-500 transition-all group">
            <div className="flex items-center gap-3 mb-4 text-blue-500 group-hover:scale-110 transition-transform origin-left">
              <section.icon size={22} />
              <h2 className="font-heading font-black text-sm uppercase italic tracking-tight">{section.title}</h2>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-medium">
              {section.content}
            </p>
            {section.details && (
              <ul className="space-y-2 mt-auto pt-4 border-t border-zinc-900">
                {section.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                    <span className="w-1 h-1 rounded-full bg-blue-500/50 shrink-0 mt-1.5" />
                    {detail}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Cronograma */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black font-heading italic uppercase flex items-center gap-3 text-white">
            <Calendar className="text-blue-500" /> Cronograma Oficial
          </h2>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hidden md:block">TEMPORADA 2026.1</span>
        </div>

        <div className="ea-card rounded-3xl overflow-hidden border-zinc-800 shadow-2xl">
          <div className="bg-zinc-900/50 p-3 flex items-center justify-center lg:hidden border-b border-zinc-800">
             <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
               👈 Arraste para o lado para ver a tabela completa
             </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950/80 text-[10px] uppercase font-black tracking-widest text-zinc-500 border-b border-zinc-800">
                  <th className="px-6 py-5">Etapa</th>
                  <th className="px-6 py-5">Início</th>
                  <th className="px-6 py-5">Fim</th>
                  <th className="px-6 py-5">Observações / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {scheduleData.map((row, i) => {
                  const status = getStatus(row.inicio, row.fim);
                  const statusColor = 
                    status === "Encerrada" ? "text-zinc-600" :
                    status === "Em andamento..." ? "text-green-500" : "text-blue-500";

                  return (
                    <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-black italic text-sm text-zinc-100 uppercase">{row.etapa}</td>
                      <td className="px-6 py-4 text-xs font-bold text-blue-400">{row.inicio}</td>
                      <td className="px-6 py-4 text-xs font-bold text-zinc-300">{row.fim}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-black uppercase italic ${statusColor}`}>
                            {status}
                          </span>
                          <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wide">
                            {row.obs}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mata-Mata Rules */}
      <div className="ea-card p-8 rounded-[2rem] border-zinc-800 relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-zinc-100 rotate-12">
          <Trophy size={140} />
        </div>
        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl font-black font-heading italic uppercase text-blue-500">Regras de Mata-Mata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-blue-500 italic">3</div>
                <p className="text-sm font-bold text-zinc-100 uppercase italic">O Desempate do Terceiro Jogo</p>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium ml-11">
                Em caso de empate nos 2 jogos, haverá um terceiro jogo para desempate. Se este também terminar empatado, o critério de desempate será o <strong>confronto direto</strong> realizado durante o campeonato.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-blue-500 italic">!</div>
                <p className="text-sm font-bold text-zinc-100 uppercase italic">Ultima Instância</p>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium ml-11">
                Se os confrontos diretos também forem empates, o desempate segue a ordem da tabela da liga: pontos → saldo de gols → gols feitos. E se ainda assim persistir o empate... a vitória é dividida e ambos levam a taça! 😂
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center pt-8 opacity-50">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">
          © 2026 Z LEAGUE - Honra, Sangue e FIFA
        </p>
      </footer>
    </div>
  );
};

export default Rules;
