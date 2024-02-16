import { Club } from 'app/models/club.model';
import {
  LeagueDifficulty,
  PlayingTime,
  TransferOption,
  TransferType,
  Season,
  CareerOverview,
  CareerScore,
  ClubStats,
} from './career.model';
import { getRandFloat, getRandomInt, probability } from '@shared/utils';
import { mean, round } from 'lodash-es';
import { playerToClubAbility } from './career.constants';

function calcLeagueDifficulty(clubRating: number, leagueRating: number, ability: number): LeagueDifficulty {
  const teamDiff = (clubRating + ability * 3) / 2 - leagueRating;
  console.log('teamDiff', teamDiff, 'avg', (clubRating + ability * 3) / 2, 'leagueRating', leagueRating);
  if (teamDiff > 39) {
    return 'easy';
  } else if (teamDiff > 19) {
    return 'mediumEasy';
  } else if (teamDiff > -15) {
    return 'medium';
  } else if (teamDiff > -35) {
    return 'mediumHard';
  } else {
    return 'hard';
  }
}

export function getPlayingTime(club: Club, season: Season): PlayingTime {
  const ability = playerToClubAbility(season.currentAbility);
  console.log('adjustedAbility for playing time', ability, 'clubRating', club.clubRating);
  if (ability < club.clubRating - 40 && season.age < 22) {
    return 'breakthrough prospect';
  } else if (ability < club.clubRating - 30) {
    return 'fringe player';
  } else if (ability < club.clubRating - 25) {
    return 'impact sub';
  } else if (ability < club.clubRating - 5) {
    return 'squad player';
  } else if ((ability < club.clubRating + 10 && club.clubRating < 385) || ability < club.clubRating + 25) {
    return 'regular starter';
  } else if ((ability < club.clubRating + 30 && club.clubRating < 385) || ability < club.clubRating + 45) {
    return 'important player';
  } else {
    return 'star player';
  }
}

export function getWage(playingTime: PlayingTime, parentClub: TransferOption | false, hasLoanOption: boolean): number {
  if (parentClub && hasLoanOption) {
    return parentClub.wage;
  }

  switch (playingTime) {
    case 'breakthrough prospect':
      return 150;
    case 'fringe player':
      return 1000;
    case 'impact sub':
      return 2500;
    case 'squad player':
      return 5000;
    case 'regular starter':
      return 10000;
    case 'important player':
      return 15000;
    case 'star player':
      return 30000;
    default:
      return 0;
  }
}

export function getTransferFee(
  club: Club,
  parentClub: TransferOption | false,
  hasLoanOption: boolean,
  playingTime: PlayingTime,
  season: Season
): { transferType: TransferType; transferFee: number } {
  if (season.id === 0 && !hasLoanOption) {
    return {
      transferType: 'sign',
      transferFee: 0,
    };
  }

  if (parentClub && hasLoanOption) {
    return {
      transferType: parentClub.transferType === 're-sign' || parentClub.transferType ? 'loan' : 'transfer/loan',
      transferFee: parentClub.transferFee,
    };
  }
  const getMarketValue = (c: Club): number => {
    switch (c.league) {
      case 'ksa1':
        return c.marketValue * 1.35;
      case 'eng1':
        return c.marketValue * 1.1;
      case 'usa1':
        return c.marketValue * 1.05;
      default:
        return c.marketValue;
    }
  };
  // if playingTime is prospect, fringe or sub should be a transfer
  // if playingTime is squad, regular, important, or star should be a loan or transfer

  switch (playingTime) {
    case 'breakthrough prospect':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 9000,
      };
    case 'fringe player':
    case 'impact sub':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 15000,
      };
    case 'squad player':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 40000,
      };
    case 'regular starter':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 50000,
      };
    case 'regular starter':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 60000,
      };
    case 'important player':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 70000,
      };
    case 'star player':
      return {
        transferType: 'transfer',
        transferFee: getMarketValue(club) * 80000,
      };
    default:
      return {
        transferType: 'transfer',
        transferFee: 0,
      };
  }
}

