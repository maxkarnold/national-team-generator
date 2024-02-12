import { Match, RegionName } from 'app/pages/simulation/simulation.model';
import { Person } from './player.model';

export interface Nation {
  name: string;
  logo: string;
  region: RegionName;
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
  cohosts48: string[];
  emoji: string;
}

export interface GroupTeam {
  name: string;
  logo: string;
  abbreviation: string;
  region: RegionName;
  matchesPlayed: number;
  points: number;
  gDiff: number;
  gFor: number;
  gOpp: number;
  tier: string;
  nationTier: string;
  startingRating: {
    att: number;
    mid: number;
    def: number;
    pen: number;
  };
  dynamicRating: {
    att: number;
    mid: number;
    def: number;
    pen: number;
  };
  isBuffed: {
    att: boolean;
    mid: boolean;
    def: boolean;
    pen: boolean;
  };
  isDebuffed: {
    att: boolean;
    mid: boolean;
    def: boolean;
    pen: boolean;
  };
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
  cohosts48: string[];
  coach?: Person;
  pot?: number;
  groupFinish?: string;
}

export function isNation(value: any): value is Nation {
  return (<Nation>value).abbreviation !== undefined;
}

export const defaultHost32: GroupTeam = {
  name: 'Qatar',
  abbreviation: 'qat',
  logo: 'https://fmdataba.com/images/n/QAT.svg',
  emoji: '🇶🇦',
  region: RegionName.afc,
  points: 0,
  gDiff: 0,
  gFor: 0,
  gOpp: 0,
  tier: 'j',
  nationTier: 'e',
  startingRating: {
    att: 0,
    mid: 0,
    def: 0,
    pen: 0,
  },
  dynamicRating: {
    att: 0,
    mid: 0,
    def: 0,
    pen: 0,
  },
  isBuffed: {
    att: false,
    mid: false,
    def: false,
    pen: false,
  },
  isDebuffed: {
    att: false,
    mid: false,
    def: false,
    pen: false,
  },
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
  cohosts48: [],
};

export const defaultHosts48: GroupTeam[] = [
  {
    name: 'Mexico',
    abbreviation: 'mex',
    logo: 'https://fmdataba.com/images/n/MEX.svg',
    emoji: '🇲🇽',
    region: RegionName.concacaf,
    points: 0,
    gDiff: 0,
    gFor: 0,
    gOpp: 0,
    tier: 'b',
    nationTier: 'b',
    startingRating: {
      att: 0,
      mid: 0,
      def: 0,
      pen: 0,
    },
    dynamicRating: {
      att: 0,
      mid: 0,
      def: 0,
      pen: 0,
    },
    isBuffed: {
      att: false,
      mid: false,
      def: false,
      pen: false,
    },
    isDebuffed: {
      att: false,
      mid: false,
      def: false,
      pen: false,
    },
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
    cohosts32: ['United States'],
    cohosts48: ['United States', 'Canada'],
  },
  {
    name: 'United States',
    abbreviation: 'usa',
    logo: 'https://fmdataba.com/images/n/USA.svg',
    emoji: '🇺🇸',
    region: RegionName.concacaf,
    points: 0,
    gDiff: 0,
    gFor: 0,
    gOpp: 0,
    tier: 'b',
    nationTier: 'b',
    startingRating: {
      att: 0,
      mid: 0,
      def: 0,
      pen: 0,
    },
    dynamicRating: {
      att: 0,
      mid: 0,
      def: 0,
      pen: 0,
    },
    isBuffed: {
      att: false,
      mid: false,
      def: false,
      pen: false,
    },
    isDebuffed: {
      att: false,
      mid: false,
      def: false,
      pen: false,
    },
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
    cohosts32: ['Canada', 'Mexico'],
    cohosts48: ['Canada', 'Mexico'],
  },
  {
    name: 'Canada',
    abbreviation: 'can',
    logo: 'https://fmdataba.com/images/n/CAN.svg',
    emoji: '🇨🇦',
    region: RegionName.concacaf,
    points: 0,
    gDiff: 0,
    gFor: 0,
    gOpp: 0,
    tier: 'd',
    nationTier: 'd',
    startingRating: {
      att: 0,
      mid: 0,
      def: 0,
      pen: 0,
    },
    dynamicRating: {
      att: 0,
      mid: 0,
      def: 0,
      pen: 0,
    },
    isBuffed: {
      att: false,
      mid: false,
      def: false,
      pen: false,
    },
    isDebuffed: {
      att: false,
      mid: false,
      def: false,
      pen: false,
    },
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
    cohosts32: ['United States'],
    cohosts48: ['Mexico', 'United States'],
  },
];
