import { Match } from 'app/pages/simulation/simulation.model';

export interface Nation {
  name: string;
  logo: string;
  region: 'uefa' | 'conmebol' | 'afc' | 'ofc' | 'concacaf' | 'caf';
  firstNameUsages: string[];
  lastNameUsages: string[];
  mainLeagues: string[];
  secondLeagues: string[];
  thirdLeagues: string[];
  rareLeagues: string[];
  excludeLeagues: string[];
}

export interface GroupTeam {
  name: string;
  logo: string;
  region: string;
  matchesPlayed: number;
  points: number;
  gDiff: number;
  gFor: number;
  gOpp: number;
  tier: string;
  attRating: number;
  defRating: number;
  rating: number;
  qualifiers: {
    match: Match;
    opp: GroupTeam;
  }[];
  group: {
    match: Match;
    opp: GroupTeam;
  }[];
  bracket: {
    match: Match;
    opp: GroupTeam;
  }[];
  ranking?: number;
  pot?: number;
}