export function simulateApps(appearances: number, transfer: TransferOption, season: Season, career: CareerOverview) {
  // easyLeague 1.0 g/mp 0.5 a/mp
  // mediumEasyLeague 0.5 g/mp 0.2 a/mp
  // mediumLeague 0.35 g/mp 0.15 a/mp
  // mediumHardLeague 0.18 g/mp 0.15 a/mp
  // hardLeague 0.15 g/mp 0.1 a/mp

  const leagueDiff = calcLeagueDifficulty(transfer.club.clubRating, transfer.club.leagueDifficulty, season.currentAbility);
  const currentClubApps = career.clubStats.find(c => c.id === transfer.club.id)?.currentClubStreak || 0;

  console.log('leagueDiff', leagueDiff);

  const calculator = (a: number, b: number, seasons: number): number => {
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
  };

  const getSkewedGoals = (diff: LeagueDifficulty, apps: number) => {
    switch (diff) {
      case 'easy':
        return calculator(0.8, 1.2, apps);
      case 'mediumEasy':
        return calculator(0.4, 0.7, apps);
      case 'medium':
        return calculator(0.25, 0.5, apps);
      case 'mediumHard':
        return calculator(0.08, 0.25, apps);
      case 'hard':
        return calculator(0.05, 0.2, apps);
      default:
        return 0;
    }
  };

  const getSkewedAssists = (diff: LeagueDifficulty, apps: number) => {
    switch (diff) {
      case 'easy':
        return calculator(0.35, 0.7, apps);
      case 'mediumEasy':
        return calculator(0.1, 0.3, apps);
      case 'medium':
        return calculator(0.05, 0.25, apps);
      case 'mediumHard':
        return calculator(0.05, 0.25, apps);
      case 'hard':
        return calculator(0.025, 0.15, apps);
      default:
        return 0;
    }
  };
  const seasonRatings = [];
  const seasonStats = {
    goals: 0,
    assists: 0,
    avgRating: 0,
    leagueDifficulty: leagueDiff,
    aggRating: 0,
  };

  for (let i = 0; i < appearances; i++) {
    const goals = getSkewedGoals(leagueDiff, currentClubApps);
    const assists = getSkewedAssists(leagueDiff, currentClubApps);

    seasonStats.goals += goals;
    seasonStats.assists += assists;
    const gameRating = (goals + assists) * 1.25 + 6.2 > 10.0 ? 10.0 : (goals + assists) * 1.25 + 6.2;
    seasonRatings.push(gameRating);
    seasonStats.aggRating += gameRating;
    console.log('GA', goals, assists);
  }

  seasonStats.avgRating = appearances > 0 ? round(mean(seasonRatings), 1) : 0;
  return seasonStats;
}

