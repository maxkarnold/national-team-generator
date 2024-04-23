import { Injectable } from '@angular/core';
import { getRandomInts } from '@shared/utils';
import { Club } from 'app/models/club.model';
import { calcCareerScore, getPlayingTime, getTransferFee, getWage, totalSeasonsStr } from './career.utils';
import { ageFactor } from './career.constants';
import { getCurrentClub, getCurrentClubAsTransfer } from './club/club.utils';
import { TransferOption, ClubStats } from './club/club.model';
import { Season, CareerOverview } from './player/player.model';
import { adjustCurrentAbility, calcTotalStats, getAppsForSeason } from './player/player.utils';
import { simulateApps } from './simulation/simulation.utils';

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  constructor() {}

  simulateSeasonStats(transferChoice: TransferOption, season: Season, career: CareerOverview): Season {
    const seasonApps = getAppsForSeason(transferChoice);
    const { stats, leagueDifficulty } = simulateApps(seasonApps, transferChoice, season, career);
    console.log('simulateSeasonStats', stats);
    const currentAbility = adjustCurrentAbility(season, stats, transferChoice, career, leagueDifficulty);

    return {
      ...season,
      currentClub: transferChoice,
      currentAbility: currentAbility,
      stats,
      leagueDifficulty,
    };
  }

  getEligibleClubs(
    season: Season,
    clubs: Club[],
    nation: string,
    parentClub: TransferOption | false,
    hasLoanOption: boolean
  ): TransferOption[] {
    // get eligible clubs for the current player's currentAbility and a role that matches
    // avg club rating is 308
    // min 228-242
    // max 380-390
    // current ability typically ranges from 65 - 190
    // club + player rating pairs
    // 65,240 80,280 100,300 120,340 140,370 150,380
    const transferChoices: TransferOption[] = [];

    const playerRating = ageFactor(season.age, season.currentAbility, hasLoanOption);
    // check each team for ability
    const eligibleTransferClubs = clubs.filter(c => {
      return (
        // max club
        c.clubRating < playerRating + 15 &&
        // min club
        (c.clubRating > playerRating - playerRating / 10 || playerRating > 800) &&
        season.currentClub?.club?.id !== c.id &&
        (c.league.slice(0, 3) === nation || nation === 'random' || season.age > 17 || hasLoanOption) &&
        ((hasLoanOption && playerRating >= c.clubRating - 5) || !hasLoanOption)
      );
    });
    // console.log(
    //   new Set(eligibleTransferClubs.map(a => a.league)),
    //   'currentAbility',
    //   season.currentAbility,
    //   'best club',
    //   playerRating - playerRating / 10,
    //   'worst club',
    //   playerRating + 15
    // );

    if (eligibleTransferClubs.length < 3) {
      return [];
    }

    const currentClub = getCurrentClub(clubs, season, parentClub);

    if (currentClub) {
      transferChoices.push(getCurrentClubAsTransfer(currentClub, season, parentClub, hasLoanOption));
    }

    const teamIndexes = [...getRandomInts(3, 0, eligibleTransferClubs.length - 1)];

    teamIndexes.forEach(n => {
      const club: Club = eligibleTransferClubs[n];
      const playingTime = getPlayingTime(club, season);
      const wage = getWage(playingTime, parentClub, hasLoanOption);
      const { transferType, transferFee } = getTransferFee(club, parentClub, hasLoanOption, playingTime, season);
      transferChoices.push({
        club,
        transferType,
        transferFee,
        wage,
        playingTime,
        parentClub: hasLoanOption && parentClub ? parentClub : undefined,
      });
    });
    return transferChoices;
  }

  calcFinalStats(seasons: Season[], lastSeason: Season, career: CareerOverview): CareerOverview {
    const totalStats = calcTotalStats(seasons, career);
    const teams = seasons.map(s => s.currentClub?.club as Club);
    const careerStats: CareerOverview = {
      ...career,
      avgLeagueAbility: seasons.reduce((acc, s) => acc + (s.currentClub as TransferOption).club.leagueDifficulty, 0) / seasons.length,
    };
    const score = calcCareerScore(teams, careerStats);
    const getLongestServedClub = (clubs: ClubStats[]) => {
      return clubs.sort((a, b) => b.clubStats.allComps.appearances.total - a.clubStats.allComps.appearances.total)[0];
    };
    return {
      ...career,
      seasons: totalSeasonsStr(14, lastSeason.age),
      longestServedClub: getLongestServedClub(career.clubStats),
      totalStats,
      score,
    };
  }
}
