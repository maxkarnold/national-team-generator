export interface MobaRegion {
  regionAbbrev: RegionAbbrev;
  leagueName: 'LCS' | 'LEC' | 'LPL' | 'LCK';
}

export type RegionAbbrev = 'NA' | 'EU' | 'CHN' | 'KR';

export const regions: MobaRegion[] = [
  {
    regionAbbrev: 'NA',
    leagueName: 'LCS',
  },
  {
    regionAbbrev: 'EU',
    leagueName: 'LEC',
  },
  {
    regionAbbrev: 'CHN',
    leagueName: 'LPL',
  },
  {
    regionAbbrev: 'KR',
    leagueName: 'LCK',
  },
];
