import { Champion } from '../champion/champion.model';
import { Role } from '../player/player.model';

export interface DraftChampion extends Champion {
  metaStrength: [number, number, number, number, number];
  playerMastery: [number, number, number, number, number];
  opponentMastery: [number, number, number, number, number];
  currentSynergy: number;
  currentCounter: number;
  currentScore: number;
  selectedRole: Role;
  isPlaceholder: boolean;
}

export interface DraftPlayer {
  mainRole: Role;
  championMastery: RankedChampions;
}

export interface RankedChampions {
  s: number[];
  a: number[];
  b: number[];
  c: number[];
  d: number[];
}

export interface PatchStrength {
  top: RankedChampions;
  jungle: RankedChampions;
  mid: RankedChampions;
  adc: RankedChampions;
  support: RankedChampions;
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

export type CompStyle = 'engage' | 'pick' | 'protect' | 'siege' | 'split';
export type PatchVersion = 'MSI 24';

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

export const redSidePickRounds = [8, 9, 12, 17, 20];
export const blueSidePickRounds = [7, 10, 11, 18, 19];
export const redSideBanRounds = [2, 4, 6, 13, 15];
export const blueSideBanRounds = [1, 3, 5, 14, 16];

export const draftHeaders = [
  {
    name: 'Champion / Roles',
    tooltip: '',
  },
  {
    name: 'Score',
    tooltip: '',
  },
  {
    name: 'Meta',
    tooltip: '',
  },
  {
    name: 'Mastery',
    tooltip: '',
  },
  // {
  //   name: 'Synergy',
  //   tooltip: '',
  // },
  // {
  //   name: 'Counter',
  //   tooltip: '',
  // },
];

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
// S Tier: champs commonly banned in first phase, probably a 75%+ presence in games, strong first pick
// A Tier: champs commonly banned in second phase, typically a stable champ, can be a champ that has emerged as a strong counter to s/a tier picks or has good synergy with meta picks
// B Tier: champ is not strong, but still able to be picked. Can only be played by masters of the champ in a good counter situation
// C Tier: champs hardly picked, chosen by players with high mastery but with a small champ pool or as a last resort
// D Tier: do not pick these champs, are so weak that will be easily countered or not counter meta champs
export const patchMSI24: PatchStrength = {
  top: {
    s: [1],
    a: [2, 5, 44, 45, 46, 47, 8, 54],
    b: [7, 4, 6, 62, 79, 80],
    c: [0, 3, 58, 60, 70, 74, 81],
    d: [17, 76, 89],
  },
  jungle: {
    s: [9],
    a: [10, 43, 11, 14, 42, 48, 8],
    b: [0, 4, 49, 55, 56, 64, 68],
    c: [13, 61, 67, 72, 73, 75, 82, 83],
    d: [18, 12, 44, 2, 58, 84, 85],
  },
  mid: {
    s: [16, 18],
    a: [15, 19, 21, 50, 51, 52],
    b: [2, 20, 22, 60, 86],
    c: [17, 28, 44, 59, 71, 76, 77, 87, 88],
    d: [62, 78, 89, 90, 91, 92, 93],
  },
  adc: {
    s: [24, 26],
    a: [23, 27, 32],
    b: [25, 29, 30, 31, 34],
    c: [21, 28, 33, 35, 69, 94, 95],
    d: [54, 96, 97, 98, 99, 62, 100],
  },
  support: {
    s: [25, 36],
    a: [38],
    b: [37, 8, 12, 20, 11, 41, 53, 46, 40, 39, 24, 57, 63, 65],
    c: [17, 66, 71, 101, 102, 103],
    d: [19, 26, 104, 105, 43, 106],
  },
};
