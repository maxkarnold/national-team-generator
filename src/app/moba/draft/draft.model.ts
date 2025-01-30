import { Champion } from '../champion/champion.model';
import { Role } from '../player-draft/player/player.model';
import { patchMSI24 } from './patch-lists/msi-24';
import { patchSummer24 } from './patch-lists/summer-24';
import { patchSummer24v2 } from './patch-lists/summer-24-v2';
import { patchWorlds24 } from './patch-lists/worlds-24';

export interface DraftMetaData {
  userIsRedSide: boolean;
  patchData: PatchData;
  useAiOpponent: boolean;
  difficulty: DifficultyLevel;
  useRandomTeam: boolean;
}

export interface DraftChampion extends Champion {
  metaStrength: [number, number, number, number, number];
  playerMastery: [number, number, number, number, number];
  opponentMastery: [number, number, number, number, number];
  currentSynergy: {
    player: {
      team: number;
      individual: number;
    };
    opp: {
      team: number;
      individual: number;
    };
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
    player: ChampionAdvice;
    opp: ChampionAdvice;
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
  disengage: number;
  poke: number;
  split: number;
}

export interface CompStyleData {
  name: CompStyle;
  primary: string[];
  secondary: string[];
}

export interface PatchData {
  name: PatchName;
  version: PatchVersion;
  description: string;
  excludedChamps: number[];
  patchTierList: AllRolesTierList;
  disabled: boolean;
  // counters?: AllRolesTierList;
  // synergies?: AllRolesTierList;
}

export interface ChampionAdvice {
  top: DraftAdviceTag[];
  jungle: DraftAdviceTag[];
  mid: DraftAdviceTag[];
  adc: DraftAdviceTag[];
  support: DraftAdviceTag[];
}

export type CompStyle = 'engage' | 'pick' | 'disengage' | 'poke' | 'split';
export type PatchName = 'MSI 2024' | 'Summer 2024' | 'Summer 14.14 2024' | 'Worlds 2024';
export type PatchVersion = 14.8 | 14.13 | 14.14 | 14.18;
export type DraftSortHeader = 'name' | 'mastery' | 'meta' | 'synergy' | 'counter';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type DraftAdviceTag = 'Counters Banned' | 'Recommended' | 'Counter Pick' | 'Not Recommended' | 'High Synergy';

export type LetterRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A' | 'S+' | 'S-' | 'A+' | 'A-' | 'B+' | 'B-' | 'C+' | 'C-' | 'D+' | 'D-';
export type Proficiency = '+' | '-' | '++' | '--' | '+-';
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

export function hasAllPropsDraftMetaData(obj: object): obj is DraftMetaData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  return 'userIsRedSide' in obj && 'patchData' in obj && 'useAiOpponent' in obj && 'difficulty' in obj && 'useRandomTeam' in obj;
}

export enum TierValue {
  S = 20,
  A = 16,
  B = 12,
  C = 8,
  D = 4,
  F = 0,
}

export const tierValues: { [key: string]: TierValue } = {
  s: TierValue.S,
  a: TierValue.A,
  b: TierValue.B,
  c: TierValue.C,
  d: TierValue.D,
  f: TierValue.F,
};

export const patches: PatchData[] = [patchWorlds24, patchMSI24, patchSummer24, patchSummer24v2];
export const latestPatch: PatchData = patchWorlds24;

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
    name: 'disengage',
    primary: ['dmg.dps', 'support.peel', 'support.utility', 'support.zoneControl'],
    secondary: ['dmg.singleTarget', 'dmg.aoe', 'defense.sustain', 'defense.mitigation'],
  },
  {
    name: 'poke',
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

export const defaultPlayers = {
  top: [],
  jungle: [],
  mid: [],
  adc: [],
  support: [],
};

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
