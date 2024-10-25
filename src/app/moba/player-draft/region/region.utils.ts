import { getRandFloat, getRandomInt, shuffle } from '@shared/utils';
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
    case 'PCS':
      return getRandFloat(0.7, 1.15);
    case 'VCS':
      return getRandFloat(1, 1.4);
    case 'CBLOL':
      return getRandFloat(1.05, 1.7);
    case 'LLA':
      return getRandFloat(1.1, 1.9);
    default:
      return 1;
  }
}

export function getNameNationality(region: MobaRegion): string {
  // not an exact science, can be improved in the future
  switch (region.leagueName) {
    case 'LCS':
      if (getRandomInt(1, 10) < 5) {
        return 'usa';
      } else if (getRandomInt(1, 10) < 5) {
        return 'kor';
      } else if (getRandomInt(1, 10) < 3) {
        return shuffle(['can', 'aus'])[0];
      } else {
        return shuffle(['usa', 'kor', 'can', 'aus', 'bel', 'den', 'pol'])[0];
      }
    case 'LEC':
      if (getRandomInt(1, 10) < 4) {
        return shuffle(['fra', 'esp'])[0];
      } else if (getRandomInt(1, 10) < 5) {
        return shuffle(['pol', 'cze', 'den', 'ger', 'swe', 'kor'])[0];
      } else {
        return shuffle(['bel', 'gre', 'bul', 'chn', 'ned', 'rou', 'svn'])[0];
      }
    case 'LPL':
      if (getRandomInt(1, 10) < 9) {
        return 'chn';
      } else if (getRandomInt(1, 10) < 2) {
        return 'kor';
      } else {
        return shuffle(['tpe', 'hkg', 'sin'])[0];
      }
    case 'PCS':
      if (getRandomInt(1, 10) < 6) {
        return 'tpe';
      } else if (getRandomInt(1, 10) < 4) {
        return shuffle(['kor', 'aus', 'jpn'])[0];
      } else if (getRandomInt(1, 20) < 2) {
        return 'hkg';
      } else {
        return 'tpe';
      }
    case 'VCS':
      return 'vie';
    case 'CBLOL':
      if (getRandomInt(1, 10) < 9) {
        return 'bra';
      } else if (getRandomInt(1, 10) < 3) {
        return 'kor';
      } else {
        return shuffle(['bra', 'kor', 'fra', 'swe'])[0];
      }
    case 'LLA':
      if (getRandomInt(1, 10) < 5) {
        return 'arg';
      } else if (getRandomInt(1, 10) < 3) {
        return shuffle(['kor', 'mex', 'chi'])[0];
      } else {
        return shuffle(['per', 'bra', 'col', 'crc', 'uru'])[0];
      }
    // KOREAN IS DEFAULT NATIONALITY, this is for LCK as well
    default:
      return 'kor';
  }
}
