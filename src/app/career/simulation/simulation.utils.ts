import { getRandFloat, probability } from '@shared/utils';
import { LeagueDifficulty } from '../club/club.model';

/**
 * A computation based on probability and the # of seasons a player has been at their current club. This function is used to help calculate the # of goals and assists.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @param {number} seasons - The number of seasons
 * @returns {number} Returns a number that helps calculate G/A statistics.
 */
export function calcGoalsOrAssists(a: number, b: number, seasons: number): number {
  let i = a;
  let j = b;

  if (seasons > 4) {
    i += 0.2;
    j += 0.2;
  } else if (seasons > 2.25) {
    i += 0.15;
    j += 0.15;
  } else if (seasons > 1.5) {
    i += 0.1;
    j += 0.1;
  } else if (seasons > 0.4) {
    i += 0.05;
    j += 0.05;
  }

  if (probability(getRandFloat(i / 15, j / 15))) {
    return 3;
  } else if (probability(getRandFloat(i / 6, j / 6))) {
    return 2;
  } else if (probability(getRandFloat(i * 0.8, j * 0.8))) {
    return 1;
  } else {
    return 0;
  }
}

export function getSkewedGoals(diff: LeagueDifficulty, apps: number) {
  switch (diff) {
    case 'easy':
      return calcGoalsOrAssists(0.8, 1.2, apps);
    case 'mediumEasy':
      return calcGoalsOrAssists(0.4, 0.7, apps);
    case 'medium':
      return calcGoalsOrAssists(0.25, 0.5, apps);
    case 'mediumHard':
      return calcGoalsOrAssists(0.08, 0.25, apps);
    case 'hard':
      return calcGoalsOrAssists(0.05, 0.2, apps);
    default:
      return 0;
  }
}

export function getSkewedAssists(diff: LeagueDifficulty, apps: number) {
  switch (diff) {
    case 'easy':
      return calcGoalsOrAssists(0.35, 0.7, apps);
    case 'mediumEasy':
      return calcGoalsOrAssists(0.1, 0.3, apps);
    case 'medium':
      return calcGoalsOrAssists(0.05, 0.25, apps);
    case 'mediumHard':
      return calcGoalsOrAssists(0.05, 0.25, apps);
    case 'hard':
      return calcGoalsOrAssists(0.025, 0.15, apps);
    default:
      return 0;
  }
}
