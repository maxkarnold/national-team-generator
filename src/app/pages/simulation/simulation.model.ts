export interface GroupTeam {
  name: string;
  logo: string;
  region: string;
  points: number;
  gDiff: number;
  gFor: number;
  gOpp: number;
  tier: string;
  attRating: number;
  defRating: number;
  rating: number;
  matchesPlayed: number;
  pot?: number;
}

export interface Match {
  goalsFor: number;
  goalsAg: number;
  penaltyWin: boolean;
  winner: GroupTeam;
  loser: GroupTeam;
}

export interface TournamentStats {
  first: GroupTeam;
  second: GroupTeam;
  third: GroupTeam;
  underPerformer: GroupTeam;
  overPerformer: GroupTeam;
  bestTeamByRegion?: {
    uefa: GroupTeam;
    afc: GroupTeam;
    caf: GroupTeam;
    concacaf: GroupTeam;
    conmebol: GroupTeam;
    ofc?: GroupTeam;
  };
}

export interface Tournament32 {
  teams: GroupTeam[];
  groups: GroupTeam[][];
  bracket?: {
    roundOf16: [GroupTeam, GroupTeam, Match][];
    quarterFinals: [GroupTeam, GroupTeam, Match][];
    semiFinals: [GroupTeam, GroupTeam, Match][];
    finals: [GroupTeam, GroupTeam, Match][];
  };
  stats?: TournamentStats;
}
