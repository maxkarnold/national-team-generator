import { Club } from 'app/models/club.model';
import { getRandomInt } from '@shared/utils';
import { mean, round } from 'lodash-es';
import { playerToClubAbility } from './career.constants';
import { LeagueDifficulty, TransferOption, TransferType, ClubStats } from './club/club.model';
import { Season, PlayingTime, CareerOverview, CareerScore, SeasonStats } from './player/player.model';
import { getSkewedAssists, getSkewedGoals } from './simulation/simulation.utils';

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

export function getPlayingTime(club: Partial<ClubStats>, season: Season): PlayingTime {
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

export function simulateApps(
  appearances: SeasonStats,
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
  const seasonStats = {
    goals: 0,
    assists: 0,
    avgRating: 0,
    leagueDifficulty: leagueDiff,
    aggRating: 0,
  };

  // ITERATES OVER APPS to calculate stats per game for an entire season
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

export function calcCareerScore(clubs: Club[], career: CareerOverview): CareerScore {
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

// STEPS:
// 1. Check for team's previous place in standings
// 2. Determine if team has been relegated/promoted/qualified for Competitions
// 3. Simulate games with player in each competition
// 4. Simulate league games
// 5. Simulate cup games
// 6. Simulate continental games
// 7. save stats from season, including the standing for the club in each competition
