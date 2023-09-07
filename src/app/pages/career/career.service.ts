import { Injectable } from '@angular/core';
import { getRandomInt, getRandomInts } from '@shared/utils';
import { Club } from 'app/models/club.model';
import { TransferOption, CareerOverview, Season } from './career.model';
import {
  adjustCurrentAbility,
  calcScore,
  getAppsForProspect,
  getPlayingTime,
  getTransferFee,
  simulateApps,
  totalSeasonsStr,
} from './career.utils';

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  constructor() {}

  simulateSeasonStats(transferChoice: TransferOption, season: Season): Season {
    let appearances = 0;
    const gamesInSeason = transferChoice.club.gamesInSeason;

    switch (transferChoice.playingTime) {
      case 'breakthrough prospect':
        appearances = getAppsForProspect(transferChoice, season, gamesInSeason);
        break;
      case 'fringe player':
      case 'impact sub':
        appearances = Math.round(gamesInSeason / 3 + getRandomInt(-5, 5));
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

    const { goals, assists, avgRating, aggRating } = simulateApps(appearances, transferChoice, season);
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
      currentTeam: transferChoice,
      currentAbility: checkCurrentAbility(currentAbility),
      appearances,
      goals,
      assists,
      avgRating,
      aggRating,
    };
  }

  getEligibleClubs(season: Season, clubs: Club[]): TransferOption[] {
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
        c.clubRating < season.currentAbility + ageFactor(season.age) &&
        c.clubRating > season.currentAbility - 30 &&
        season.currentTeam?.club?.id !== c.id
    );

    if (eligibleClubs.length < 1) {
      return [];
    }
    const getCurrentClub = (teams: Club[]) => {
      const club = teams.find(c => c.id === season.currentTeam?.club?.id);
      console.log(season, club);
      return club;
    };

    const currentClub = getCurrentClub(clubs);

    if (currentClub) {
      const { wage, playingTime } = getPlayingTime(currentClub, season);
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
      const { wage, playingTime } = getPlayingTime(club, season);
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

  calcFinalStats(seasons: Season[], lastSeason: Season, career: CareerOverview): CareerOverview {
    const totalApps = seasons.reduce((acc, s) => acc + s.appearances, 0);
    const teams = seasons.map(s => s.currentTeam?.club as Club);
    const careerStats: CareerOverview = {
      ...career,
      avgLeagueAbility: seasons.reduce((acc, s) => acc + (s.currentTeam as TransferOption).club.leagueDifficulty, 0) / seasons.length,
    };
    const score = calcScore(teams, careerStats);
    const getLongestServedClub = (clubs: Club[]) => {
      // in the event of multiple clubs being the longest, the latest one is chosen
      return clubs.sort((a, b) => clubs.filter(v => v.id === a.id).length - clubs.filter(v => v.id === b.id).length).pop();
    };
    return {
      ...career,
      seasons: totalSeasonsStr('2023/24', lastSeason.year),
      longestServedClub: getLongestServedClub(teams),
      avgRating: (seasons.reduce((acc, s) => acc + s.aggRating, 0) / totalApps).toFixed(2),
      score,
    };
  }
}
