import { Club } from 'app/models/club.model';
import { LeagueDifficulty, PlayingTime, TransferOption, TransferType, Season, CareerOverview, CareerScore } from './career.model';
import { getRandFloat, getRandomInt, getRandomInts, probability } from '@shared/utils';
import { mean, round } from 'lodash';

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

export function getPlayingTime(club: Club, season: Season): { wage: number; playingTime: PlayingTime } {
  if ((season.currentAbility < club.clubRating - 60 || season.age < 18) && season.age < 22) {
    return {
      wage: 150,
      playingTime: 'breakthrough prospect',
    };
  } else if (season.currentAbility < club.clubRating - 60) {
    return {
      wage: 1000,
      playingTime: 'fringe player',
    };
  } else if (season.currentAbility < club.clubRating - 40) {
    return {
      wage: 2000,
      playingTime: 'impact sub',
    };
  } else if (season.currentAbility < club.clubRating - 35) {
    return {
      wage: 4500,
      playingTime: 'squad player',
    };
  } else if (season.currentAbility < club.clubRating - 20) {
    return {
      wage: 6000,
      playingTime: 'regular starter',
    };
  } else if (season.currentAbility < club.clubRating + 10) {
    return {
      wage: 9500,
      playingTime: 'important player',
    };
  } else if (season.currentAbility >= club.clubRating + 10) {
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

export function getTransferFee(club: Club, wage: number, playingTime: PlayingTime): { transferType: TransferType; transferFee: number } {
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
  // DO NOT REMOVE - WILL BE IMPORTANT WITH LOANS
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

export function simulateApps(apps: number, transfer: TransferOption, season: Season) {
  // easyLeague 1.0 g/mp 0.5 a/mp
  // mediumEasyLeague 0.5 g/mp 0.2 a/mp
  // mediumLeague 0.35 g/mp 0.15 a/mp
  // mediumHardLeague 0.18 g/mp 0.15 a/mp
  // hardLeague 0.15 g/mp 0.1 a/mp

  const leagueDiff = calcLeagueDifficulty(transfer.club.clubRating, transfer.club.leagueDifficulty, season.currentAbility);

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
    goals: 0,
    assists: 0,
    avgRating: 0,
    leagueDifficulty: leagueDiff,
    aggRating: 0,
  };

  for (let i = 0; i < apps; i++) {
    const goals = getSkewedGoals();
    const assists = getSkewedAssists();

    seasonStats.goals += goals;
    seasonStats.assists += assists;
    const gameRating = (goals + assists) * 1.25 + 6.2 > 10.0 ? 10.0 : (goals + assists) * 1.25 + 6.2;
    seasonRatings.push(gameRating);
    seasonStats.aggRating += gameRating;
    console.log('GA', goals, assists);
  }

  seasonStats.avgRating = apps > 0 ? round(mean(seasonRatings), 1) : 0;
  return seasonStats;
}

export function adjustCurrentAbility(season: Season, apps: number, rating: number, transfer: TransferOption): number {
  if (season.age > 33) {
    return season.currentAbility - 20;
  } else if (season.age > 31) {
    return season.currentAbility - 15;
  } else if (season.age > 29) {
    return season.currentAbility;
  }

  const totalGames = transfer.club.gamesInSeason;
  const youthFactor = ({ age, currentAbility }: Season): number => {
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

  const challengeFactor = ({ leagueDifficulty }: Season): number => {
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
    return rating > 7.0 ? youthFactor(season) + challengeFactor(season) + 1 : youthFactor(season) + challengeFactor(season);
  } else if (apps / totalGames > 0.5) {
    return rating > 7.0 ? youthFactor(season) + challengeFactor(season) + 2 : youthFactor(season) + challengeFactor(season);
  } else if (apps / totalGames > 0.75) {
    return rating > 7.0 ? youthFactor(season) + challengeFactor(season) + 3 : youthFactor(season) + challengeFactor(season);
  } else {
    return youthFactor(season) + challengeFactor(season) - 2;
  }
}

export function getAppsForProspect(club: TransferOption, season: Season, gamesInSeason: number) {
  if (season.currentAbility < club.club.clubRating - 50) {
    return getRandomInt(0, 8);
  } else if (season.currentAbility < club.club.clubRating - 35) {
    return Math.round(gamesInSeason / 3 + getRandomInt(-5, 5));
  } else if (season.currentAbility < club.club.clubRating - 20) {
    return Math.round(gamesInSeason / 2 + getRandomInt(-5, 5));
  } else if (season.currentAbility < club.club.clubRating - 10) {
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

export function isHalfStar(rating: number): boolean {
  return rating / 10 > 3 && rating / 10 < 8;
}

export function calcScore(clubs: Club[], career: CareerOverview): CareerScore {
  // based on peakAbility, peakClubAbility, avgLeagueAbility, and goal involvements
  // peakAbility 130-170
  const abilityScore = (career.peakAbility / 220) * 5;
  const clubScore = (career.peakClubAbility / 220) * 5;
  const leagueScore = (career.avgLeagueAbility / 200) * 5;
  // goal contribution per game should be around 0.25 - 1.5
  const goalScore = ((career.totalGoals + career.totalAssists) / career.totalApps) * 3.25;
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
