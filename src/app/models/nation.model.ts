import { Match } from 'app/pages/simulation/simulation.model';
import { Person } from './player.model';

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
  nationTier: string;
  abbreviation: string;
  canSoloHost32: boolean;
  cohosts32: string[];
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
  nationTier: string;
  attRating: number;
  midRating: number;
  defRating: number;
  penRating: number;
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
  reportCard: {
    grade: string | null;
    tournamentFinish: string | null;
    gradeStyle: string | null;
    gradeSummary: string | null;
  };
  emoji: string;
  homeTeam: boolean;
  canSoloHost32: boolean;
  cohosts32: string[];
  coach?: Person;
  pot?: number;
}

export const defaultHost: GroupTeam = {
  name: 'Qatar',
  abbreviation: 'qat',
  logo: 'https://fmdataba.com/images/n/QAT.svg',
  emoji: '🇶🇦',
  region: 'afc',
  points: 0,
  gDiff: 0,
  gFor: 0,
  gOpp: 0,
  tier: 'j',
  nationTier: 'e',
  attRating: 0,
  midRating: 0,
  defRating: 0,
  penRating: 0,
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
  homeTeam: true,
  canSoloHost32: true,
  cohosts32: [],
};
