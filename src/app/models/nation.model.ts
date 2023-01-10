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
  ranking: string;
  abbreviation: string;
}

export interface GroupTeam {
  name: string;
  logo: string;
  abbreviation: string;
  region: string;
  matchesPlayed: number;
  points: number;
  gDiff: number;
  gFor: number;
  gOpp: number;
  tier: string;
  attRating: number;
  midRating: number;
  defRating: number;
  rating: number;
  matchHistory: {
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
  };
  ranking: number;
  attRanking: number;
  midRanking: number;
  defRanking: number;
  pot?: number;
  reportCard: {
    grade: string | null;
    tournamentFinish: string | null;
    gradeStyle: string | null;
    gradeSummary: string | null;
  };
  emoji: string;
}

export const defaultHost: GroupTeam = {
  name: 'qatar',
  abbreviation: 'qat',
  logo: 'https://fmdataba.com/images/n/QAT.svg',
  emoji: '🇶🇦',
  region: 'afc',
  points: 0,
  gDiff: 0,
  gFor: 0,
  gOpp: 0,
  tier: 'j',
  attRating: 0,
  midRating: 0,
  defRating: 0,
  rating: 0,
  matchesPlayed: 0,
  matchHistory: {
    qualifiers: [],
    group: [],
    bracket: [],
  },
  reportCard: {
    grade: null,
    gradeStyle: null,
    gradeSummary: null,
    tournamentFinish: null,
  },
  ranking: 0,
  attRanking: 0,
  midRanking: 0,
  defRanking: 0,
};
