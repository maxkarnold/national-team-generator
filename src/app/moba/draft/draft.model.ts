import { Champion } from '../champion/champion.model';
import { Role } from '../player/player.model';

export interface DraftChampion extends Champion {
  metaStrength: [number, number, number, number, number];
  playerMastery: [number, number, number, number, number];
  opponentMastery: [number, number, number, number, number];
  currentSynergy: {
    player?: number;
    opp?: number;
  };
  currentCounter: {
    player: {
      top: number;
      jungle: number;
      mid: number;
      adc: number;
      support: number;
    };
    opp: {
      top: number;
      jungle: number;
      mid: number;
      adc: number;
      support: number;
    };
  };
  currentScore: {
    player?: number;
    opp?: number;
  };
  selectedRole: Role;
  isPlaceholder: boolean;
  adviceTags: {
    player: {
      top: DraftAdviceTag[];
      jungle: DraftAdviceTag[];
      mid: DraftAdviceTag[];
      adc: DraftAdviceTag[];
      support: DraftAdviceTag[];
    };
    opp: {
      top: DraftAdviceTag[];
      jungle: DraftAdviceTag[];
      mid: DraftAdviceTag[];
      adc: DraftAdviceTag[];
      support: DraftAdviceTag[];
    };
  };
}

export interface DraftPlayer {
  mainRole: Role;
  championMastery: TierListRankings;
}

export interface TierListRankings {
  s: number[];
  a: number[];
  b: number[];
  c: number[];
  d: number[];
}

export interface AllRolesTierList {
  top: TierListRankings;
  jungle: TierListRankings;
  mid: TierListRankings;
  adc: TierListRankings;
  support: TierListRankings;
}

export interface CompStyleStats {
  engage: number;
  pick: number;
  protect: number;
  siege: number;
  split: number;
}

export interface CompStyleData {
  name: CompStyle;
  primary: string[];
  secondary: string[];
}

export interface DraftFormData {
  userIsRedSide: boolean;
  patchVersion: PatchVersion;
  useAiOpponent: boolean;
  difficulty: DraftDifficulty;
  useRandomTeam: boolean;
}

export interface PatchData {
  name: PatchName;
  version: PatchVersion;
  excludedChamps: number[];
  patchTierList: AllRolesTierList;
  // counters?: AllRolesTierList;
  // synergies?: AllRolesTierList;
}

export type CompStyle = 'engage' | 'pick' | 'protect' | 'siege' | 'split';
export type PatchName = 'MSI 24';
export type PatchVersion = 14.8;
export type DraftSortHeader = 'name' | 'mastery' | 'meta' | 'synergy' | 'counter';
export type DraftDifficulty = 'easy' | 'medium' | 'hard';
export type DraftAdviceTag = 'Counters Banned' | 'Recommended' | 'Counter Pick';

export type LetterRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A' | 'S+' | 'S-' | 'A+' | 'A-' | 'B+' | 'B-' | 'C+' | 'C-' | 'D+' | 'D-';
export type DraftPhase =
  | 'Blue Ban 1'
  | 'Blue Ban 2'
  | 'Blue Ban 3'
  | 'Blue Ban 4'
  | 'Blue Ban 5'
  | 'Blue Pick 1'
  | 'Blue Pick 2'
  | 'Blue Pick 3'
  | 'Blue Pick 4'
  | 'Blue Pick 5'
  | 'Red Ban 1'
  | 'Red Ban 2'
  | 'Red Ban 3'
  | 'Red Ban 4'
  | 'Red Ban 5'
  | 'Red Pick 1'
  | 'Red Pick 2'
  | 'Red Pick 3'
  | 'Red Pick 4'
  | 'Red Pick 5'
  | 'Draft Complete';

export function getRoleFromFilter(role: Role | 'all' | undefined): Role | undefined {
  return role === 'all' ? undefined : role;
}

export const tierValues: { [key: string]: number } = { s: 20, a: 16, b: 12, c: 8, d: 4 };

export const redSidePickRounds = [8, 9, 12, 17, 20];
export const blueSidePickRounds = [7, 10, 11, 18, 19];
export const redSideBanRounds = [2, 4, 6, 13, 15];
export const blueSideBanRounds = [1, 3, 5, 14, 16];

export const emptyDraftBans: Partial<DraftChampion>[] = [
  {
    isPlaceholder: true,
    name: '1',
  },
  {
    isPlaceholder: true,
    name: '2',
  },
  {
    isPlaceholder: true,
    name: '3',
  },
  {
    isPlaceholder: true,
    name: '4',
  },
  {
    isPlaceholder: true,
    name: '5',
  },
];

export const compStyleReqs: CompStyleData[] = [
  {
    name: 'engage',
    primary: ['mobility.engage', 'dmg.aoe', 'crowdControl.impact', 'crowdControl.aoe'],
    secondary: ['dmg.burst', 'crowdControl.singleTarget', 'defense.mitigation', 'defense.sustain'],
  },
  {
    name: 'pick',
    primary: ['dmg.burst', 'dmg.singleTarget', 'crowdControl.singleTarget', 'dmg.skirmish'],
    secondary: ['crowdControl.range', 'mobility.engage', 'mobility.reposition', 'crowdControl.impact'],
  },
  {
    name: 'protect',
    primary: ['dmg.dps', 'support.peel', 'support.utility', 'support.zoneControl'],
    secondary: ['dmg.singleTarget', 'dmg.aoe', 'defense.sustain', 'defense.mitigation'],
  },
  {
    name: 'siege',
    primary: ['dmg.poke', 'dmg.siege', 'support.zoneControl', 'support.peel'],
    secondary: ['dmg.waveClear', 'support.utility', 'dmg.dps', 'dmg.aoe'],
  },
  {
    name: 'split',
    primary: ['dmg.splitPush', 'dmg.skirmish', 'dmg.waveClear', 'support.peel'],
    secondary: ['support.zoneControl', 'mobility.reposition', 'dmg.siege', 'dmg.singleTarget'],
  },
];

