import { Club } from 'app/football/models/club.model';
import { playerToClubAbility } from './career.constants';
import { LeagueDifficulty, TransferOption, TransferType, ClubStats } from './club/club.model';
import { Season, PlayingTime, CareerOverview, CareerScore, defaultCompStats } from './player/player.model';

export function calcLeagueDifficulty(clubRating: number, leagueRating: number, ability: number): LeagueDifficulty {
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

export function getPlayingTime(club: Club | ClubStats, season: Season): PlayingTime {
  const ability = playerToClubAbility(season.currentAbility);
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
  const goalScore =
    ((career.totalStats.allComps.goals + career.totalStats.allComps.goals) / career.totalStats.allComps.appearances.total) * 6;
  // availability should be 0.5 - 0.95
  const availabilityScore = (career.totalStats.allComps.appearances.total / career.totalPossibleApps) * 5.25;
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
    const newClub: ClubStats = {
      ...season.currentClub?.club,
      clubStats: season.stats,
      totalSeasons: 1,
      currentClubStreak: season.stats.allComps.appearances.total / season.currentClub?.club.gamesInSeason,
      isFirstClub,
      seasonId: season.id,
      previousStandings: {
        league: 0,
        cup: 0,
        continental: 0,
      },
    };
    newClubStats.push(newClub);
  } else if (season.id === club.seasonId + 1) {
    // if the current season id is equal to the club's season id + 1
    console.log(season.id, club.seasonId, newClubStats);
    newClubStats[currentClubIndex] = {
      ...club,
      clubStats: {
        allComps: {
          appearances: {
            total: club.clubStats.allComps.appearances.total + season.stats.allComps.appearances.total,
            sub: club.clubStats.allComps.appearances.sub + season.stats.allComps.appearances.sub,
            starts: club.clubStats.allComps.appearances.starts + season.stats.allComps.appearances.starts,
          },
          goals: club.clubStats.allComps.goals + season.stats.allComps.goals,
          assists: club.clubStats.allComps.assists + season.stats.allComps.assists,
          aggRating: club.clubStats.allComps.aggRating + season.stats.allComps.aggRating,
          avgRating:
            (club.clubStats.allComps.aggRating + season.stats.allComps.aggRating) /
            (club.clubStats.allComps.appearances.total + season.stats.allComps.appearances.total),
        },
        league: { ...defaultCompStats },
        cup: { ...defaultCompStats },
        continental: { ...defaultCompStats },
      },
      totalSeasons: club.totalSeasons + 1,
      currentClubStreak: club.currentClubStreak + season.stats.allComps.appearances.total / season.currentClub?.club.gamesInSeason,
      seasonId: season.id,
    };
  } else {
    // otherwise if the club is in the existing array but was not the last team
    newClubStats[currentClubIndex] = {
      ...club,
      clubStats: {
        allComps: {
          appearances: {
            total: club.clubStats.allComps.appearances.total + season.stats.allComps.appearances.total,
            sub: club.clubStats.allComps.appearances.sub + season.stats.allComps.appearances.sub,
            starts: club.clubStats.allComps.appearances.starts + season.stats.allComps.appearances.starts,
          },
          goals: club.clubStats.allComps.goals + season.stats.allComps.goals,
          assists: club.clubStats.allComps.assists + season.stats.allComps.assists,
          aggRating: club.clubStats.allComps.aggRating + season.stats.allComps.aggRating,
          avgRating:
            (club.clubStats.allComps.aggRating + season.stats.allComps.aggRating) /
            (club.clubStats.allComps.appearances.total + season.stats.allComps.appearances.total),
        },
        league: { ...defaultCompStats },
        cup: { ...defaultCompStats },
        continental: { ...defaultCompStats },
      },
      totalSeasons: club.totalSeasons + 1,
      currentClubStreak: season.stats.allComps.appearances.total / season.currentClub?.club.gamesInSeason,
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
