import { Club } from 'app/models/club.model';
import { CareerStats, LeagueDifficulty, PlayingTime, TransferOption, TransferType } from './career.model';
import { getRandFloat, getRandomInt, getRandomInts, probability } from '@shared/utils';
import { mean, round } from 'lodash';

function getPlayingTime(club: Club, career: CareerStats): { wage: number; playingTime: PlayingTime } {
  if ((career.currentAbility < club.clubRating - 60 || career.age < 18) && career.age < 22) {
    return {
      wage: 150,
      playingTime: 'breakthrough prospect',
    };
  } else if (career.currentAbility < club.clubRating - 50) {
    return {
      wage: 1000,
      playingTime: 'fringe player',
    };
  } else if (career.currentAbility < club.clubRating - 40) {
    return {
      wage: 2000,
      playingTime: 'impact sub',
    };
  } else if (career.currentAbility < club.clubRating - 35) {
    return {
      wage: 4500,
      playingTime: 'squad player',
    };
  } else if (career.currentAbility < club.clubRating - 20) {
    return {
      wage: 6000,
      playingTime: 'regular starter',
    };
  } else if (career.currentAbility < club.clubRating) {
    return {
      wage: 9500,
      playingTime: 'important player',
    };
  } else if (career.currentAbility >= club.clubRating + 10) {
    return {
      wage: 12000,
      playingTime: 'star player',
    };
  } else {
    return {
      wage: 1000,
      playingTime: 'fringe player',
    };
  }
}

function getTransferFee(club: Club, wage: number, playingTime: PlayingTime): { transferType: TransferType; transferFee: number } {
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

  const fringeRoles: PlayingTime[] = ['breakthrough prospect', 'fringe player', 'impact sub'];
  const squadRoles: PlayingTime[] = ['squad player', 'regular starter', 'important player', 'star player'];
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
    aggRating: 0,
  };

  for (let i = 0; i < apps; i++) {
    const goals = getSkewedGoals();
    const assists = getSkewedAssists();

    seasonStats.seasonGoals += goals;
    seasonStats.seasonAssists += assists;
    const gameRating = (goals + assists) * 1.25 + 6.2 > 10.0 ? 10.0 : (goals + assists) * 1.25 + 6.2;
    seasonRatings.push(gameRating);
    seasonStats.aggRating += gameRating;
    console.log('GA', goals, assists);
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

function getAppsForProspect(club: TransferOption, career: CareerStats, gamesInSeason: number) {
  if (career.currentAbility < club.club.clubRating - 50) {
    return getRandomInt(0, 8);
  } else if (career.currentAbility < club.club.clubRating - 35) {
    return Math.round(gamesInSeason / 3 + getRandomInt(-5, 5));
  } else if (career.currentAbility < club.club.clubRating - 20) {
    return Math.round(gamesInSeason / 2 + getRandomInt(-5, 5));
  } else if (career.currentAbility < club.club.clubRating - 10) {
    return Math.round(gamesInSeason * 0.75 + getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
  } else {
    return Math.round(gamesInSeason * 0.9 + getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
  }
}

export const tableHeaders = [
  'Year',
  'Age',
  'Team',
  'Info (Transfer)',
  'App',
  'Goals',
  'Assists',
  'Avg Rating',
  'Wage (£/week)',
  'Player Role',
];

export function newSeasonStr(year: string) {
  const [first, second] = year.split('/').map(Number);
  return `${first + 1}/${second + 1}`;
}

export function totalSeasonsStr(first: string, last: string) {
  return first.slice(0, 4) + ' - 20' + last.slice(-2);
}

export function calcCareerRating() {
  return 2;
}

export function simulateStats(transferChoice: TransferOption, careerStats: CareerStats): CareerStats {
  let seasonApps = 0;
  const gamesInSeason = transferChoice.club.gamesInSeason;

  switch (transferChoice.playingTime) {
    case 'breakthrough prospect':
      seasonApps = getAppsForProspect(transferChoice, careerStats, gamesInSeason);
      break;
    case 'fringe player':
    case 'impact sub':
      seasonApps = Math.round(gamesInSeason / 3 + getRandomInt(-5, 5));
      console.log(seasonApps);
      break;
    case 'squad player':
      seasonApps = Math.round(gamesInSeason / 2 + getRandomInt(-5, 5));
      break;
    case 'regular starter':
      seasonApps = Math.round(gamesInSeason * 0.75 + getRandomInt(-10, 5));
      break;
    case 'important player':
      seasonApps = Math.round(gamesInSeason * 0.9 + getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
      break;
    case 'star player':
      seasonApps = Math.round(gamesInSeason - getRandomInt(-(gamesInSeason * 0.1), gamesInSeason * 0.1));
      break;
    default:
      break;
  }

  if (seasonApps > transferChoice.club.gamesInSeason) {
    seasonApps = transferChoice.club.gamesInSeason;
  }

  const { seasonGoals, seasonAssists, seasonRating, aggRating } = simulateApps(seasonApps, transferChoice, careerStats);
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
    currentClub: transferChoice.club,
    currentAbility: checkCurrentAbility(currentAbility),
    seasonApps,
    seasonGoals,
    seasonAssists,
    seasonRating,
    aggRating,
  };
}

export function getEligibleClubs(careerStats: CareerStats, clubs: Club[]): TransferOption[] {
  // get eligible clubs for the current player's currentAbility and a role that matches
  const transferChoices: TransferOption[] = [];
  const ageFactor = (age: number) => {
    if (age < 20) {
      return 70;
    } else {
      return 40;
    }
  };
  // check each team for ability
  const eligibleClubs = clubs.filter(
    c =>
      c.clubRating < careerStats.currentAbility + ageFactor(careerStats.age) &&
      c.clubRating > careerStats.currentAbility - 30 &&
      careerStats.currentClub?.id !== c.id
  );

  if (eligibleClubs.length < 1) {
    return [];
  }
  const getCurrentClub = (teams: Club[]) => {
    const club = teams.find(c => c.id === careerStats.currentClub?.id);
    console.log(careerStats, club);
    return club;
  };

  const currentClub = getCurrentClub(clubs);

  if (currentClub) {
    const { wage, playingTime } = getPlayingTime(currentClub, careerStats);
    transferChoices.push({
      club: currentClub,
      transferType: 'n/a',
      transferFee: 0,
      wage,
      playingTime,
    });
  }

  const teamIndexes = [...getRandomInts(3, 0, eligibleClubs.length - 1)];

  teamIndexes.forEach(n => {
    const club = eligibleClubs[n];
    const { wage, playingTime } = getPlayingTime(club, careerStats);
    const { transferType, transferFee } = getTransferFee(club, wage, playingTime);
    transferChoices.push({
      club,
      transferType,
      transferFee,
      wage,
      playingTime,
    });
  });
  console.log(eligibleClubs.length, transferChoices);
  return transferChoices;
}
