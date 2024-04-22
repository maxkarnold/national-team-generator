import { Club } from 'app/models/club.model';
import { ClubStats, TransferOption } from './club.model';
import { AppearanceStats, Season, SeasonStats } from '../player/player.model';
import { getPlayingTime, getWage } from '../career.utils';
import { getRandomInt } from '@shared/utils';
import { CompetitionStats, defaultCompStats } from '../career.model';

const possibleCupStandings = [1, 2, 4, 8, 16, 32, 64];

function getLeagueStandings(club: Club): number {
  // TODO: leagueDifficulty will be swapped with leagueMedian
  // will be different with relegation as well
  if (club.clubRating > club.leagueDifficulty + 32) {
    return getRandomInt(1, 2);
  }
  if (club.clubRating > club.leagueDifficulty + 18) {
    return getRandomInt(1, 4);
  } else if (club.clubRating > club.leagueDifficulty + 9) {
    // this if statement is the cutoff for first place
    return getRandomInt(1, 6);
  } else if (club.clubRating > club.leagueDifficulty) {
    return getRandomInt(3, club.leagueTeams / 2 + 2);
  } else {
    return getRandomInt(club.leagueTeams / 2 - 2, club.leagueTeams);
  }
}

export function generateNewClubStandings(club: Club): { league: number; cup: number; continental: number } {
  return {
    league: getLeagueStandings(club),
    cup: possibleCupStandings[getRandomInt(0, 7)],
    continental: 0,
  };
}

export function getCurrentClub(clubs: Club[], season: Season, parentClub: TransferOption | false): ClubStats | null {
  if (parentClub) {
    return parentClub.club;
  }
  const hasCurrentClub = clubs.filter(c => c.id === season.currentClub?.club?.id).length > 0;

  if (hasCurrentClub && season.currentClub) {
    return season.currentClub.club;
  }
  return null;
}

export function getCurrentClubAsTransfer(
  club: ClubStats,
  season: Season,
  parentClub: TransferOption | false,
  hasLoanOption: boolean
): TransferOption {
  const playingTime = getPlayingTime(club, season);
  const wage = getWage(playingTime, parentClub, hasLoanOption);

  return {
    club,
    transferType: hasLoanOption ? 'stay' : 're-sign',
    transferFee: 0,
    wage,
    playingTime,
  };
}

export function getAppsForSeason(club: TransferOption): {
  allComps: AppearanceStats;
  league: AppearanceStats;
  cup: AppearanceStats;
  continental: AppearanceStats;
} {
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

  return {
    allComps: {
      appearances: {
        starts: appearances,
        sub: 0,
      },
    },
    league: {
      appearances: {
        starts: 0,
        sub: 0,
      },
    },
    cup: {
      appearances: {
        starts: 0,
        sub: 0,
      },
    },
    continental: {
      appearances: {
        starts: 0,
        sub: 0,
      },
    },
  };
}
