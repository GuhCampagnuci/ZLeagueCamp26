
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTournamentSummary = async (state: AppState) => {
  const prompt = `
    Analise o estado atual do campeonato de FIFA 26:
    Times: ${state.teams.map(t => t.name).join(', ')}
    Presidentes: ${state.teams.map(t => t.president).join(', ')}
    Desafios Ativos: ${state.challenges.filter(c => c.status === 'Pendente').length}
    Jogos Reportados: ${state.reports.length}
    
    Crie um breve resumo motivacional e engraçado (estilo narrador de futebol) sobre o que está acontecendo no campeonato para a página inicial.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O campeonato está pegando fogo! Preparem seus controles!";
  }
};
