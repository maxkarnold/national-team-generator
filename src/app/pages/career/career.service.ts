import { Injectable } from '@angular/core';
import { getRandomInt, getRandomInts } from '@shared/utils';
import { Club } from 'app/models/club.model';
import { TransferOption, CareerOverview, Season, ClubStats } from './career.model';
import { adjustCurrentAbility, calcScore, getPlayingTime, getTransferFee, getWage, simulateApps, totalSeasonsStr } from './career.utils';
import { ageFactor, getCurrentClub } from './career.constants';

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  constructor() {}

  simulateSeasonStats(transferChoice: TransferOption, season: Season, career: CareerOverview): Season {
    let appearances = 0;
    const gamesInSeason = transferChoice.club.gamesInSeason;

    switch (transferChoice.playingTime) {
      case 'breakthrough prospect':
      case 'fringe player':
        appearances = Math.abs(Math.round(gamesInSeason / 10 + getRandomInt(-5, 5)));
        break;
      case 'impact sub':
        appearances = Math.abs(Math.round(gamesInSeason / 3 + getRandomInt(-5, 5)));
        console.log(appearances);
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
        break;
    }

    if (appearances > transferChoice.club.gamesInSeason) {
      appearances = transferChoice.club.gamesInSeason;
    }

    const { goals, assists, avgRating, aggRating } = simulateApps(appearances, transferChoice, season, career);
    const currentAbility = adjustCurrentAbility(season, appearances, avgRating, transferChoice);

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
      ...season,
      currentClub: transferChoice,
      currentAbility: checkCurrentAbility(currentAbility),
      appearances,
      goals,
      assists,
      avgRating,
      aggRating,
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
      // console.log(c.clubRating, season.currentAbility, ageFactor(season.age, season.currentAbility));
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
    console.log(
      new Set(eligibleTransferClubs.map(a => a.league)),
      'currentAbility',
      season.currentAbility,
      'best club',
      playerRating - playerRating / 10,
      'worst club',
      playerRating + 15
    );

    if (eligibleTransferClubs.length < 3) {
      return [];
    }

    const currentClub = getCurrentClub(clubs, season, parentClub);

    if (currentClub) {
      const playingTime = getPlayingTime(currentClub, season);
      const wage = getWage(playingTime, parentClub, hasLoanOption);
      transferChoices.push({
        club: currentClub,
        transferType: hasLoanOption ? 'stay' : 're-sign',
        transferFee: 0,
        wage,
        playingTime,
      });
    }

    const teamIndexes = [...getRandomInts(3, 0, eligibleTransferClubs.length - 1)];

    teamIndexes.forEach(n => {
      const club = eligibleTransferClubs[n];
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
    const totalApps = seasons.reduce((acc, s) => acc + s.appearances, 0);
    const teams = seasons.map(s => s.currentClub?.club as Club);
    const careerStats: CareerOverview = {
      ...career,
      avgLeagueAbility: seasons.reduce((acc, s) => acc + (s.currentClub as TransferOption).club.leagueDifficulty, 0) / seasons.length,
    };
    const score = calcScore(teams, careerStats);
    const getLongestServedClub = (clubs: ClubStats[]) => {
      return clubs.sort((a, b) => b.clubApps - a.clubApps)[0];
    };
    return {
      ...career,
      seasons: totalSeasonsStr(14, lastSeason.age),
      longestServedClub: getLongestServedClub(career.clubStats),
      avgRating: (seasons.reduce((acc, s) => acc + s.aggRating, 0) / totalApps).toFixed(2),
      score,
    };
  }
}
