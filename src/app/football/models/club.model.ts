export interface Club {
  id: number;
  name: string;
  logo: string;
  league: string;
  continent: Region;
  abbreviation: string | null;
  leagueDifficulty: number;
  clubRating: number;
  marketValue: number;
  gamesInSeason: number;
  leagueTeams: number;
}

export enum Region {
  UEFA = 'uefa',
  CONMEBOL = 'conembol',
  CONCACAF = 'concacaf',
  CAF = 'caf',
  AFC = 'afc',
}
