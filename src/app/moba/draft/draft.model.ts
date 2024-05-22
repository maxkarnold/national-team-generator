import { Champion } from '../champion/champion.model';
import { Player } from '../player/player.model';

export interface DraftChampion extends Champion {
  isPlaceholder?: boolean;
  metaStrength: [number, number, number, number, number];
  playerMastery: number;
  opponentMastery: number;
  currentSynergy: number;
  currentCounter: number;
  currentScore: number;
}

export interface DraftPlayer extends Player {
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

export type LetterRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A';
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

export const redSidePicks = [8, 9, 12, 17, 20];
export const blueSidePicks = [7, 10, 11, 18, 19];
export const redSideBans = [2, 4, 6, 13, 15];
export const blueSideBans = [1, 3, 5, 14, 16];

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

export const defaultPlayerMasteries: Partial<DraftPlayer>[] = [
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
export const defaultOpponentMasteries: Partial<DraftPlayer>[] = [
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
