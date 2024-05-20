import { Champion } from '../champion/champion.model';
import { Player } from '../player/player.model';

export interface DraftChampion extends Champion {
  isPlaceholder?: boolean;
  metaStrength: number;
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

export type LetterRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'N/A';

export const redSidePicks = [8, 9, 12, 17, 20];
export const blueSidePicks = [7, 10, 11, 18, 19];
export const redSideBans = [2, 4, 6, 13, 15];
export const blueSideBans = [1, 3, 5, 14, 16];

export const draftHeaders = [
  {
    name: 'Champion',
    tooltip: '',
  },
  {
    name: 'Strength',
    tooltip: '',
  },
  {
    name: 'Synergy',
    tooltip: '',
  },
  {
    name: 'Counter',
    tooltip: '',
  },
  {
    name: 'Score',
    tooltip: '',
  },
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
export const defaultOpponentMasteries: Partial<DraftPlayer>[] = [];