export const emptyDraftPicks: Partial<DraftChampion>[] = [
  {
    isPlaceholder: true,
    name: 'Top',
  },
  {
    isPlaceholder: true,
    name: 'Jungle',
  },
  {
    isPlaceholder: true,
    name: 'Mid',
  },
  {
    isPlaceholder: true,
    name: 'ADC',
  },
  {
    isPlaceholder: true,
    name: 'Support',
  },
];

export const defaultPlayerMasteries: DraftPlayer[] = [
  {
    mainRole: 'top',
    championMastery: {
      s: [47, 44],
      a: [45, 46, 0],
      b: [1, 2],
      c: [],
      d: [],
    },
  },
  {
    mainRole: 'jungle',
    championMastery: {
      s: [2, 8],
      a: [9, 10],
      b: [11, 12],
      c: [13],
      d: [],
    },
  },
  {
    mainRole: 'mid',
    championMastery: {
      s: [18, 17],
      a: [20, 19],
      b: [21, 22],
      c: [28],
      d: [],
    },
  },
  {
    mainRole: 'adc',
    championMastery: {
      s: [29, 30, 31],
      a: [32],
      b: [33, 34],
      c: [],
      d: [],
    },
  },
  {
    mainRole: 'support',
    championMastery: {
      s: [36, 37],
      a: [38, 39],
      b: [40, 41],
      c: [53],
      d: [],
    },
  },
];
export const defaultOpponentMasteries: DraftPlayer[] = [
  {
    mainRole: 'top',
    championMastery: {
      s: [1, 2],
      a: [45, 46, 0],
      b: [47, 44],
      c: [],
      d: [],
    },
  },
  {
    mainRole: 'jungle',
    championMastery: {
      s: [9, 10],
      a: [11],
      b: [12],
      c: [13, 2, 8],
      d: [],
    },
  },
  {
    mainRole: 'mid',
    championMastery: {
      s: [21, 22],
      a: [20, 19],
      b: [18, 17],
      c: [],
      d: [],
    },
  },
  {
    mainRole: 'adc',
    championMastery: {
      s: [33, 34, 35],
      a: [32],
      b: [29, 30, 31],
      c: [],
      d: [],
    },
  },
  {
    mainRole: 'support',
    championMastery: {
      s: [53],
      a: [39, 40],
      b: [40, 38],
      c: [36, 37],
      d: [],
    },
  },
];

// JUDGING META STRENGTH
// Z/S+ Tier: champs that are so strong they deserve their own tier, not every role will have champs in this tier
// S Tier: champs commonly banned in first phase, probably a 75%+ presence in games, strong first pick
// best of the best champs, almost 100% presence in games, very bannable, flexible, not many weak matchups
// A Tier: champs commonly banned in second phase, typically a stable champ, can be a champ that has emerged as a strong counter to s/a tier picks or has good synergy with meta picks
// strong champs that are also bannable, can be counters, but also have counters of their own. They shouldn't be easily counterable and have presence in nearly 100% of games
// B Tier: these champs are playable, can be good siutational picks and could be just in this tier because they can counter a top meta pick
// C Tier: champs that are very situational, will have obvious weakpoints, not usually banned but could be in certain situations.
// Easily countered so usually picked late in draft or with counters already banned, typical spot for a lot of off-role champs
// D Tier: champs that can technically play the role, but are either too easily countered or just too weak in their current state to be playable.
// Champs that are never played but could be picked in the perfect scenario.

// Patch 14.8
export const patchMSI24: AllRolesTierList = {
  top: {
    s: [1, 133, 5],
    a: [2, 4, 44, 45, 8],
    b: [3, 122, 79, 80, 76, 127, 129, 46, 0, 7, 70, 6, 47, 54, 56, 62],
    c: [22, 74, 124, 89, 17, 126, 128, 58, 132, 81, 43, 28, 136, 60],
    d: [120, 123, 114, 115, 23],
  },
  jungle: {
    s: [9, 133],
    a: [10, 8, 11, 43],
    b: [48, 42, 14, 0, 55, 64, 56, 68, 4, 49, 61, 72, 83, 67, 13],
    c: [82, 73, 75, 18, 6, 131, 74, 2, 130, 44, 84, 85, 58],
    d: [12],
  },
  mid: {
    s: [16, 18],
    a: [15, 19, 21, 50, 51, 52],
    b: [20, 22, 86, 60, 77, 76, 17, 5, 90],
    c: [87, 88, 71, 59, 93, 118, 73, 78, 74, 66, 119, 125, 121, 135, 92, 91, 137, 89, 70, 81, 27, 28, 34],
    d: [134, 44],
  },
  adc: {
    s: [24, 26, 23],
    a: [27],
    b: [31, 32, 33, 94, 35, 34, 28, 30, 29],
    c: [25, 96, 19, 69, 111, 97, 95, 98, 99, 21, 5, 100, 54, 62, 59],
    d: [],
  },
  support: {
    s: [25, 36],
    a: [38, 37],
    b: [40, 101, 65, 63, 45, 17, 102, 57, 11, 39, 41, 20, 46, 12, 26, 53],
    c: [66, 104, 19, 105, 24, 107, 8, 106, 2, 43, 98, 110, 116, 117, 103, 112, 108],
    d: [109, 113, 71],
  },
};
