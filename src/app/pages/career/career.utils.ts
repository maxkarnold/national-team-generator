import { Club } from 'app/models/club.model';
import { CareerStats, LeagueDifficulty, PlayingTime, TransferOption } from './career.constants';
import { getRandFloat, getRandomInt, getRandomInts, probability } from '@shared/utils';
import { mean, round } from 'lodash';

function getPlayingTime(club: Club, career: CareerStats): { wage: number; playingTime: PlayingTime } {
  if (career.currentAbility < club.clubRating - 50) {
    return {
      wage: 150,
      playingTime: 'breakthrough prospect',
    };
  } else if (career.currentAbility < club.clubRating - 40) {
    return {
      wage: 1000,
      playingTime: 'fringe player',
    };
  } else if (career.currentAbility < club.clubRating - 35) {
    return {
      wage: 2000,
      playingTime: 'impact sub',
    };
  } else if (career.currentAbility < club.clubRating - 20) {
    return {
      wage: 4500,
      playingTime: 'squad player',
    };
  } else if (career.currentAbility < club.clubRating - 10) {
    return {
      wage: 6000,
      playingTime: 'regular starter',
    };
  } else if (career.currentAbility < club.clubRating + 5) {
    return {
      wage: 9500,
      playingTime: 'important player',
    };
  } else {
    return {
      wage: 12000,
      playingTime: 'star player',
    };
  }
}

