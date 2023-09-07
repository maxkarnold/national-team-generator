import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import nationsJson from 'assets/json/nations.json';
import clubsJson from 'assets/json/clubs.json';
import { Nation } from 'app/models/nation.model';
import { Club } from 'app/models/club.model';
import { CareerOverview, Season, TransferOption } from './career.model';
import { newSeasonStr, tableHeaders, isHalfStar } from './career.utils';
import { originalOrder } from '@shared/utils';
import { StarRatingConfigService } from 'angular-star-rating';
import { CustomStarRatingService } from './custom-star-rating.service';
import { CareerService } from './career.service';
import { StarRatingDialogComponent } from '@shared/components';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss'],
  providers: [
    {
      provide: StarRatingConfigService,
      useClass: CustomStarRatingService,
    },
  ],
})
export class CareerComponent implements OnInit {
  @ViewChild('myModal') myModal!: ElementRef<HTMLDialogElement>;
  originalOrder = originalOrder;
  isHalfStar = isHalfStar;
  tableHeaders = tableHeaders;

  currentTransferOptions: TransferOption[] = [];
  nationList: Nation[] = [];
  clubList: Club[] = clubsJson as Club[];
  seasons: Season[] = [];
  finalStats: CareerOverview[] = [];
  currentCareerOverview: CareerOverview = {
    seasons: '',
    yearsActive: 0,
    totalApps: 0,
    totalGoals: 0,
    totalAssists: 0,
    avgRating: '',
    totalEarnings: 0,
    score: {
      totalScore: 0,
      abilityScore: 0,
      peakClubScore: 0,
      avgLeagueScore: 0,
      availabilityScore: 0,
      goalScore: 0,
    },
    peakAbility: 0,
    peakClubAbility: 0,
    avgLeagueAbility: 0,
    totalPossibleApps: 0,
  };

  currentSeason: Season = {
    year: '2023/24',
    id: 0,
    appearances: 0,
    goals: 0,
    assists: 0,
    avgRating: 6.0,
    leagueDifficulty: 'medium',
    age: 14,
    currentAbility: 65,
    potentialAbility: 200,
    aggRating: 0,
  };

  constructor(private service: CareerService) {
    this.nationList = nationsJson.flatMap(tier => tier.nations) as Nation[];
  }

  ngOnInit(): void {
    this.currentTransferOptions = this.getTransferChoices(this.currentSeason);
    const store = localStorage.getItem('career_overview');
    if (store) {
      this.finalStats = JSON.parse(store).slice(0, 4);
    }
  }

  simulateSeason(transferChoice: TransferOption) {
    if (this.currentSeason.age > 39) {
      return;
    }
    this.currentSeason = this.service.simulateSeasonStats(transferChoice, this.currentSeason);
    const season: Season = {
      ...this.currentSeason,
      currentTeam: transferChoice,
    };
    console.log('Age: ', this.currentSeason.age, 'Current Ability: ', this.currentSeason.currentAbility, this.currentSeason);

    this.currentCareerOverview.yearsActive++;
    this.currentCareerOverview.totalApps += season.appearances;
    this.currentCareerOverview.totalGoals += season.goals;
    this.currentCareerOverview.totalAssists += season.assists;
    this.currentCareerOverview.totalEarnings += (season.currentTeam?.wage || 0) * 52;
    this.currentCareerOverview.totalPossibleApps += season.currentTeam?.club.gamesInSeason || 0;

    if (this.currentCareerOverview.peakAbility < season.currentAbility) {
      this.currentCareerOverview.peakAbility = season.currentAbility;
    }

    if (season.currentTeam && this.currentCareerOverview.peakClubAbility < season.currentTeam?.club.clubRating) {
      this.currentCareerOverview.peakClubAbility = season.currentTeam.club.clubRating;
    }

    this.seasons.push(season);

    this.currentSeason.age++;
    this.currentSeason.id++;
    this.currentSeason.year = newSeasonStr(season.year);
    this.currentTransferOptions = this.getTransferChoices(this.currentSeason);
  }

  getTransferChoices(careerStats: Season): TransferOption[] {
    const clubs = this.clubList.filter(c => c.leagueDifficulty);

    const eligibleClubs = this.service.getEligibleClubs(careerStats, clubs);

    if (eligibleClubs.length < 1) {
      this.finalStats.unshift(this.service.calcFinalStats(this.seasons, this.currentSeason, this.currentCareerOverview));
      localStorage.setItem('career_overview', JSON.stringify(this.finalStats));
    }

    return eligibleClubs;
  }
}
