export interface Club {
  id: number;
  clubName: string;
  logo: string;
  league: string;
  leagueDifficulty: number;
  clubRating: number;
  marketValue: number;
  gamesInSeason: number;
  continent: Region;
}

export enum Region {
  UEFA = 'uefa',
  CONMEBOL = 'conembol',
  CONCACAF = 'concacaf',
  CAF = 'caf',
  AFC = 'afc',
}
