
export interface Player {
  id: string;
  name: string;
  overall: number;
  position: string;
  team: string;
}

export interface Team {
  id: string;
  name: string;
  president: string;
  squad: Player[];
  logo: string;
}

export interface Availability {
  id: string;
  teamId: string;
  day: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
  startTime: string;
  endTime: string;
}

export interface Challenge {
  id: string;
  challengerTeamId: string;
  challengedTeamId: string;
  date: string;
  time: string;
  message: string;
  status: 'Pendente' | 'Aceito' | 'Recusado' | 'Concluído';
  createdAt: number;
}

export interface PlayerMatchStats {
  playerId: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  injury: boolean;
}

export interface MatchReport {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  reporterTeamId: string;
  timestamp: number;
  playerStats: PlayerMatchStats[];
}

export interface AppState {
  teams: Team[];
  availabilities: Availability[];
  challenges: Challenge[];
  reports: MatchReport[];
}
