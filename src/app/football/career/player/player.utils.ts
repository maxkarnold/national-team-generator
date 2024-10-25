import { getRandomInt } from '@shared/utils';
import { TransferOption, LeagueDifficulty } from '../club/club.model';
import { Season, CareerOverview, SeasonStats, AppearanceStats } from './player.model';
import { get } from 'lodash-es';

const checkCurrentAbility = (ability: number) => {
  if (ability < 10) {
    return 10;
  } else if (ability > 200) {
    return 200;
  } else {
    return ability;
  }
};

const youthFactor = ({ age, potentialAbility, currentAbility }: Season): number => {
  const potDiff = potentialAbility - currentAbility;
  if (age < 18) {
    return potDiff / 10 - 4;
  } else if (age < 24) {
    return potDiff / 20;
  } else if (age < 32) {
    return potDiff / 30;
  } else {
    return -potDiff / 10;
  }
};

const challengeFactor = (leagueDifficulty: LeagueDifficulty): number => {
  switch (leagueDifficulty) {
    case 'hard':
      return 2;
    case 'mediumHard':
      return 1;
    case 'medium':
      return -1;
    case 'mediumEasy':
      return -3;
    case 'easy':
      return -5;
    default:
      return 0;
  }
};

const consistencyFactor = (ca: CareerOverview, transfer: TransferOption) => {
  const currentClubApps = ca.clubStats.find(c => c.id === transfer.club.id)?.currentClubStreak || 0;

  if (currentClubApps > 4) {
    return 3;
  } else if (currentClubApps > 2.25) {
    return 2;
  } else if (currentClubApps > 1.5) {
    return 1;
  } else if (currentClubApps > 0.4) {
    return 0;
  } else {
    return -1;
  }
};

const performanceFactor = (app: number, gamesInSeason: number, avgRating: number): number => {
  // more games in a season provides a high floor to the ability gain while
  // higher rating provides a higher ceiling of ability gain
  if (app / gamesInSeason > 0.8) {
    if (avgRating > 7.5) {
      return getRandomInt(6, 10);
    } else if (avgRating > 7.0) {
      return getRandomInt(6, 8);
    } else if (avgRating > 6.5) {
      return getRandomInt(5, 6);
    } else {
      return getRandomInt(4, 5);
    }
  } else if (app / gamesInSeason > 0.4) {
    if (avgRating > 7.5) {
      return getRandomInt(3, 9);
    } else if (avgRating > 7.0) {
      return getRandomInt(3, 7);
    } else if (avgRating > 6.5) {
      return getRandomInt(3, 5);
    } else {
      return getRandomInt(2, 4);
    }
  } else if (app / gamesInSeason > 0.2) {
    if (avgRating > 7.5) {
      return getRandomInt(1, 6);
    } else if (avgRating > 7.0) {
      return getRandomInt(1, 5);
    } else if (avgRating > 6.5) {
      return getRandomInt(0, 4);
    } else {
      return getRandomInt(0, 3);
    }
  } else {
    return getRandomInt(-8, 0);
  }
};

export function adjustCurrentAbility(
  season: Season,
  stats: SeasonStats,
  transfer: TransferOption,
  career: CareerOverview,
  leagueDiff: LeagueDifficulty
): number {
  if (season.age > 34) {
    return season.currentAbility - 20;
  } else if (season.age > 31) {
    return season.currentAbility - 15;
  } else if (season.age > 29) {
    return season.currentAbility;
  }

  const totalGames = transfer.club.gamesInSeason;

  const performance = performanceFactor(stats.allComps.appearances.total, totalGames, stats.allComps.avgRating);

  const currentAbility =
    consistencyFactor(career, transfer) + performance + challengeFactor(leagueDiff) + youthFactor(season) + season.currentAbility;

  return checkCurrentAbility(currentAbility);
}

export function getAppsForSeason(club: TransferOption): {
  allComps: AppearanceStats;
  league: AppearanceStats;
  cup: AppearanceStats;
  continental: AppearanceStats;
} {
  // TODO: add appearances for other competitions
  const gamesInSeason = club.club.gamesInSeason;
  let appearances = 0;

  switch (club.playingTime) {
    case 'breakthrough prospect':
    case 'fringe player':
      appearances = Math.abs(Math.round(gamesInSeason / 10 + getRandomInt(-5, 5)));
      break;
    case 'impact sub':
      appearances = Math.abs(Math.round(gamesInSeason / 3 + getRandomInt(-5, 5)));
      break;
    case 'squad player':
      appearances = Math.round(gamesInSeason / 2 + getRandomInt(-5, 5));
      break;
    case 'regular starter':
      appearances = Math.round(gamesInSeason * 0.75 + getRandomInt(-10, 5));
      break;
    case 'important player':
      appearances = Math.round(gamesInSeason * 0.9 + getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
      break;
    case 'star player':
      appearances = Math.round(gamesInSeason - getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
      break;
    default:
      appearances = 0;
      break;
  }

  if (appearances > club.club.gamesInSeason) {
    appearances = club.club.gamesInSeason;
  }
  console.log('getAppsForSeason', appearances);

  return {
    allComps: {
      appearances: {
        starts: 0,
        sub: 0,
        total: appearances,
      },
    },
    league: {
      appearances: {
        starts: 0,
        sub: 0,
        total: 0,
      },
    },
    cup: {
      appearances: {
        starts: 0,
        sub: 0,
        total: 0,
      },
    },
    continental: {
      appearances: {
        starts: 0,
        sub: 0,
        total: 0,
      },
    },
  };
}

function calcCareerStat(seasons: Season[], propPath: string): number {
  return seasons.reduce((acc, s) => acc + get(s, propPath), 0);
}

export function calcTotalStats(seasons: Season[], career: CareerOverview): SeasonStats {
  const { allComps, league, cup, continental } = career.totalStats;
  const stats: SeasonStats = {
    allComps: {
      ...allComps,
      aggRating: calcCareerStat(seasons, 's.stats.allComps.aggRating'),
      avgRating: calcCareerStat(seasons, 's.stats.allComps.avgRating'),
    },
    league: {
      ...league,
      aggRating: calcCareerStat(seasons, 's.stats.league.aggRating'),
      avgRating: calcCareerStat(seasons, 's.stats.league.avgRating'),
    },
    cup: {
      ...cup,
      aggRating: calcCareerStat(seasons, 's.stats.cup.aggRating'),
      avgRating: calcCareerStat(seasons, 's.stats.cup.avgRating'),
    },
    continental: {
      ...continental,
      aggRating: calcCareerStat(seasons, 's.stats.continental.aggRating'),
      avgRating: calcCareerStat(seasons, 's.stats.continental.avgRating'),
    },
  };

  return stats;
}
