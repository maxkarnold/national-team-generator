import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/services/firestore.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getRandFloat, getRandomInt, getRandomPersonality, pickSingleLastName } from '@shared/utils';
import { baseTeam, defaultHost32, defaultHosts48, GroupTeam, Nation } from 'app/models/nation.model';
import { Person } from 'app/models/player.model';
import { LeaderboardItem, LeaderboardService } from 'app/pages/leaderboard/leaderboard.service';
import { SimulationQualifiersService } from 'app/pages/simulation/simulation-qualifiers.service';
import { Region, Tournament } from 'app/pages/simulation/simulation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { addRankings, getHostNations, regions, regionsValidator, validateHosts } from 'app/pages/simulation/simulation.utils';
import nationsModule from 'assets/json/nations.json';
import { forkJoin } from 'rxjs';
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
  tournament: Tournament | null = {};
  cannotSave = true;
  localData: LeaderboardItem[] | null = null;
  drawData: GroupTeam[][] = [];
  coaches: Person[] = [];

  hostNations: GroupTeam[] = [...defaultHosts48];
  potentialHosts: GroupTeam[];
  buttonDisplay = 'Setup Tournament and Save';

  tournamentForm = this.fb.group(
    {
      numOfGames: [1, Validators.required],
      numOfTeams: [48, Validators.required],
      availableRegions: [regions, Validators.required],
      hostNations: [this.hostNations, [Validators.required, validateHosts]],
    },
    { validators: regionsValidator() }
  );

  constructor(
    simulator: SimulationService,
    qualifier: SimulationQualifiersService,
    auth: AuthService,
    leaderboard: LeaderboardService,
    private fb: UntypedFormBuilder,
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

    this.filteredNations = updatedNations.length === 156 ? updatedNations : this.nationsList;

    const numOfTeams: 32 | 48 = this.tournamentForm.value.numOfTeams;
    const numOfGames: number = this.tournamentForm.value.numOfGames;
    this.potentialHosts = [];
    this.coaches = this.leaderboard.fetchLocalNames() || [];
    this.setupTournament(numOfGames, numOfTeams, regions, this.hostNations);
  }

  checkTournamentForm() {
    const {
      numOfGames,
      numOfTeams,
      availableRegions,
      hostNations,
    }: { numOfGames: number; numOfTeams: 32 | 48; availableRegions: Region[]; hostNations: GroupTeam[] } = this.tournamentForm.value;
    this.setupTournament(numOfGames, numOfTeams, availableRegions, hostNations);
  }

  simulateTournamentButton() {
    if (!this.tournament?.groups) {
      return;
    }
    this.simulateTournament(this.tournament, this.tournamentForm.value.numOfGames);
  }

  // addCoaches() {
  //   if (!window.confirm('This may take a minute. Are you sure?')) {
  //     return;
  //   }
  //   this.simulator.isLoading$.next(true);
  //   forkJoin(this.simulator.getCoachInfo(this.nationsList))
  //     .pipe(untilDestroyed(this))
  //     .subscribe(names => {
  //       const coachesArr: Person[] = names.map(n => {
  //         const potentialAges = [getRandomInt(35, 75), getRandomInt(45, 65), getRandomInt(45, 65)];
  //         const age = potentialAges[getRandomInt(0, 2)];
  //         const { firstNames, lastNames, firstNameUsage, lastNameUsage, nationality } = n;
  //         return {
  //           ...n,
  //           firstNames: firstNames,
  //           lastNames: lastNames,
  //           singleLastName: pickSingleLastName(lastNames),
  //           origin: nationality,
  //           personality: getRandomPersonality(),
  //           firstNameUsage,
  //           lastNameUsage,
  //           nationality,
  //           age,
  //         };
  //       });
  //       this.leaderboard.saveLocalStorage('names', coachesArr);
  //       this.coaches = coachesArr;
  //       this.simulator.isLoading$.next(false);
  //       this.snackbar.open('Coaches successfully added. Setup new tournament to see coaches.', 'Dismiss');
  //     });
  // }

  setupAndSaveTournament() {
    const {
      numOfGames,
      numOfTeams,
      availableRegions,
      hostNations,
    }: { numOfGames: number; numOfTeams: 32 | 48; availableRegions: Region[]; hostNations: GroupTeam[] } = this.tournamentForm.value;

    this.localData = this.leaderboard.fetchLocalStorage();
    if (this.user) {
      this.setupTournament(numOfGames, numOfTeams, availableRegions, hostNations, true);
    } else if (this.localData && this.localData?.length > 9) {
      this.snackbar.open('Already saved 10 Tournaments. Please wait 24 hours to save a new one.', 'Dismiss');
    } else if (!this.user) {
      this.snackbar.open('Please login before submitting', 'Dismiss');
    }
    return;
  }

  groupRegion = (_item: Region) => 'World';
  groupHosts = (host: GroupTeam) => host.region.toUpperCase();

  compareArr(array1: GroupTeam[], array2: GroupTeam[]) {
    if (array1 && array2 && array1.length === array2.length) {
      return array1.every(t => array2.map(n => n.name).includes(t.name));
    }
    return false;
  }

  compareRegions = (item: Region, selected: Region) => {
    if (selected.value && item.value) {
      return item.value === selected.value;
    }
    return false;
  };

  compareHosts = (item: GroupTeam, selected: GroupTeam) => {
    if (selected.name && item.name) {
      return item.name === selected.name;
    }
    return false;
  };

  regionChanged(regionSelected: Region[]) {
    if (!regionSelected) {
      return;
    }
    const regionValues = regionSelected.map(r => r.value);
    const numOfTeams = this.tournamentForm.value.numOfTeams;

    this.filteredNations = this.nationsList.filter(nation => regionValues.includes(nation.region));
    const newHostNations = this.tournamentForm.value.hostNations.filter((nation: GroupTeam) => regionValues.includes(nation.region));
    this.tournamentForm.patchValue({ hostNations: newHostNations });
    this.potentialHosts = getHostNations(this.filteredNations, numOfTeams);
    this.cannotSaveCheck(regionSelected.length, this.tournamentForm.value.numOfGames);
  }

  hostChanged(hosts: GroupTeam[]) {
    const numOfTeams: number = this.tournamentForm.value.numOfTeams;
    const maxSelectedItems = numOfTeams > 32 ? 3 : 2;
    if (hosts.length === maxSelectedItems) {
      this.potentialHosts = [];
    } else if (hosts.length > 0) {
      const cohosts = numOfTeams > 32 ? hosts.flatMap(h => h.cohosts48) : hosts.flatMap(h => h.cohosts32);
      this.potentialHosts = getHostNations(this.filteredNations, numOfTeams).filter(c => cohosts.includes(c.name));
    } else {
      this.potentialHosts = getHostNations(this.filteredNations, numOfTeams);
    }
  }

  numOfTeamsChanged(str: string) {
    const numOfTeams = parseInt(str, 10);
    const hostNations = [];
    if (numOfTeams === 48) {
      const hosts48 = getHostNations(this.filteredNations, numOfTeams);
      hostNations.push(...hosts48);
    } else if (numOfTeams === 32) {
      hostNations.push(defaultHost32);
    }
    this.tournamentForm.patchValue({ hostNations });
    this.hostChanged(this.tournamentForm.value.hostNations);
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
      for (const nation of tier.nations) {
        this.nationsList.push(baseTeam(this.tournamentForm.value.hostNations, nation as Nation));
      }
    });
  }

  setupTournament(numOfGames: number, numOfTeams: 32 | 48, availableRegions: Region[], hostNations: GroupTeam[], save?: boolean): void {
    // console.log('TESTS\n\n\n\n\n\n\n\n\n\n\nSETUP TOURNAMENT', numOfTeams);
    this.createTeams();

    if (this.coaches.length > 0) {
      this.nationsList = this.nationsList.map(n => {
        const coach = this.coaches.find(c => c.nationality === n.name);
        if (coach) {
          // only coaches in their prime years are allowed to be at the top
          const ageTax = coach.age > 65 || coach.age < 45 ? 9 : 0;
          const lowerRating = n.rating - 15 > 25 ? n.rating - 15 : 25;
          const higherRating = n.rating + 15 < 99 - ageTax ? n.rating + 15 : 99 - ageTax;
          return {
            ...n,
            coach: {
              ...coach,
              rating: getRandFloat(lowerRating, higherRating),
            },
          };
        }
        return n;
      });
    }

    const nations = addRankings(this.nationsList, this.coaches.length > 0);
    const allTeams = {
      rankings: [...nations],
      attRankings: [...nations.sort((a, b) => a.attRanking - b.attRanking)],
      midRankings: [...nations.sort((a, b) => a.midRanking - b.midRanking)],
      defRankings: [...nations.sort((a, b) => a.defRanking - b.defRanking)],
    };
    const teams = this.qualifier.chooseQualifyingTeams(availableRegions, numOfTeams, nations, hostNations);
    const numOfGroups = teams.length / 4; // groups of 4
    const teamsInGroup = teams.length / numOfGroups; // usually going to be 4

    this.qualifier.organizeGroups(teams, teamsInGroup, numOfTeams, hostNations, availableRegions);

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
        const tournament = { allTeams, availableRegions, hostNations, ...t };
        this.simulator.tournament$.next({
          groups: tournament.groups,
          allTeams,
          availableRegions,
          hostNations,
        });

        this.simulateTournament(tournament, numOfGames, save);
      });
  }

  simulateTournament(tournament: Tournament, numOfGames: number, save?: boolean): void {
    const groupsArr = tournament.groups || [];

    const hostNations = tournament.hostNations;
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
    console.log(this.tournament);

    if (save) {
      this.saveTournament(awards, groups, hostNations);
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
    hostNations?: GroupTeam[]
  ) {
    const data = this.localData || [];
    if (data.length === 10 && new Date().toDateString() === data[0]?.time) {
      this.snackbar.open('Cannot submit more than 10 tournaments per day.', 'Dismiss');
      return;
    }
    // can save 10 tournaments per day, otherwise must wait 24 hours since 10th tournament
    const filteredData = data.length > 9 ? data.slice(Math.max(data.length - 9, 0)) : data;

    const hosts = groups.flat().filter(n => hostNations?.includes(n));
    const worstRank = groups.flat().reduce((prev, curr) => (prev.ranking < curr.ranking || !hosts.includes(curr) ? curr : prev));
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
