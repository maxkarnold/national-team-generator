import { Component, OnInit } from '@angular/core';
import nationsJson from 'assets/json/nations.json';
import clubsJson from 'assets/json/clubs.json';
import { Nation } from 'app/models/nation.model';
import { Club } from 'app/models/club.model';
import { CareerOverview, CareerStats, Season, TransferOption } from './career.model';
import { calcCareerRating, getEligibleClubs, newSeasonStr, simulateStats, tableHeaders, totalSeasonsStr } from './career.utils';
import { originalOrder } from '@shared/utils';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss'],
})
export class CareerComponent implements OnInit {
  originalOrder = originalOrder;
  tableHeaders = tableHeaders;

  currentTransferOptions: TransferOption[] = [];
  nationList: Nation[] = [];
  clubList: Club[] = clubsJson as Club[];
  seasons: Season[] = [];
  finalStats: CareerOverview[] = [];

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
    aggRating: 0,
  };

  constructor() {
    this.nationList = nationsJson.flatMap(tier => tier.nations) as Nation[];
    // console.log(this.nationList, this.clubList);
  }

  ngOnInit(): void {
    this.currentTransferOptions = this.getTransferChoices(this.currentCareerStats);
    const store = localStorage.getItem('career_overview');
    if (store) {
      this.finalStats = JSON.parse(store).slice(0, 4);
    }
  }

  simulateSeason(transferChoice: TransferOption) {
    const euro = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    if (this.currentCareerStats.age > 39) {
      return;
    }
    this.currentCareerStats = simulateStats(transferChoice, this.currentCareerStats);
    const season: Season = {
      year: this.currentCareerStats.currentSeason,
      age: this.currentCareerStats.age,
      team: transferChoice.club,
      info:
        transferChoice.transferType === 'loan'
          ? 'Loan'
          : transferChoice.transferType === 'n/a'
          ? ''
          : euro.format(transferChoice.transferFee),
      appearances: this.currentCareerStats.seasonApps,
      goals: this.currentCareerStats.seasonGoals,
      assists: this.currentCareerStats.seasonAssists,
      avgRating: this.currentCareerStats.seasonRating,
      wage: transferChoice.wage,
      playTime: transferChoice.playingTime,
      aggRating: this.currentCareerStats.aggRating,
    };
    console.log('Age: ', this.currentCareerStats.age, 'Current Ability: ', this.currentCareerStats.currentAbility, this.currentCareerStats);
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
      this.finalStats.unshift(this.calcFinalStats());
      localStorage.setItem('career_overview', JSON.stringify(this.finalStats));
    }

    return eligibleClubs;
  }

  calcFinalStats(): CareerOverview {
    const totalApps = this.seasons.reduce((acc, s) => acc + s.appearances, 0);
    const teams = this.seasons.map(s => s.team);
    const careerRating = calcCareerRating();
    const getLongestServedClub = (clubs: Club[]) => {
      // in the event of multiple clubs being the longest, the latest one is chosen
      return clubs.sort((a, b) => clubs.filter(v => v.id === a.id).length - clubs.filter(v => v.id === b.id).length).pop();
    };
    return {
      seasons: totalSeasonsStr('2023/24', this.currentCareerStats.currentSeason),
      yearsActive: this.currentCareerStats.age - 14,
      longestServedClub: getLongestServedClub(teams),
      totalApps,
      totalGoals: this.seasons.reduce((acc, s) => acc + s.goals, 0),
      totalAssists: this.seasons.reduce((acc, s) => acc + s.assists, 0),
      avgRating: (this.seasons.reduce((acc, s) => acc + s.aggRating, 0) / totalApps).toFixed(2),
      totalEarnings: this.seasons.reduce((acc, s) => acc + s.wage * 52, 0),
      careerRating,
    };
  }
}
