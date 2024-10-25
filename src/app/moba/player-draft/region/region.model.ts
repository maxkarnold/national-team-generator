export interface MobaRegion {
  regionAbbrev: RegionAbbrev;
  leagueName: LeagueName;
}

export type RegionAbbrev = 'NA' | 'EU' | 'CN' | 'KR' | 'BR' | 'APAC' | 'LATAM';
export type LeagueName = 'LCS' | 'LEC' | 'LPL' | 'LCK' | 'VCS' | 'CBLOL' | 'PCS' | 'LLA';

export const regions: MobaRegion[] = [
  {
    regionAbbrev: 'KR',
    leagueName: 'LCK',
  },
  {
    regionAbbrev: 'CN',
    leagueName: 'LPL',
  },
  {
    regionAbbrev: 'EU',
    leagueName: 'LEC',
  },
  {
    regionAbbrev: 'NA',
    leagueName: 'LCS',
  },
  {
    regionAbbrev: 'APAC',
    leagueName: 'PCS',
  },
  {
    regionAbbrev: 'APAC',
    leagueName: 'VCS',
  },
  {
    regionAbbrev: 'BR',
    leagueName: 'CBLOL',
  },
  {
    regionAbbrev: 'LATAM',
    leagueName: 'LLA',
  },
];
