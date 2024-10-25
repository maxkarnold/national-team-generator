import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import nationsJson from 'assets/json/nations.json';
import clubsJson from 'assets/json/clubs.json';
import { Nation } from 'app/football/models/nation.model';
import { Club } from 'app/football/models/club.model';
import { newSeasonStr, adjustClubStats } from './career.utils';
import { getAbbrevNumber, getAbbrevString, originalOrder } from '@shared/utils';
import { CareerService } from './career.service';
import { fringeRoles, tableHeaders } from './career.constants';
import { sample as _sample } from 'lodash-es';
import { TransferOption } from './club/club.model';
import { CareerOverview, Season, defaultSeasonStats } from './player/player.model';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss'],
})
export class CareerComponent implements OnInit {
  @ViewChild('starRatingModal') starRatingModal!: ElementRef<HTMLDialogElement>;
  originalOrder = originalOrder;
  getAbbrevString = getAbbrevString;
  getAbbrevNumber = getAbbrevNumber;
  tableHeaders = tableHeaders;

  screenWidth: number;
  hasNationality = false;
  currentNationality: Partial<Nation> | Nation = { name: 'random' };
  currentTransferOptions: TransferOption[] = [];
  isLoanOption = false;
  nationList: Nation[] = [];
  clubList: Club[] = clubsJson.filter(c => c.leagueDifficulty && c.clubRating && c.marketValue && c.gamesInSeason) as Club[];
  leagueList: string[] = [];
  seasons: Season[] = [];
  finalStats: CareerOverview[] = [];
  currentCareerOverview: CareerOverview = {
    seasons: '',
    yearsActive: 0,
    totalStats: { ...defaultSeasonStats },
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
    clubStats: [],
    nationality: this.currentNationality,
  };

  currentSeason: Season = {
    year: '2023/24',
    id: 0,
    stats: { ...defaultSeasonStats },
    leagueDifficulty: 'medium',
    age: 14,
    currentAbility: 65,
    potentialAbility: 200,
  };

  constructor(private service: CareerService) {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    this.leagueList = [...new Set(this.clubList.map(a => a.league.slice(0, 3)))];
    this.nationList = nationsJson
      .flatMap(tier => tier.nations as Nation[])
      .filter(n => this.leagueList.includes(n.abbreviation)) as Nation[];
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    const store = localStorage.getItem('career_overview');
    if (store) {
      this.finalStats = JSON.parse(store).slice(0, 4);
    }
  }

  compareFn(o1: Partial<Nation>, o2: Partial<Nation>): boolean {
    return o1?.name === o2?.name;
  }

  consoleLogCareer(career: CareerOverview) {
    console.log(career);
  }

  pickNationality() {
    if (this.currentNationality.name === 'random') {
      this.currentNationality = _sample(this.nationList) || this.currentNationality;
    }
    this.currentTransferOptions = this.getTransferChoices(this.currentSeason, this.currentNationality);
    this.currentCareerOverview.nationality = this.currentNationality;
    this.hasNationality = true;
  }

  simulateSeason(transferChoice: TransferOption) {
    if (this.currentSeason.age > 39) {
      return;
    }
    if (fringeRoles.includes(transferChoice.playingTime) && !this.isLoanOption) {
      this.currentTransferOptions = this.getTransferChoices(this.currentSeason, this.currentNationality, transferChoice, true);
      this.isLoanOption = true;
      return;
    }
    this.currentSeason = this.service.simulateSeasonStats(transferChoice, this.currentSeason, this.currentCareerOverview);
    const season: Season = {
      ...this.currentSeason,
      currentClub: transferChoice,
    };

    // console.log('Age: ', this.currentSeason.age, 'Current Ability: ', this.currentSeason.currentAbility, this.currentSeason);

    // Take the currentSeason and adjust the club stats for that club, will either add a new club to clubStats array or update an existing club
    this.currentCareerOverview.clubStats = adjustClubStats(this.currentCareerOverview.clubStats, season);
    this.currentCareerOverview.yearsActive++;
    this.currentCareerOverview.totalStats.allComps.appearances.starts += season.stats.allComps.appearances.starts;
    this.currentCareerOverview.totalStats.allComps.goals += season.stats.allComps.goals;
    this.currentCareerOverview.totalStats.allComps.assists += season.stats.allComps.assists;
    this.currentCareerOverview.totalEarnings += (season.currentClub?.wage || 0) * 52;
    this.currentCareerOverview.totalPossibleApps += season.currentClub?.club.gamesInSeason || 0;

    if (this.currentCareerOverview.peakAbility < season.currentAbility) {
      this.currentCareerOverview.peakAbility = season.currentAbility;
    }

    if (season.currentClub && this.currentCareerOverview.peakClubAbility < season.currentClub?.club.clubRating) {
      this.currentCareerOverview.peakClubAbility = season.currentClub.club.clubRating;
    }

    this.seasons.push(season);

    this.currentSeason = {
      ...this.currentSeason,
      stats: { ...defaultSeasonStats },
      age: this.currentSeason.age + 1,
      id: this.currentSeason.id + 1,
      year: newSeasonStr(season.year),
    };
    console.log('TEST1', this.seasons, this.currentSeason);

    this.isLoanOption = false;
    this.currentTransferOptions = this.getTransferChoices(
      this.currentSeason,
      this.currentNationality,
      season.currentClub?.parentClub || false
    );
  }

  getTransferChoices(
    careerStats: Season,
    nation: Nation | Partial<Nation>,
    parentClub: TransferOption | false = false,
    hasLoanOption: boolean = false
  ): TransferOption[] {
    const league = nation.name !== 'random' && nation.abbreviation ? nation.abbreviation : 'random';
    const eligibleClubs = this.service.getEligibleClubs(careerStats, this.clubList, league, parentClub, hasLoanOption);
    if (eligibleClubs.length < 1 && this.currentSeason.id > 1) {
      this.finalStats.unshift(this.service.calcFinalStats(this.seasons, this.currentSeason, this.currentCareerOverview));
      localStorage.setItem('career_overview', JSON.stringify(this.finalStats));
    }

    return eligibleClubs;
  }
}
