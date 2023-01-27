import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/services/firestore.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getRandFloat, getRandomInt } from '@shared/utils';
import { defaultHost, GroupTeam } from 'app/models/nation.model';
import { LeaderboardItem, LeaderboardService } from 'app/pages/leaderboard/leaderboard.service';
import { SimulationQualifiersService } from 'app/pages/simulation/simulation-qualifiers.service';
import { Region, Tournament32 } from 'app/pages/simulation/simulation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { addRankings, regions, regionsValidator } from 'app/pages/simulation/simulation.utils';
import nationsModule from 'assets/json/nations.json';
import { filter, take } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-tournament-form',
  templateUrl: './tournament-form.component.html',
  styleUrls: ['./tournament-form.component.scss'],
})
export class TournamentFormComponent {
  simulator: SimulationService;
  qualifier: SimulationQualifiersService;
  leaderboard: LeaderboardService;
  user: User | null = null;
  regions = regions;
  nations = nationsModule;
  nationsList: GroupTeam[] = [];
  filteredNations: GroupTeam[];
  tournament: Tournament32 | null = {};
  coaches = [];
  cannotSave = true;
  localData: LeaderboardItem[] | null = null;
  drawData: GroupTeam[][] = [];

  hostNation = defaultHost;
  buttonDisplay = 'Setup Tournament and Save';

  tournamentForm = this.fb.group(
    {
      numOfGames: [1, Validators.required],
      numOfTeams: [32, Validators.required],
      availableRegions: [regions, Validators.required],
      hostNation: [this.hostNation, Validators.required],
    },
    { validators: regionsValidator() }
  );

  constructor(
    simulator: SimulationService,
    qualifier: SimulationQualifiersService,
    auth: AuthService,
    leaderboard: LeaderboardService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) {
    this.simulator = simulator;
    this.qualifier = qualifier;
    this.leaderboard = leaderboard;
    this.snackbar = snackbar;
    auth.user$.pipe(untilDestroyed(this)).subscribe(user => {
      this.user = user;
    });

    this.cannotSaveCheck();
    this.createTeams();

    // const updatedNations = this.simulator.getPersonInfo(this.nationsList);
    const updatedNations = this.nationsList;

    this.filteredNations = updatedNations.length === 155 ? updatedNations : this.nationsList;
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
    if (!this.tournament?.groups) {
      return;
    }
    this.simulateTournament(this.tournament, this.tournamentForm.value.numOfGames);
  }

  setupAndSaveTournament() {
    const {
      numOfGames,
      numOfTeams,
      availableRegions,
      hostNation,
    }: { numOfGames: number; numOfTeams: number; availableRegions: Region[]; hostNation: GroupTeam } = this.tournamentForm.value;

    this.localData = this.leaderboard.fetchLocalStorage();
    if (this.user) {
      this.setupTournament(numOfGames, numOfTeams, availableRegions, hostNation, true);
    } else if (this.localData && this.localData?.length > 9) {
      this.snackbar.open('Already saved 10 Tournaments. Please wait 24 hours to save a new one.', 'Dismiss');
    } else if (!this.user) {
      this.snackbar.open('Please login before submitting', 'Dismiss');
    }
    return;
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
    this.cannotSaveCheck(regionSelected.length, this.tournamentForm.value.numOfGames);
  }

  numOfGamesChanged(value: number) {
    this.cannotSaveCheck(this.tournamentForm.value.availableRegions.length, value);
  }

  cannotSaveCheck(availableRegions = 6, numOfGames = 1) {
    this.cannotSave = !(this.tournamentForm.valid && availableRegions === 6 && numOfGames === 1);
  }

