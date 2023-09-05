import { Component, OnInit } from '@angular/core';
import nationsJson from 'assets/json/nations.json';
import clubsJson from 'assets/json/clubs.json';
import { Nation } from 'app/models/nation.model';
import { Club } from 'app/models/club.model';
import { getRandomInts } from '@shared/utils';
import { CareerStats, Season, TransferOption } from './career.constants';
import { getEligibleClubs, newSeasonStr, simulateStats } from './career.utils';
import { originalOrder } from '@shared/utils';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss'],
})
export class CareerComponent implements OnInit {
  originalOrder = originalOrder;
  tableHeaders = ['Year', 'Age', 'Team', 'Info (Transfer)', 'App', 'Goals', 'Assists', 'Avg Rating', 'Wage (£/week)', 'Player Role'];

  currentTransferOptions: TransferOption[] = [];
  nationList: Nation[] = [];
  clubList: Club[] = clubsJson as Club[];
  seasons: Season[] = [];
  finalStats: any[] = [];

  currentCareerStats: CareerStats = {
    currentSeason: '2023/24',
    currentSeasonIndex: 0,
    seasonApps: 0,
    seasonGoals: 0,
    seasonAssists: 0,
    seasonRating: 6.0,
    leagueDifficulty: 'medium',
    age: 14,
    currentAbility: 65,
    potentialAbility: 200,
    currentPlayTime: 'breakthrough prospect',
    currentWage: 150,
  };

  constructor() {
    this.nationList = nationsJson.flatMap(tier => tier.nations) as Nation[];
    // console.log(this.nationList, this.clubList);
  }

  ngOnInit(): void {
    this.currentTransferOptions = this.getTransferChoices(this.currentCareerStats);
  }

  simulateSeason(transferChoice: TransferOption) {
    if (this.currentCareerStats.age > 39) {
      return;
    }
    this.currentCareerStats = simulateStats(transferChoice, this.currentCareerStats);
    const season: Season = {
      year: this.currentCareerStats.currentSeason,
      age: this.currentCareerStats.age,
      team: transferChoice.club,
      info: '',
      appearances: this.currentCareerStats.seasonApps,
      goals: this.currentCareerStats.seasonGoals,
      assists: this.currentCareerStats.seasonAssists,
      avgRating: this.currentCareerStats.seasonRating,
      wage: transferChoice.wage,
      playTime: transferChoice.playingTime,
    };
    console.log('Age: ', this.currentCareerStats.age, 'Current Ability: ', this.currentCareerStats.currentAbility);
    this.seasons.push(season);
    this.currentCareerStats.age++;
    this.currentCareerStats.currentSeasonIndex++;
    this.currentCareerStats.currentSeason = newSeasonStr(season.year);
    this.currentTransferOptions = this.getTransferChoices(this.currentCareerStats);
  }

  getTransferChoices(careerStats: CareerStats): TransferOption[] {
    const clubs = this.clubList.filter(c => c.leagueDifficulty);

    const eligibleClubs = getEligibleClubs(careerStats, clubs);

    if (eligibleClubs.length < 1) {
      this.finalStats = this.calcFinalStats();
    }

    return eligibleClubs;
  }

  calcFinalStats() {
    const totalApps = this.seasons.reduce((acc, s) => acc + s.appearances, 0);
    const teams = this.seasons.map(s => s.team);
    const getLongestServedClub = (clubs: Club[]) => {
      // in the event of multiple clubs being the longest, the latest one is chosen
      return clubs.sort((a, b) => clubs.filter(v => v.id === a.id).length - clubs.filter(v => v.id === b.id).length).pop();
    };
    return [
      this.currentCareerStats.currentSeason,
      this.currentCareerStats.age,
      getLongestServedClub(teams),
      totalApps,
      this.seasons.reduce((acc, s) => acc + s.goals, 0),
      this.seasons.reduce((acc, s) => acc + s.assists, 0),
      (this.seasons.reduce((acc, s) => acc + s.avgRating, 0) / this.seasons.length).toFixed(2),
      this.seasons.reduce((acc, s) => acc + s.wage * 52, 0),
    ];
  }
}
