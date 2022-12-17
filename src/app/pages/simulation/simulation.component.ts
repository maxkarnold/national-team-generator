import { Component, OnInit } from '@angular/core';
import {
  getRandFloat,
  getRandomInt,
  roundMax,
  shuffle,
  groupLetters,
} from '@shared/utils';
import { GroupTeam } from 'app/models/nation.model';
import nationsModule from 'assets/json/nations.json';
import { get, set } from 'lodash';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent {
  nations = nationsModule;
  nationsList: GroupTeam[] = [];
  hostNation: GroupTeam = {
    name: 'qatar',
    logo: 'https://fmdataba.com/images/n/QAT.svg',
    region: 'afc',
    points: 0,
    gDiff: 0,
    gFor: 0,
    gOpp: 0,
    tier: 'j',
    attRating: 0,
    defRating: 0,
    rating: 0,
    matchesPlayed: 0,
  };

  headings = ['RTG', 'MP', 'PTS', 'GD', 'GS', 'GA'];
  numberOfTeams = 32;
  groupGamesPerOpponent = 1;

  groupLetters = groupLetters;

  tournament: {
    teams?: GroupTeam[];
    groups?: GroupTeam[][];
  } = {};

  constructor() {
    this.createTeams();
    this.setupTournament();
  }

  setupTournament() {
    this.tournament = {};

    const teams = this.chooseQualifyingTeams();
    const numOfGroups = teams.length / 4;
    let extraTeams = this.numberOfTeams % 4;
    let teamsInGroup = teams.length / numOfGroups;

    if (teams.length === 9) {
      teamsInGroup = 3;
      extraTeams = this.numberOfTeams % teamsInGroup;
    }

    const groups = this.organizeGroups(teams, extraTeams, teamsInGroup);

    this.tournament = {
      teams,
      groups,
    };
  }

  organizeGroups(teams: GroupTeam[], extraTeams: number, teamsInGroup: number) {
    let group = [];
    let count = 0;

    // if (this.numberOfTeams === 32) {
    //   return this.potDraw(teams, extraTeams, teamsInGroup);
    // }

    const groups: GroupTeam[][] = [];

    // if the team numbers don't divide by 4
    // for each team place them in a group until there is 4 in group
    for (let i = 0; i < teams.length; i++) {
      if (teams.length - i <= extraTeams) {
        // if extra teams need a group
        for (let j = 0; j < groups.length; j++) {
          if (groups[j].length < 5) {
            groups[j].push(teams[i]);
            break;
          }
        }
      } else {
        group.push(teams[i]);
        count++;
        // console.log(teams[i].name, count);
        if (count === teamsInGroup) {
          // when right group size (usually 4 teams), add the group and create new group
          // console.log(group, count);
          groups.push(group);
          count = 0;
          group = [];
        }
      }
    }

    return groups;
  }

  simulateGroupStages() {
    if (!this.tournament.groups) {
      return;
    }

    const { groups } = this.tournament;

    for (let i = 0; i < groups.length; i++) {
      for (let j = 0; j < groups[i].length; j++) {
        // resets
        groups[i][j].points = 0;
        groups[i][j].gDiff = 0;
        groups[i][j].gFor = 0;
        groups[i][j].gOpp = 0;
        groups[i][j].matchesPlayed = 0;
      }
    }
    // go through each group
    // simulate each game and reward that team that many points
    // sort the teams by points
    for (let c = 0; c < this.groupGamesPerOpponent; c++) {
      let goalsFor = 0;
      let goalsAg = 0;
      for (
        let i = 0;
        i < groups.length;
        i++ // for each group
      ) {
        for (let j = 0; j < groups[i].length; j++) {
          // for each team
          const team = groups[i][j];
          for (let k = j + 1; k < groups[i].length; k++) {
            // for each of the other teams play a match
            const otherTeam = groups[i][k];
            goalsFor = getRandomInt(5 - otherTeam.defRating, team.attRating);
            goalsAg = getRandomInt(5 - team.defRating, otherTeam.attRating);
            if (goalsFor > goalsAg) {
              team.points += 3;
              team.gDiff += goalsFor - goalsAg;
              otherTeam.gDiff += goalsAg - goalsFor;
            } else if (goalsFor < goalsAg) {
              otherTeam.points += 3;
              team.gDiff += goalsFor - goalsAg;
              otherTeam.gDiff += goalsAg - goalsFor;
            } else {
              team.points += 1;
              otherTeam.points += 1;
            }
            team.gFor += goalsFor;
            team.gOpp += goalsAg;
            otherTeam.gFor += goalsAg;
            otherTeam.gOpp += goalsFor;
            team.matchesPlayed++;
            otherTeam.matchesPlayed++;
            console.log(
              '',
              team.name,
              team.points,
              goalsFor,
              'GD',
              team.gDiff,
              '\n',
              otherTeam.name,
              otherTeam.points,
              goalsAg,
              'GD',
              otherTeam.gDiff
            );
          }
        }
        groups[i].sort((a, b) => b.points - a.points);
      }
    }

    this.tournament.groups = groups;
  }

  createTeams() {
    this.nationsList = [];
    this.nations.forEach((tier) => {
      tier.nations.forEach((nation) => {
        // random nation values
        let attRating = 0;
        let defRating = 0;
        const t = tier.tier[0];
        switch (t) {
          case 's':
            attRating = getRandFloat(4.5, 5);
            defRating = getRandFloat(4.5, 5);
            break;
          case 'a':
            attRating = getRandFloat(4.25, 4.5);
            defRating = getRandFloat(4.25, 4.5);
            break;
          case 'b':
            attRating = getRandFloat(4, 4.25);
            defRating = getRandFloat(4, 4.25);
            break;
          case 'c':
            attRating = getRandFloat(3.75, 4);
            defRating = getRandFloat(3.75, 4);
            break;
          case 'd':
            attRating = getRandFloat(3.5, 3.75);
            defRating = getRandFloat(3.5, 3.75);
            break;
          default:
            attRating = getRandFloat(1, 4);
            defRating = getRandFloat(1, 4);
            break;
        }
        const team = {
          gDiff: 0,
          gFor: 0,
          gOpp: 0,
          points: 0,
          matchesPlayed: 0,
          tier: t,
          attRating,
          defRating,
          rating: roundMax(attRating + defRating),
          name: nation.name,
          logo: nation.logo,
          region: nation.region,
        };
        this.nationsList.push(team);
      });
    });
  }

  chooseQualifyingTeams(): GroupTeam[] {
    // resets
    this.createTeams();
    // choose teams based on a multitude of factors that need to be developed
    // this code maybe should go into another service
    // Planned steps to choose teams:
    // 1. shuffle the top teams and choose them randomly
    // 2. iterate through each region and choose teams from each until the right number of teams
    // then shuffle the teams, the same teams are chosen every time
    // 3. create a list of the teams from each region and choose random teams from each region
    // to take up all the spots that are alloted at the world cup for each region
    // this should be realistic based on the number of teams in the tournament
    if (this.numberOfTeams === 32) {
      return this.tournament32Format();
    }

    const regions = {
      caf: 39,
      conmebol: 10,
      afc: 27,
      ofc: 2,
      uefa: 49,
      concacaf: 22,
    };
    let regionsLeft = 6;
    let store: string[] = [];
    const teams: GroupTeam[] = [];
    const nationsLeft = [...this.nationsList];
    for (let i = 0; i < this.numberOfTeams; i++) {
      if (i === 0) {
        const host = nationsLeft.findIndex((t) => t === this.hostNation);
        teams.push(nationsLeft.splice(host, 1)[0]);
        console.log(this.hostNation.name, 'qualifies', i, -1);
        break;
      }
      for (let j = 0; j < nationsLeft.length; j++) {
        if (Object.values(regions).includes(0)) {
          regionsLeft--;
        }
        if (store.length >= regionsLeft) {
          // checks all the regions to be used and also if a lot of teams
          // have been passed because I only have 2 ofc teams
          store = [];
        }
        if (!store.includes(nationsLeft[j].region)) {
          console.log(nationsLeft[j].name, 'qualifies', i, j);
          store.push(nationsLeft[j].region);
          const val = get(regions, nationsLeft[j].region);
          set(regions, nationsLeft[j].region, val - 1);
          teams.push(nationsLeft.splice(j, 1)[0]);
          break;
        }
      }
    }
    return shuffle(teams);
  }

  tournament32Format(): GroupTeam[] {
    console.log(this.hostNation);
    const uefaTeams: GroupTeam[] = [];
    const conmebolTeams: GroupTeam[] = [];
    const afcTeams: GroupTeam[] = [];
    const ofcTeams: GroupTeam[] = [];
    const cafTeams: GroupTeam[] = [];
    const concacafTeams: GroupTeam[] = [];
    const teamsQualified: GroupTeam[] = [];
    const nationsLeft = [...this.nationsList];

    const host = nationsLeft.findIndex((t) => t.name === this.hostNation.name);
    teamsQualified.push(nationsLeft.splice(host, 1)[0]);
    console.log(teamsQualified[0].name, 'qualifies as host');

    nationsLeft.forEach((team) => {
      switch (team.region) {
        case 'uefa':
          uefaTeams.push(team);
          break;
        case 'conmebol':
          conmebolTeams.push(team);
          break;
        case 'afc':
          afcTeams.push(team);
          break;
        case 'ofc':
          ofcTeams.push(team);
          break;
        case 'caf':
          cafTeams.push(team);
          break;
        case 'concacaf':
          concacafTeams.push(team);
          break;
        default:
          throw new Error('no region found on team');
      }
    });

    const allRegions = [
      uefaTeams,
      afcTeams,
      cafTeams,
      concacafTeams,
      conmebolTeams,
      ofcTeams,
    ];

    const qualifyingSpots = [13, 4, 5, 3, 4, 0];
    allRegions.forEach((region, i) => {
      region.sort((a, b) => b.rating - a.rating);
      console.log(...region.slice(0, qualifyingSpots[i]).map((a) => a.name));
      teamsQualified.push(...region.slice(0, qualifyingSpots[i]));
      console.log(
        "didn't make it",
        region.slice(qualifyingSpots[i]).map((a) => a.name)
      );
    });
    console.log('all qualified via region', allRegions);

    const playoff1 =
      afcTeams[4].rating > conmebolTeams[4].rating
        ? afcTeams[4]
        : conmebolTeams[4];
    console.log(playoff1.name, 'qualifies via playoff');
    teamsQualified.push(playoff1);

    const playoff2 =
      concacafTeams[3].rating > ofcTeams[0].rating
        ? concacafTeams[3]
        : ofcTeams[0];
    console.log(playoff2.name, 'qualifies via playoff');
    teamsQualified.push(playoff2);

    return teamsQualified;
  }

  // potDraw(
  //   teams: GroupTeam[],
  //   extraTeams: number,
  //   teamsInGroup: number
  // ): GroupTeam[][] {
  //   const pots = teamsInGroup;
  //   const teamsInPot = teams.length / pots;
  //   const groups: GroupTeam[][] = Array.from(
  //     Array(teamsInPot),
  //     () => new Array(pots)
  //   );
  //   // const groups: GroupTeam[][] = [];
  //   teams.sort((a, b) => b.rating - a.rating);

  //   // assign teams to pots
  //   const potTeams = [];
  //   let index = teamsInPot - 1;
  //   for (let i = 0; i < pots; i++) {
  //     if (i === 0) {
  //       const host = teams.splice(
  //         teams.findIndex((t) => t.name === this.hostNation.name),
  //         1
  //       )[0];
  //       potTeams.push([host, ...teams.slice(0, index)]);
  //     } else {
  //       potTeams.push(teams.slice(index, index + teamsInPot));
  //       index += teamsInPot;
  //     }
  //   }

  //   const store: string[][] = Array.from(
  //     Array(teamsInPot),
  //     () => new Array(pots)
  //   );
  //   // const store: string[][] = [];
  //   // draw teams into groups
  //   potTeams.forEach((pot, i) => {
  //     console.log('test');
  //     for (let j = 0; j < teamsInPot; j++) {
  //       if (
  //         (!store[j].includes(pot[j].region) || pot[j].region === 'uefa') &&
  //         store[j].length < i + 1
  //       ) {
  //         groups[j].push(pot[j]);
  //         store[j].push(pot[j].region);
  //         console.log(
  //           `${pot[j].name} goes in ${j + 1} at position ${groups[j].length}`
  //         );
  //       } else {
  //         // if region is already in this group and it's not a uefa team
  //         for (let k = j + 1; k < teamsInPot; k++) {
  //           if (
  //             (!store[k].includes(pot[j].region) || pot[j].region === 'uefa') &&
  //             store[k].length < i + 1
  //           ) {
  //             groups[k].push(pot[j]);
  //             store[k].push(pot[j].region);
  //             console.log(
  //               `${pot[j].name} goes in ${k + 1} at position ${
  //                 groups[k].length
  //               }`
  //             );
  //             break;
  //           }
  //         }
  //       }
  //     }
  //   });

  //   return groups;
  // }

  getNationClass(nation: GroupTeam) {
    return `nation ${nation.region}`;
  }

  compareObj(o1: GroupTeam, o2: GroupTeam) {
    return o1.name === o2.name;
  }
}