  createTeams() {
    this.simulator.tournament$.next(null);
    this.nationsList = [];
    this.nations.forEach(tier => {
      tier.nations.forEach(nation => {
        // random nation values
        let min = 0;
        let max = 0;

        switch (nation.ranking) {
          case 's':
            min = 80;
            max = 100;
            break;
          case 'a':
            min = 70;
            max = 95;
            break;
          case 'b':
            min = 65;
            max = 88;
            break;
          case 'c':
            min = 60;
            max = 88;
            break;
          case 'd':
            min = 55;
            max = 80;
            break;
          case 'e':
            min = 40;
            max = 78;
            break;
          case 'f':
            min = 30;
            max = 70;
            break;
          case 'g':
            min = 25;
            max = 55;
            break;
          default:
            min = 25;
            max = 55;
            break;
        }
        const attRating = getRandFloat(min, max);
        const midRating = getRandFloat(min, max);
        const defRating = getRandFloat(min, max);
        const penRating = getRandFloat(min, max);
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
          penRating,
          rating: (attRating + midRating + defRating) / 3,
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
          emoji: nation.emoji,
          homeTeam: this.hostNation.name === nation.name ? true : false,
        };
        this.nationsList.push(team);
      });
    });
  }

  setupTournament(numOfGames: number, numOfTeams: number, availableRegions: Region[], hostNation: GroupTeam, save?: boolean): void {
    this.createTeams();
    const nations = addRankings(this.nationsList);
    const allTeams = {
      rankings: [...nations],
      attRankings: [...nations.sort((a, b) => a.attRanking - b.attRanking)],
      midRankings: [...nations.sort((a, b) => a.midRanking - b.midRanking)],
      defRankings: [...nations.sort((a, b) => a.defRanking - b.defRanking)],
    };
    const teams = this.qualifier.chooseQualifyingTeams(availableRegions, numOfTeams, nations, hostNation);
    const numOfGroups = teams.length / 4;
    const extraTeams = numOfTeams % 4;
    const teamsInGroup = teams.length / numOfGroups;

    // if (teams.length === 9) {
    //   teamsInGroup = 3;
    //   extraTeams = numOfTeams % teamsInGroup;
    // }

    this.qualifier.organizeGroups(teams, extraTeams, teamsInGroup, numOfTeams, hostNation, availableRegions);

    this.simulator.tournament$
      .pipe(
        untilDestroyed(this),
        filter(t => (t?.groups ? true : false)),
        take(1)
      )
      .subscribe(t => {
        if (!t?.groups) {
          return;
        }
        const tournament = { allTeams, availableRegions, hostNation, ...t };
        this.simulator.tournament$.next({
          groups: tournament.groups,
          allTeams,
          availableRegions,
          hostNation,
        });

        this.simulateTournament(tournament, numOfGames, save);
      });
  }

  simulateTournament(tournament: Tournament32, numOfGames: number, save?: boolean): void {
    const groupsArr = tournament.groups || [];

    const hostNation = tournament.hostNation;
    const allTeams = tournament.allTeams;
    const availableRegions = tournament.availableRegions;
    const groups = this.simulator.simulateGroups(numOfGames, groupsArr);
    const { bracket, groupWinners } = this.simulator.simulateBracket(groups);
    const awards = this.simulator.getTournamentAwards(bracket, groups, availableRegions);
    const newTournament = {
      groups,
      groupWinners,
      bracket,
      awards,
      allTeams,
      availableRegions,
    };

    this.simulator.tournament$.next(newTournament);
    this.tournament = newTournament;

    if (save) {
      this.saveTournament(awards, groups, hostNation);
    }
  }

  saveTournament(
    awards: [
      GroupTeam,
      GroupTeam,
      GroupTeam,
      GroupTeam,
      GroupTeam,
      (GroupTeam | undefined)?,
      (GroupTeam | undefined)?,
      (GroupTeam | undefined)?,
      (GroupTeam | undefined)?,
      (GroupTeam | undefined)?,
      (GroupTeam | undefined)?
    ],
    groups: GroupTeam[][],
    hostNation?: GroupTeam
  ) {
    const data = this.localData || [];
    if (data.length === 10 && new Date().toDateString() === data[0]?.time) {
      this.snackbar.open('Cannot submit more than 10 tournaments per day.', 'Dismiss');
      return;
    }
    // can save 10 tournaments per day, otherwise must wait 24 hours since 10th tournament
    const filteredData = data.length > 9 ? data.slice(Math.max(data.length - 9, 0)) : data;

    const host = groups.flat().find(n => n.name === hostNation?.name);
    const worstRank = groups.flat().reduce((prev, curr) => (prev.ranking < curr.ranking || curr.name !== host?.name ? curr : prev));
    filteredData.push({
      time: new Date().toDateString(),
      tournament: {
        winner: awards[0].name,
        winnerRank: awards[0].ranking,
        worst: worstRank.name,
        worstRank: worstRank.ranking,
        second: awards[1].name,
        third: awards[2].name,
      },
    });
    console.log(filteredData);
    this.leaderboard.saveLocalStorage('tournamentSubmitted24Hours', filteredData);
    this.snackbar.open('Tournament Submitted', 'Dismiss');
  }
}
