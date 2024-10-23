import { getRandFloat, probability } from '@shared/utils';
import { LeagueDifficulty, TransferOption } from '../club/club.model';
import { AppearanceStats, CareerOverview, Season, SeasonStats, defaultCompStats } from '../player/player.model';
import { round, mean, sum } from 'lodash-es';
import { calcLeagueDifficulty } from '../career.utils';

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

export function simulateApps(
  appearances: {
    allComps: AppearanceStats;
    league: AppearanceStats;
    cup: AppearanceStats;
    continental: AppearanceStats;
  },
  transfer: TransferOption,
  season: Season,
  career: CareerOverview
): { leagueDifficulty: LeagueDifficulty; stats: SeasonStats } {
  // easyLeague 1.0 g/mp 0.5 a/mp
  // mediumEasyLeague 0.5 g/mp 0.2 a/mp
  // mediumLeague 0.35 g/mp 0.15 a/mp
  // mediumHardLeague 0.18 g/mp 0.15 a/mp
  // hardLeague 0.15 g/mp 0.1 a/mp

  const leagueDiff = calcLeagueDifficulty(transfer.club.clubRating, transfer.club.leagueDifficulty, season.currentAbility);
  const currentClubApps = career.clubStats.find(c => c.id === transfer.club.id)?.currentClubStreak || 0;

  console.log('leagueDiff', leagueDiff);

  const seasonRatings = [];
  const seasonGoals = [];
  const seasonAssists = [];
  const seasonAggRating = [];

  // ITERATES OVER APPS to calculate stats per game for an entire season
  for (let i = 0; i < appearances.allComps.appearances.total; i++) {
    const goals = getSkewedGoals(leagueDiff, currentClubApps);
    const assists = getSkewedAssists(leagueDiff, currentClubApps);
    seasonGoals.push(goals);
    seasonAssists.push(assists);
    const gameRating = (goals + assists) * 1.25 + 6.2 > 10.0 ? 10.0 : (goals + assists) * 1.25 + 6.2;
    seasonRatings.push(gameRating);
    seasonAggRating.push(gameRating);
    // console.log('GA' + (i + 1), goals, assists);
  }

  const seasonStats: SeasonStats = {
    allComps: {
      appearances: {
        total: appearances.allComps.appearances.total,
        sub: appearances.allComps.appearances.sub,
        starts: appearances.allComps.appearances.starts,
      },
      goals: sum(seasonGoals),
      assists: sum(seasonAssists),
      aggRating: sum(seasonAggRating),
      avgRating: appearances.allComps.appearances.total > 0 ? round(mean(seasonRatings), 1) : 0,
    },
    league: { ...defaultCompStats },
    cup: { ...defaultCompStats },
    continental: { ...defaultCompStats },
  };
  console.log(seasonStats, appearances);
  return {
    leagueDifficulty: leagueDiff,
    stats: seasonStats,
  };
}
