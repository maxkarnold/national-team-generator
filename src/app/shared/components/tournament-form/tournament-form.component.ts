import { Component } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { defaultHost, GroupTeam } from 'app/models/nation.model';
import { Region, Tournament32 } from 'app/pages/simulation/simulation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { addRankings, regions, regionsValidator } from 'app/pages/simulation/simulation.utils';
import nationsModule from 'assets/json/nations.json';
import { getRandFloat, getRandomInt, roundMax } from '@shared/utils';
import { FormBuilder, Validators } from '@angular/forms';
import { SimulationQualifiersService } from 'app/pages/simulation/simulation-qualifiers.service';

@UntilDestroy()
@Component({
  selector: 'app-tournament-form',
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.scss'],
})
export class TournamentFormComponent {
  simulator: SimulationService;
  qualifier: SimulationQualifiersService;
  regions = regions;
  nations = nationsModule;
  nationsList: GroupTeam[] = [];
  filteredNations: GroupTeam[];
  tournament: Tournament32 | null = {};

  hostNation = defaultHost;

  tournamentForm = this.fb.group(
    {
      numOfGames: [1, Validators.required],
      numOfTeams: [32, Validators.required],
      availableRegions: [regions, Validators.required],
      hostNation: [this.hostNation, Validators.required],
    },
    { validators: regionsValidator() }
  );

  constructor(simulator: SimulationService, qualifier: SimulationQualifiersService, private fb: FormBuilder) {
    this.simulator = simulator;
    this.qualifier = qualifier;
    this.simulator.tournament$.pipe(untilDestroyed(this)).subscribe(t => {
      this.tournament = t;
    });

    this.createTeams();
    this.filteredNations = this.nationsList;
    this.setupTournament(1, 32, regions, this.hostNation);
  }

  checkTournamentForm() {
    const {
      numOfGames,
      numOfTeams,
      availableRegions,
      hostNation,
    }: { numOfGames: number; numOfTeams: number; availableRegions: Region[]; hostNation: GroupTeam } = this.tournamentForm.value;
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
    this.simulator.tournament$.next(null);
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
          reportCard: {
            grade: null,
            gradeStyle: null,
            gradeSummary: null,
            tournamentFinish: null,
          },
        };
        this.nationsList.push(team);
      });
    });
  }

  setupTournament(numOfGames: number, numOfTeams: number, availableRegions: Region[], hostNation: GroupTeam): void {
    this.createTeams();
    const nations = addRankings(this.nationsList);
    const allTeams = {
      rankings: [...nations],
      attRankings: [...nations.sort((a, b) => a.attRanking - b.attRanking)],
      midRankings: [...nations.sort((a, b) => a.midRanking - b.midRanking)],
      defRankings: [...nations.sort((a, b) => a.defRanking - b.defRanking)],
    };
    const teams = this.qualifier.chooseQualifyingTeams(availableRegions, numOfTeams, this.nationsList, hostNation);
    const numOfGroups = teams.length / 4;
    const extraTeams = numOfTeams % 4;
    const teamsInGroup = teams.length / numOfGroups;

    // if (teams.length === 9) {
    //   teamsInGroup = 3;
    //   extraTeams = numOfTeams % teamsInGroup;
    // }

    const groups = this.qualifier.organizeGroups(teams, extraTeams, teamsInGroup, numOfTeams, hostNation, availableRegions);

    this.simulator.tournament$.next({
      allTeams,
      groups,
      availableRegions: availableRegions,
      hostNation: hostNation,
    });

    this.simulateTournament(numOfGames);
  }

  simulateTournament(numOfGames: number): void {
    if (!this.tournament?.allTeams || !this.tournament?.groups) {
      return;
    }
    const allTeams = this.tournament.allTeams;
    const availableRegions = this.tournament.availableRegions;
    const groups = this.simulator.simulateGroups(numOfGames, this.tournament.groups);

    const { bracket, groupWinners } = this.simulator.simulateBracket(groups);
    const awards = this.simulator.getTournamentAwards(bracket, groups, availableRegions);
    this.simulator.tournament$.next({
      groups,
      groupWinners,
      bracket,
      awards,
      allTeams,
      availableRegions,
    });
  }
}
