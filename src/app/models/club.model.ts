export interface Club {
  club: string;
  logo: string;
  league: string;
}

export interface Clubs {
  top50: Club[];
  top200: Club[];
  regularInternational: Club[];
  averagePlayer: Club[];
  championshipPlayer: Club[];
  leagueOnePlayer: Club[];
  leagueTwoPlayer: Club[];
  fillerPlayer: Club[];
  [key: string]: Club[];
}
