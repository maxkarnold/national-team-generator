import { Component } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { GroupTeam } from 'app/models/nation.model';
import { Region, Tournament32 } from 'app/pages/simulation/simulation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { regions, regionsValidator } from 'app/pages/simulation/simulation.utils';
import nationsModule from 'assets/json/nations.json';
import { getRandFloat, getRandomInt, roundMax } from '@shared/utils';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@UntilDestroy()
@Component({
  selector: 'app-tournament-form',
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.scss'],
})
export class TournamentFormComponent {
  service: SimulationService;
  regions = regions;
  nations = nationsModule;
  nationsList: GroupTeam[] = [];
  filteredNations: GroupTeam[];
  tournament: Tournament32 | null = {};

  hostNation: GroupTeam = {
    name: 'qatar',
    abbreviation: 'qat',
    logo: 'https://fmdataba.com/images/n/QAT.svg',
    region: 'afc',
    points: 0,
    gDiff: 0,
    gFor: 0,
    gOpp: 0,
    tier: 'j',
    attRating: 0,
    midRating: 0,
    defRating: 0,
    rating: 0,
    matchesPlayed: 0,
    matchHistory: {
      qualifiers: [],
      group: [],
      bracket: [],
    },
    ranking: 0,
    attRanking: 0,
    midRanking: 0,
    defRanking: 0,
  };

  tournamentForm = this.fb.group(
    {
      numOfGames: [1, Validators.required],
      numOfTeams: [32, Validators.required],
      availableRegions: [regions, Validators.required],
      hostNation: [this.hostNation, Validators.required],
    },
    { validators: regionsValidator() }
  );

  constructor(service: SimulationService, private fb: FormBuilder) {
    this.service = service;
    this.service.tournament$.pipe(untilDestroyed(this)).subscribe(t => {
      this.tournament = t;
    });

    this.createTeams();
    this.filteredNations = this.nationsList;
    // console.log(this);
    this.setupTournament(1, 32, regions, this.hostNation);
  }

  checkTournamentForm() {
    const {
      numOfGames,
      numOfTeams,
      availableRegions,
      hostNation,
    }: { numOfGames: number; numOfTeams: number; availableRegions: Region[]; hostNation: GroupTeam } = this.tournamentForm.value;
    // console.log(numOfGames, numOfTeams, availableRegions, hostNation);
    this.setupTournament(numOfGames, numOfTeams, availableRegions, hostNation);
  }

  simulateTournamentButton() {
    this.simulateTournament(this.tournamentForm.value.numOfGames);
  }

  groupByFn = (_item: Region) => 'World';

  compareObj(o1: GroupTeam, o2: GroupTeam) {
    return o1?.name === o2?.name;
  }

  compareRegions = (item: Region, selected: Region) => {
    if (selected.value && item.value) {
      return item.value === selected.value;
    }
    return false;
  };

  regionChanged(regionSelected: Region[]) {
    if (!regionSelected) {
      return;
    }
    const regionValues = regionSelected.map(r => r.value);
    this.filteredNations = this.nationsList.filter(nation => regionValues.includes(nation.region));
    this.hostNation = this.filteredNations[getRandomInt(0, this.filteredNations.length - 1)];
    this.tournamentForm.patchValue({ hostNation: this.hostNation });
  }

  createTeams() {
    this.nationsList = [];
    this.nations.forEach(tier => {
      tier.nations.forEach(nation => {
        // random nation values
        let attRating = 0;
        let midRating = 0;
        let defRating = 0;

        switch (nation.ranking) {
          case 's':
            attRating = getRandFloat(80, 100);
            midRating = getRandFloat(80, 100);
            defRating = getRandFloat(80, 100);
            break;
          case 'a':
            attRating = getRandFloat(70, 95);
            midRating = getRandFloat(70, 95);
            defRating = getRandFloat(70, 95);
            break;
          case 'b':
            attRating = getRandFloat(65, 88);
            midRating = getRandFloat(65, 88);
            defRating = getRandFloat(65, 88);
            break;
          case 'c':
            attRating = getRandFloat(60, 88);
            midRating = getRandFloat(60, 88);
            defRating = getRandFloat(60, 88);
            break;
          case 'd':
            attRating = getRandFloat(55, 80);
            midRating = getRandFloat(55, 80);
            defRating = getRandFloat(55, 80);
            break;
          case 'e':
            attRating = getRandFloat(40, 78);
            midRating = getRandFloat(40, 78);
            defRating = getRandFloat(40, 78);
            break;
          case 'f':
            attRating = getRandFloat(30, 70);
            midRating = getRandFloat(30, 70);
            defRating = getRandFloat(30, 70);
            break;
          case 'g':
            attRating = getRandFloat(25, 55);
            midRating = getRandFloat(25, 55);
            defRating = getRandFloat(25, 55);
            break;
          default:
            attRating = getRandFloat(25, 55);
            midRating = getRandFloat(25, 55);
            defRating = getRandFloat(25, 55);
            break;
        }
        const team: GroupTeam = {
          gDiff: 0,
          gFor: 0,
          gOpp: 0,
          points: 0,
          matchesPlayed: 0,
          tier: nation.ranking,
          attRating,
          defRating,
          midRating,
          rating: roundMax(attRating + midRating + defRating),
          ranking: 0,
          attRanking: 0,
          midRanking: 0,
          defRanking: 0,
          name: nation.name,
          logo: nation.logo,
          region: nation.region,
          abbreviation: nation.abbreviation,
          matchHistory: {
            qualifiers: [],
            group: [],
            bracket: [],
          },
        };
        this.nationsList.push(team);
      });
    });
  }

  setupTournament(numOfGames: number, numOfTeams: number, availableRegions: Region[], hostNation: GroupTeam): void {
    this.createTeams();
    const teams = this.service.chooseQualifyingTeams(availableRegions, numOfTeams, this.nationsList, hostNation);
    const numOfGroups = teams.length / 4;
    const extraTeams = numOfTeams % 4;
    const teamsInGroup = teams.length / numOfGroups;

    // if (teams.length === 9) {
    //   teamsInGroup = 3;
    //   extraTeams = numOfTeams % teamsInGroup;
    // }

    const groups = this.service.organizeGroups(teams, extraTeams, teamsInGroup, numOfTeams, hostNation, availableRegions);

    this.service.tournament$.next({
      teams,
      groups,
      availableRegions: availableRegions,
      hostNation: hostNation,
    });

    this.simulateTournament(numOfGames);
  }

  simulateTournament(numOfGames: number): void {
    if (!this.tournament?.teams || !this.tournament?.groups) {
      return;
    }
    const teams = this.tournament.teams;
    const availableRegions = this.tournament.availableRegions;
    const groups = this.service.simulateGroups(numOfGames, this.tournament.groups);

    const { bracket, groupWinners } = this.service.simulateBracket(groups);
    const awards = this.service.getTournamentAwards(bracket, groups, availableRegions);
    this.service.tournament$.next({
      groups,
      groupWinners,
      bracket,
      awards,
      teams,
      availableRegions,
    });
  }
}
