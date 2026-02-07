
import { AppState, Team, Player, Availability, Challenge, MatchReport, PlayerMatchStats } from '../types';

const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzo6g_elWQzka40rGtTSBo5Srpor3yFrEYOXQ1INGrNGLFPZ0N2ms_rRaDdx87Y1gk/exec';
const STORAGE_KEY = 'fifa_26_championship_data';

const isUrlConfigured = () => SHEETS_API_URL && !SHEETS_API_URL.includes('AQUI');

export const getInitialData = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return { teams: [], availabilities: [], challenges: [], reports: [] };
};

export const syncFromSheets = async (): Promise<AppState | null> => {
  if (!isUrlConfigured()) return null;

  try {
    const response = await fetch(`${SHEETS_API_URL}?action=getData`);
    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
    
    const rawData = await response.json();
    
    // 1. Vincular Jogadores aos seus Times
    const linkedTeams: Team[] = (rawData.teams || []).map((team: any) => ({
      ...team,
      squad: (rawData.players || []).filter((p: any) => 
        String(p.team_id || p.teamId) === String(team.id)
      )
    }));

    // 2. Extrair Scouts Individuais da aba PlayerStats
    const allPlayerStats: any[] = rawData.playerStats || [];

    // 3. Processar Reports vinculando os PlayerStats correspondentes
    const processedReports: MatchReport[] = (rawData.reports || []).map((report: any) => {
      const matchId = String(report.id);
      let stats: PlayerMatchStats[] = [];
      
      // Tenta filtrar os scouts que pertencem a esta partida específica
      // Verificamos 'matchId' ou 'matchid' pois o Apps Script pode converter para minúsculo
      const linkedStats = allPlayerStats.filter(s => 
        String(s.matchId || s.matchid) === matchId
      );
      
      if (linkedStats.length > 0) {
        stats = linkedStats.map(s => ({
          playerId: String(s.playerId || s.playerid),
          teamId: String(s.teamId || s.teamid),
          goals: Number(s.goals) || 0,
          assists: Number(s.assists) || 0,
          yellowCards: Number(s.yellowCards) || 0,
          redCards: Number(s.redCards) || 0,
          injury: String(s.injury).toUpperCase() === 'TRUE' || s.injury === true
        }));
      } else {
        // Fallback para dados legados que podem estar salvos como JSON na coluna da aba Reports
        try {
          if (typeof report.playerStats === 'string' && report.playerStats.trim() !== '') {
            stats = JSON.parse(report.playerStats);
          } else if (Array.isArray(report.playerStats)) {
            stats = report.playerStats;
          }
        } catch (e) {
          stats = [];
        }
      }

      return {
        ...report,
        homeScore: Number(report.homeScore) || 0,
        awayScore: Number(report.awayScore) || 0,
        timestamp: Number(report.timestamp) || Date.now(),
        playerStats: Array.isArray(stats) ? stats : []
      };
    });

    const finalData: AppState = {
      teams: linkedTeams,
      availabilities: rawData.availabilities || [],
      challenges: rawData.challenges || [],
      reports: processedReports
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
    return finalData;
  } catch (error) {
    console.error("❌ Erro ao sincronizar:", error);
    return null;
  }
};

export const addRowToSheets = async (sheetName: string, rowData: any[]) => {
  if (!isUrlConfigured()) return;
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addRow', sheet: sheetName, data: rowData })
    });
  } catch (error) {
    console.error(`❌ Erro ao salvar em ${sheetName}:`, error);
  }
};

export const updateChallengeStatusInSheets = async (id: string, status: string) => {
  if (!isUrlConfigured()) return;
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', sheet: 'Challenges', id, status })
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar status do desafio:", error);
  }
};

export const saveData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
