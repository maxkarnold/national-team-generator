import { Club } from 'app/football/models/club.model';
import { ClubStats, TransferOption } from './club.model';
import { Season } from '../player/player.model';
import { getPlayingTime, getWage } from '../career.utils';
import { getRandomInt } from '@shared/utils';

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
    return parentClub.club as ClubStats;
  }
  const hasCurrentClub = clubs.filter(c => c.id === season.currentClub?.club?.id).length > 0;

  if (hasCurrentClub && season.currentClub) {
    return season.currentClub.club as ClubStats;
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