export function adjustCurrentAbility(
  season: Season,
  apps: number,
  rating: number,
  transfer: TransferOption,
  career: CareerOverview,
  leagueDiff: LeagueDifficulty
): number {
  console.log('adjustCurrentAbility');
  if (season.age > 34) {
    return season.currentAbility - 20;
  } else if (season.age > 31) {
    return season.currentAbility - 15;
  } else if (season.age > 29) {
    return season.currentAbility;
  }

  const totalGames = transfer.club.gamesInSeason;
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

  const consistencyFactor = (ca: CareerOverview) => {
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

  const performance = performanceFactor(apps, totalGames, rating);

  console.log(season, 'ability calc', consistencyFactor(career), performance, challengeFactor(leagueDiff), youthFactor(season));

  return consistencyFactor(career) + performance + challengeFactor(leagueDiff) + youthFactor(season) + season.currentAbility;
}

export function getAppsForProspect(club: TransferOption, season: Season, gamesInSeason: number) {
  // const currentAbility = season.currentAbility * CLUB_MULTIPLIER;
  // if (currentAbility < club.club.clubRating - 50) {
  //   return getRandomInt(0, 8);
  // } else if (currentAbility < club.club.clubRating - 35) {
  //   return Math.round(gamesInSeason / 3 + getRandomInt(-5, 5));
  // } else if (currentAbility < club.club.clubRating - 20) {
  //   return Math.round(gamesInSeason / 2 + getRandomInt(-5, 5));
  // } else if (currentAbility < club.club.clubRating - 10) {
  //   return Math.round(gamesInSeason * 0.75 + getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
  // } else {
  //   return Math.round(gamesInSeason * 0.9 + getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
  // }
}

export function newSeasonStr(year: string) {
  const [first, second] = year.split('/').map(Number);
  return `${first + 1}/${second + 1}`;
}

export function totalSeasonsStr(first: number, last: number) {
  return first + ' - ' + last;
}

export function checkHalfStar(rating: number) {
  return Math.round(rating * 2) / 2;
}

export function calcScore(clubs: Club[], career: CareerOverview): CareerScore {
  // based on peakAbility, peakClubAbility, avgLeagueAbility, and goal involvements
  // peakAbility 130-170
  const abilityScore = (career.peakAbility / 220) * 5;
  const clubScore = (career.peakClubAbility / 420) * 5;
  const leagueScore = (career.avgLeagueAbility / 400) * 5;
  // goal contribution per game should be around 0.25 - 1.5
  const goalScore = ((career.totalGoals + career.totalAssists) / career.totalApps) * 6;
  // availabilty should be 0.5 - 0.95
  const availabilityScore = (career.totalApps / career.totalPossibleApps) * 5.25;
  const totalScore = abilityScore / 5 + clubScore / 5 + leagueScore / 5 + goalScore / 5 + availabilityScore / 5;

  console.log(abilityScore, clubScore, leagueScore, goalScore, availabilityScore, totalScore);

  return {
    abilityScore: abilityScore > 5 ? 5 : abilityScore,
    peakClubScore: clubScore > 5 ? 5 : clubScore,
    avgLeagueScore: leagueScore > 5 ? 5 : leagueScore,
    goalScore: goalScore > 5 ? 5 : goalScore,
    availabilityScore: availabilityScore > 5 ? 5 : availabilityScore,
    totalScore: totalScore > 5 ? 5 : totalScore,
  };
}

export function adjustClubStats(clubStats: ClubStats[], season: Season): ClubStats[] {
  const newClubStats = [...clubStats];
  const currentClubIndex = newClubStats.findIndex(c => c.id === season.currentClub?.club.id);
  const club = newClubStats[currentClubIndex];

  if (!season.currentClub) {
    console.log('ERROR WITH STATS');
    return newClubStats;
  }

  if (currentClubIndex === -1) {
    // if club not found in array & currentTeam exists
    const isFirstClub = season.id === 0;
    newClubStats.push({
      ...season.currentClub?.club,
      clubApps: season.appearances,
      clubGoals: season.goals,
      clubAssists: season.assists,
      aggRating: season.aggRating,
      totalSeasons: 1,
      currentClubStreak: season.appearances / season.currentClub?.club.gamesInSeason,
      isFirstClub,
      seasonId: season.id,
    });
  } else if (season.id === club.seasonId + 1) {
    // if the current season id is equal to the club's season id + 1
    console.log(season.id, club.seasonId, newClubStats);
    newClubStats[currentClubIndex] = {
      ...club,
      clubApps: club.clubApps + season.appearances,
      clubGoals: club.clubGoals + season.goals,
      clubAssists: club.clubAssists + season.assists,
      aggRating: club.aggRating + season.aggRating,
      totalSeasons: club.totalSeasons + 1,
      currentClubStreak: club.currentClubStreak + season.appearances / season.currentClub?.club.gamesInSeason,
      seasonId: season.id,
    };
  } else {
    // otherwise if the club is in the existing array but was not the last team
    newClubStats[currentClubIndex] = {
      ...club,
      clubApps: club.clubApps + season.appearances,
      clubGoals: club.clubGoals + season.goals,
      clubAssists: club.clubAssists + season.assists,
      aggRating: club.aggRating + season.aggRating,
      totalSeasons: club.totalSeasons + 1,
      currentClubStreak: season.appearances / season.currentClub?.club.gamesInSeason,
      seasonId: season.id,
    };
  }

  return newClubStats;
}
