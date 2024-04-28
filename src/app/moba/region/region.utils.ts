import { getRandFloat } from '@shared/utils';
import { MobaRegion } from './region.model';

export function getRegionSkew(region: MobaRegion): number {
  switch (region.leagueName) {
    case 'LCK':
      return getRandFloat(0.35, 0.6);
    case 'LPL':
      return getRandFloat(0.35, 0.65);
    case 'LEC':
      return getRandFloat(0.6, 0.8);
    case 'LCS':
      return getRandFloat(0.7, 0.95);
    default:
      return 1;
  }
}
