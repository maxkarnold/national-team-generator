import { Champion } from '../champion/champion.model';

export interface DraftChampion extends Champion {
  isPlaceholder?: boolean;
  metaStrength: number;
  playerMastery: number;
  opponentMastery: number;
  currentSynergy: number;
  currentCounter: number;
  currentScore: number;
}

export interface PatchChampions {
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