function calcLeagueDifficulty(clubRating: number, leagueRating: number, ability: number): LeagueDifficulty {
  const teamDiff = (clubRating + ability) / 2 - leagueRating;
  console.log('teamDiff', teamDiff, 'avg', (clubRating + ability) / 2);
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

function simulateApps(apps: number, transfer: TransferOption, careerStats: CareerStats) {
  // easyLeague 1.0 g/mp 0.5 a/mp
  // mediumEasyLeague 0.5 g/mp 0.2 a/mp
  // mediumLeague 0.35 g/mp 0.15 a/mp
  // mediumHardLeague 0.18 g/mp 0.15 a/mp
  // hardLeague 0.15 g/mp 0.1 a/mp

  const leagueDiff = calcLeagueDifficulty(transfer.club.clubRating, transfer.club.leagueDifficulty, careerStats.currentAbility);

  console.log('leagueDiff', leagueDiff);

  const calculator = (a: number, b: number): number => {
    if (probability(getRandFloat(a / 15, b / 15))) {
      return 3;
    } else if (probability(getRandFloat(a / 6, b / 6))) {
      return 2;
    } else if (probability(getRandFloat(a * 0.8, b * 0.8))) {
      return 1;
    } else {
      return 0;
    }
  };

  const getSkewedGoals = () => {
    switch (leagueDiff) {
      case 'easy':
        return calculator(0.8, 1.2);
      case 'mediumEasy':
        return calculator(0.4, 0.7);
      case 'medium':
        return calculator(0.25, 0.5);
      case 'mediumHard':
        return calculator(0.08, 0.25);
      case 'hard':
        return calculator(0.05, 0.2);
      default:
        return 0;
    }
  };

  const getSkewedAssists = () => {
    switch (leagueDiff) {
      case 'easy':
        return calculator(0.35, 0.7);
      case 'mediumEasy':
        return calculator(0.1, 0.3);
      case 'medium':
        return calculator(0.05, 0.25);
      case 'mediumHard':
        return calculator(0.05, 0.25);
      case 'hard':
        return calculator(0.025, 0.15);
      default:
        return 0;
    }
  };
  const seasonRatings = [];
  const seasonStats = {
    seasonGoals: 0,
    seasonAssists: 0,
    seasonRating: 0,
    leagueDifficulty: leagueDiff,
  };

  for (let i = 0; i < apps; i++) {
    const goals = getSkewedGoals();
    const assists = getSkewedAssists();

    seasonStats.seasonGoals += goals;
    seasonStats.seasonAssists += assists;
    const gameRating = (goals + assists) * 1.25 + 6.2 > 10.0 ? 10.0 : (goals + assists) * 1.25 + 6.2;
    seasonRatings.push(gameRating);
    console.log('GA', goals, assists, gameRating);
  }

  seasonStats.seasonRating = apps > 0 ? round(mean(seasonRatings), 1) : 0;
  return seasonStats;
}

function adjustCurrentAbility(career: CareerStats, apps: number, rating: number, transfer: TransferOption): number {
  if (career.age > 33) {
    return career.currentAbility - 20;
  } else if (career.age > 31) {
    return career.currentAbility - 15;
  } else if (career.age > 29) {
    return career.currentAbility;
  }

  const totalGames = transfer.club.gamesInSeason;
  const youthFactor = ({ age, currentAbility }: CareerStats): number => {
    if (age < 18) {
      return currentAbility + 10;
    } else if (age < 22) {
      return currentAbility + 5;
    } else if (age > 27) {
      return currentAbility - 5;
    } else {
      return currentAbility;
    }
  };

  const challengeFactor = ({ leagueDifficulty }: CareerStats): number => {
    switch (leagueDifficulty) {
      case 'hard':
        return 5;
      case 'mediumHard':
        return 4;
      case 'medium':
        return 2;
      case 'mediumEasy':
        return -2;
      case 'easy':
        return -5;
      default:
        return 0;
    }
  };

  if (apps / totalGames > 0.25) {
    return rating > 7.0 ? youthFactor(career) + challengeFactor(career) + 1 : youthFactor(career) + challengeFactor(career);
  } else if (apps / totalGames > 0.5) {
    return rating > 7.0 ? youthFactor(career) + challengeFactor(career) + 2 : youthFactor(career) + challengeFactor(career);
  } else if (apps / totalGames > 0.75) {
    return rating > 7.0 ? youthFactor(career) + challengeFactor(career) + 3 : youthFactor(career) + challengeFactor(career);
  } else {
    return youthFactor(career) + challengeFactor(career) - 2;
  }
}

export function newSeasonStr(year: string) {
  const [first, second] = year.split('/').map(Number);
  return `${first + 1}/${second + 1}`;
}

export function simulateStats(transferChoice: TransferOption, careerStats: CareerStats): CareerStats {
  let seasonApps = 0;

  switch (transferChoice.playingTime) {
    case 'breakthrough prospect':
      seasonApps = getRandomInt(0, 5);
      break;
    case 'squad player':
      seasonApps = Math.round(transferChoice.club.gamesInSeason / 2 + getRandomInt(-5, 5));
      break;
    case 'regular starter':
      seasonApps = Math.round(transferChoice.club.gamesInSeason * 0.75 + getRandomInt(-10, 5));

      break;
    case 'important player':
      seasonApps = Math.round(transferChoice.club.gamesInSeason * 0.9 + getRandomInt(-10, 5));
      break;
    case 'star player':
      seasonApps = Math.round(transferChoice.club.gamesInSeason - getRandomInt(0, 10));
      break;
    default:
      break;
  }

  if (seasonApps > transferChoice.club.gamesInSeason) {
    seasonApps = transferChoice.club.gamesInSeason;
  }

  const { seasonGoals, seasonAssists, seasonRating } = simulateApps(seasonApps, transferChoice, careerStats);
  const currentAbility = adjustCurrentAbility(careerStats, seasonApps, seasonRating, transferChoice);

  const checkCurrentAbility = (ability: number) => {
    if (ability < 10) {
      return 10;
    } else if (ability > 200) {
      return 200;
    } else {
      return ability;
    }
  };

  return {
    ...careerStats,
    currentAbility: checkCurrentAbility(currentAbility),
    seasonApps,
    seasonGoals,
    seasonAssists,
    seasonRating,
  };
}

export function getEligibleClubs(careerStats: CareerStats, clubs: Club[]): TransferOption[] {
  // get eligible clubs for the current player's currentAbility and a role that matches
  const transferChoices: TransferOption[] = [];
  // check each team for ability
  const eligibleClubs = clubs.filter(c => c.clubRating < careerStats.currentAbility + 40 && c.clubRating > careerStats.currentAbility - 40);

  if (eligibleClubs.length < 1) {
    return [];
  }
  const teamIndexes = getRandomInts(3, 0, eligibleClubs.length - 1);

  teamIndexes.forEach(n => {
    const { wage, playingTime } = getPlayingTime(eligibleClubs[n], careerStats);
    transferChoices.push({
      club: eligibleClubs[n],
      transferType: 'transfer',
      transferFee: 0,
      wage,
      playingTime,
    });
  });
  console.log(eligibleClubs.length, transferChoices);
  return transferChoices;
}
