import { Match, RegionName } from 'app/pages/simulation/simulation.model';
import { Person } from './player.model';
import { getRandFloat } from '@shared/utils';

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
  currentBuffs: {
    att: Buff[];
    mid: Buff[];
    def: Buff[];
    pen: Buff[];
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

export interface Buff {
  numOfGames: number;
  value: number;
}

export function isNation(value: any): value is Nation {
  return (<Nation>value).abbreviation !== undefined;
}

export const baseTeam = (hostNations: GroupTeam[], nation: Nation): GroupTeam => {
  // random nation values
  let min = 0;
  let max = 0;

  switch (nation.nationTier) {
    case 's':
      min = 80;
      max = 100;
      break;
    case 'a':
      min = 70;
      max = 95;
      break;
    case 'b':
      min = 65;
      max = 88;
      break;
    case 'c':
      min = 60;
      max = 88;
      break;
    case 'd':
      min = 55;
      max = 80;
      break;
    case 'e':
      min = 40;
      max = 78;
      break;
    case 'f':
      min = 30;
      max = 70;
      break;
    case 'g':
      min = 25;
      max = 55;
      break;
    default:
      min = 25;
      max = 55;
      break;
  }
  const attRating = getRandFloat(min, max);
  const midRating = getRandFloat(min, max);
  const defRating = getRandFloat(min, max);
  const penRating = getRandFloat(min, max);
  return {
    ...nation,
    gDiff: 0,
    gFor: 0,
    gOpp: 0,
    points: 0,
    matchesPlayed: 0,
    tier: nation.nationTier,
    startingRating: {
      att: attRating,
      mid: midRating,
      def: defRating,
      pen: penRating,
    },
    dynamicRating: {
      att: attRating,
      mid: midRating,
      def: defRating,
      pen: penRating,
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
    currentBuffs: {
      att: [],
      mid: [],
      def: [],
      pen: [],
    },
    rating: (attRating + midRating + defRating) / 3,
    ranking: 0,
    attRanking: 0,
    midRanking: 0,
    defRanking: 0,
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
    homeTeam: hostNations.map(t => t.name).includes(nation.name) ? true : false,
    region: nation.region as RegionName,
  };
};

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
  currentBuffs: {
    att: [],
    mid: [],
    def: [],
    pen: [],
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
    currentBuffs: {
      att: [],
      mid: [],
      def: [],
      pen: [],
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
    currentBuffs: {
      att: [],
      mid: [],
      def: [],
      pen: [],
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
    currentBuffs: {
      att: [],
      mid: [],
      def: [],
      pen: [],
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
