import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  getRandFloat,
  getRandomInt,
  roundMax,
  shuffle,
  groupLetters,
  compare,
} from '@shared/utils';
import nationsModule from 'assets/json/nations.json';
import { get, set } from 'lodash';
import {
  Match,
  GroupTeam,
  Tournament32,
  TournamentStats,
} from './simulation.model';

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

  tournament: Tournament32 | undefined;

  constructor() {
    this.createTeams();
    this.setupTournament();
  }

  setupTournament() {
    this.tournament = undefined;
    const teams = this.chooseQualifyingTeams();
    const numOfGroups = teams.length / 4;
    let extraTeams = this.numberOfTeams % 4;
    let teamsInGroup = teams.length / numOfGroups;

    if (teams.length === 9) {
      teamsInGroup = 3;
      extraTeams = this.numberOfTeams % teamsInGroup;
    }

    const groups = this.organizeGroups(teams, extraTeams, teamsInGroup);
    console.log(
      groups.map((group) =>
        group.map((team) => `${team.region} ${team.name} ${team.pot}`)
      )
    );

    this.tournament = { teams, groups };
  }

  organizeGroups(teams: GroupTeam[], extraTeams: number, teamsInGroup: number) {
    let group = [];
    let count = 0;

    if (this.numberOfTeams === 32) {
      const lastPotTeams = 2;
      return this.potDraw(teams, lastPotTeams, teamsInGroup);
    }

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

  simulateTournament() {
    if (this.tournament?.groups !== undefined) {
      const { groups } = this.tournament;
      this.tournament.groups = this.simulateGroups(groups);

      this.tournament.bracket = this.simulateBracket(groups);
      console.log(this.tournament);

      if (this.tournament.bracket !== undefined) {
        this.tournament.stats = this.getTournamentStats(
          this.tournament.bracket,
          this.tournament.groups
        );
      }
    }
  }

  simulateGroups(groups: GroupTeam[][]): GroupTeam[][] {
    const g = groups;

    for (let i = 0; i < g.length; i++) {
      for (let j = 0; j < g[i].length; j++) {
        // resets
        g[i][j].points = 0;
        g[i][j].gDiff = 0;
        g[i][j].gFor = 0;
        g[i][j].gOpp = 0;
        g[i][j].matchesPlayed = 0;
      }
    }
    // go through each group
    // simulate each game and reward that team that many points
    // sort the teams by points
    console.log('============= NEW SET OF GROUP STAGES ==============');
    for (let c = 0; c < this.groupGamesPerOpponent; c++) {
      let goalsFor = 0;
      let goalsAg = 0;
      for (
        let i = 0;
        i < g.length;
        i++ // for each group
      ) {
        for (let j = 0; j < g[i].length; j++) {
          // for each team
          const team = g[i][j];
          for (let k = j + 1; k < g[i].length; k++) {
            // for each of the other teams play a match
            const otherTeam = g[i][k];
            const matchScore = this.matchScore(team, otherTeam);
            goalsFor = matchScore.goalsFor;
            goalsAg = matchScore.goalsAg;
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
            console.log(team.name, goalsFor, otherTeam.name, goalsAg);
          }
        }
        g[i].sort(
          (a, b) =>
            b.points - a.points ||
            b.gDiff - a.gDiff ||
            b.gFor - a.gFor ||
            compare(a.name, b.name, true)
        );
      }
    }
    return g;
  }

  simulateBracket(groups: GroupTeam[][]): {
    roundOf16: [GroupTeam, GroupTeam, Match][];
    quarterFinals: [GroupTeam, GroupTeam, Match][];
    semiFinals: [GroupTeam, GroupTeam, Match][];
    finals: [GroupTeam, GroupTeam, Match][];
  } {
    console.log('============= KNOCKOUT STAGES ==============');
    const groupWinners = groups.map((group) => group.slice(0, 2));
    console.log(groupWinners.map((g) => g.map((t) => t.name)));
    const [a, b, c, d, e, f, g, h] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // assign numbers to letter values, to improve readability of code

    const roundOf16: [GroupTeam, GroupTeam, Match][] = [
      [
        groupWinners[a][0],
        groupWinners[b][1],
        this.matchScore(groupWinners[a][0], groupWinners[b][1]),
      ],
      [
        groupWinners[c][0],
        groupWinners[d][1],
        this.matchScore(groupWinners[c][0], groupWinners[d][1]),
      ],
      [
        groupWinners[e][0],
        groupWinners[f][1],
        this.matchScore(groupWinners[e][0], groupWinners[f][1]),
      ],
      [
        groupWinners[g][0],
        groupWinners[h][1],
        this.matchScore(groupWinners[g][0], groupWinners[h][1]),
      ],
      [
        groupWinners[d][0],
        groupWinners[c][1],
        this.matchScore(groupWinners[d][0], groupWinners[c][1]),
      ],
      [
        groupWinners[b][0],
        groupWinners[a][1],
        this.matchScore(groupWinners[b][0], groupWinners[a][1]),
      ],
      [
        groupWinners[f][0],
        groupWinners[e][1],
        this.matchScore(groupWinners[f][0], groupWinners[e][1]),
      ],
      [
        groupWinners[h][0],
        groupWinners[g][1],
        this.matchScore(groupWinners[h][0], groupWinners[g][1]),
      ],
    ];
    console.log('ROUND OF 16 RESULTS');
    roundOf16.forEach((t) =>
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin ? `${t[2].winner.name} win on penalties` : ''
        }`
      )
    );

    const quarterFinals: [GroupTeam, GroupTeam, Match][] = [
      [
        roundOf16[0][2].winner,
        roundOf16[1][2].winner,
        this.matchScore(roundOf16[0][2].winner, roundOf16[1][2].winner),
      ],
      [
        roundOf16[2][2].winner,
        roundOf16[3][2].winner,
        this.matchScore(roundOf16[2][2].winner, roundOf16[3][2].winner),
      ],
      [
        roundOf16[4][2].winner,
        roundOf16[5][2].winner,
        this.matchScore(roundOf16[4][2].winner, roundOf16[5][2].winner),
      ],
      [
        roundOf16[6][2].winner,
        roundOf16[7][2].winner,
        this.matchScore(roundOf16[6][2].winner, roundOf16[7][2].winner),
      ],
    ];
    console.log('QUARTERFINAL RESULTS');
    quarterFinals.forEach((t) =>
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin ? `${t[2].winner.name} win on penalties` : ''
        }`
      )
    );

    const semiFinals: [GroupTeam, GroupTeam, Match][] = [
      [
        quarterFinals[0][2].winner,
        quarterFinals[1][2].winner,
        this.matchScore(quarterFinals[0][2].winner, quarterFinals[1][2].winner),
      ],
      [
        quarterFinals[2][2].winner,
        quarterFinals[3][2].winner,
        this.matchScore(quarterFinals[2][2].winner, quarterFinals[3][2].winner),
      ],
    ];
    console.log('SEMIFINAL RESULTS');
    semiFinals.forEach((t) =>
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin ? `${t[2].winner.name} win on penalties` : ''
        }`
      )
    );

    const finals: [GroupTeam, GroupTeam, Match][] = [
      [
        semiFinals[0][2].winner,
        semiFinals[1][2].winner,
        this.matchScore(semiFinals[0][2].winner, semiFinals[1][2].winner),
      ],
      [
        semiFinals[0][2].loser,
        semiFinals[1][2].loser,
        this.matchScore(semiFinals[0][2].loser, semiFinals[1][2].loser),
      ],
    ];
    console.log('FINAL RESULTS');
    finals.forEach((t) =>
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin ? `${t[2].winner.name} win on penalties` : ''
        }`
      )
    );

    return {
      roundOf16,
      quarterFinals,
      semiFinals,
      finals,
    };
  }

  createTeams() {
    this.nationsList = [];
    this.nations.forEach((tier) => {
      tier.nations.forEach((nation) => {
        // random nation values
        let attRating = 0;
        let defRating = 0;

        switch (nation.ranking) {
          case 's':
            attRating = getRandFloat(4.25, 5);
            defRating = getRandFloat(4.25, 5);
            break;
          case 'a':
            attRating = getRandFloat(4, 5);
            defRating = getRandFloat(4, 5);
            break;
          case 'b':
            attRating = getRandFloat(3.75, 4.75);
            defRating = getRandFloat(3.75, 4.75);
            break;
          case 'c':
            attRating = getRandFloat(3.25, 4.25);
            defRating = getRandFloat(3.25, 4.25);
            break;
          case 'd':
            attRating = getRandFloat(2.5, 3.75);
            defRating = getRandFloat(2.5, 3.75);
            break;
          case 'e':
            attRating = getRandFloat(2.5, 3.25);
            defRating = getRandFloat(2.5, 3.25);
            break;
          case 'f':
            attRating = getRandFloat(1.5, 3.25);
            defRating = getRandFloat(1.5, 3.25);
            break;
          case 'g':
            attRating = getRandFloat(1.5, 2.75);
            defRating = getRandFloat(1.5, 2.75);
            break;
          case 'h':
            attRating = getRandFloat(1, 2);
            defRating = getRandFloat(1, 2);
            break;
          case 'i':
            attRating = getRandFloat(0.5, 1.5);
            defRating = getRandFloat(0.5, 1.5);
            break;
          default:
            attRating = getRandFloat(0.5, 4);
            defRating = getRandFloat(0.5, 4);
            break;
        }
        const team: GroupTeam = {
          gDiff: 0,
          gFor: 0,
          gOpp: 0,
          points: 0,
          matchesPlayed: 0,
          tier: tier.tier[0],
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
    // create a list of the teams from each region and choose random teams from each region
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
    const regions = ['UEFA', 'AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC'];
    const qualifyingSpots = [13, 4, 5, 3, 4, 0];
    allRegions.forEach((region, i) => {
      region.sort((a, b) => b.rating - a.rating);
      console.log(
        `qualified from ${regions[i]}`,
        region.slice(0, qualifyingSpots[i]).map((a) => `${a.name} ${a.rating}`)
      );
      teamsQualified.push(...region.slice(0, qualifyingSpots[i]));
      console.log(
        `didn't qualify from ${regions[i]}`,
        region.slice(qualifyingSpots[i]).map((a) => `${a.name} ${a.rating}`)
      );
    });

    // ====== Playoff Qualifiers =======

    const playoff1 = this.matchScore(afcTeams[4], conmebolTeams[4]);
    teamsQualified.push(playoff1.winner);
    console.log(
      `playoff between ${afcTeams[4].name} and ${
        conmebolTeams[4].name
      } resulted in a win for ${playoff1.winner.name}
       with a score of ${playoff1.goalsFor}-${playoff1.goalsAg}${
        playoff1.penaltyWin ? ' decided on penalties' : ''
      }`
    );
    const playoff2 = this.matchScore(concacafTeams[3], ofcTeams[0]);
    teamsQualified.push(playoff2.winner);
    console.log(
      `playoff between ${concacafTeams[3].name} and ${
        ofcTeams[0].name
      } resulted in a win for ${playoff2.winner.name}
       with a score of ${playoff2.goalsFor}-${playoff2.goalsAg}${
        playoff2.penaltyWin ? ' decided on penalties' : ''
      }`
    );
    console.log(
      playoff1.winner.name,
      'and',
      playoff2.winner.name,
      'qualify via inter-confederation play-off'
    );

    return teamsQualified;
  }

  getTournamentStats(
    bracket: {
      roundOf16: [GroupTeam, GroupTeam, Match][];
      quarterFinals: [GroupTeam, GroupTeam, Match][];
      semiFinals: [GroupTeam, GroupTeam, Match][];
      finals: [GroupTeam, GroupTeam, Match][];
    },
    groups: GroupTeam[][]
  ): TournamentStats {
    const first = bracket.finals[0][2].winner;
    console.log(
      `${first?.name.toLocaleUpperCase()} HAS WON THE WORLD CUP!! 🏆`
    );
    const second = bracket.finals[0][2].loser;
    const third = bracket.finals[1][2].winner;
    // group stage overpeformer
    const overPerformer = groups
      .flatMap((group) => group.slice(0, 2))
      .reduce((prev, curr) => (prev.rating < curr.rating ? prev : curr));
    console.log(
      `${overPerformer?.name.toLocaleUpperCase()} overpeformed the most in the world cup group stage`
    );
    const underPerformer = groups
      .flatMap((group) => group.slice(-2))
      .reduce((prev, curr) => (prev.rating > curr.rating ? prev : curr));
    console.log(
      `${underPerformer?.name.toLocaleUpperCase()} underpeformed the most in the world cup group stage`
    );

    return {
      first,
      second,
      third,
      underPerformer,
      overPerformer,
    };
  }

  matchScore(team: GroupTeam, otherTeam: GroupTeam): Match {
    const gfMultiplier =
      team.attRating - otherTeam.defRating > 0
        ? team.attRating - otherTeam.defRating + 2.5
        : -(team.attRating - otherTeam.defRating);
    const gaMultiplier =
      otherTeam.attRating - team.defRating > 0
        ? otherTeam.attRating - team.defRating + 2.5
        : -(otherTeam.attRating - team.defRating);
    const goalsFor = getRandomInt(0, gfMultiplier);
    const goalsAg = getRandomInt(0, gaMultiplier);

    const penaltyWin = goalsFor === goalsAg;

    const whoWon = (
      gf: number,
      ga: number
    ): { winner: GroupTeam; loser: GroupTeam } => {
      if (penaltyWin) {
        const rand = getRandFloat(0, 1);
        return rand > 0.5
          ? { winner: team, loser: otherTeam }
          : { winner: otherTeam, loser: team };
      }
      return gf > ga
        ? { winner: team, loser: otherTeam }
        : { winner: otherTeam, loser: team };
    };

    const { winner, loser } = whoWon(goalsFor, goalsAg);

    return {
      goalsFor,
      goalsAg,
      penaltyWin,
      winner,
      loser,
    };
  }

  potDraw(
    teams: GroupTeam[],
    extraTeams: number,
    teamsInGroup: number
  ): GroupTeam[][] {
    const pots = teamsInGroup;
    const teamsInPot = teams.length / pots;
    // ====== remove playoff teams and put them at the back and sort teams by rating
    const playoffTeams = teams.splice(-extraTeams, extraTeams);
    teams.sort((a, b) => b.rating - a.rating);
    teams.push(...playoffTeams);
    // ======= assign teams to pots ===========

    const potTeams = [];
    let index = teamsInPot - 1;
    const host = teams.splice(
      teams.findIndex((t) => t.name === this.hostNation.name),
      1
    )[0];
    for (let i = 0; i < pots; i++) {
      if (i === 0) {
        potTeams.push([host, ...teams.slice(0, index)]);
      } else {
        potTeams.push(teams.slice(index, index + teamsInPot));
        index += teamsInPot;
      }
    }

    // ======= draw teams into groups ===========
    const draw = (pts: GroupTeam[][], nbrOfGroups: number): GroupTeam[][] => {
      const allTeams: GroupTeam[] = pts.flatMap((p, i) =>
        p
          .map((x) => ({ ...x, pot: i + 1 }))
          .sort(({ region: a }, { region: b }) => compare(a, b, true))
      );
      const groups: GroupTeam[][] = Array.from(
        { length: teamsInPot },
        (_) => []
      );
      for (let i = 0; i < allTeams.length; i++) {
        // for each team in the draw
        const team = allTeams[i];
        const candidateGroups = groups.filter(
          // return each group that returns true to ...
          (group) =>
            // console.log(group);
            // check the group has less teams than is needed in each group
            group.length < allTeams.length / nbrOfGroups &&
            group.every(
              (member) =>
                // console.log(member.pot, team.pot);
                member.pot !== team.pot
            ) &&
            (team.region !== 'uefa'
              ? group.every((member) => member.region !== team.region) // checking that every member of this group does not match region
              : group.filter((member) => member.region === 'uefa').length < 2) // if team is uefa, the group can have a uefa team
        );
        // console.log(candidateGroups.length, allTeams[i].name, allTeams[i].pot);
        if (candidateGroups.length < 1) {
          return draw(pts, nbrOfGroups);
        }
        candidateGroups[
          Math.floor(Math.random() * candidateGroups.length)
        ].push(team);
      }
      return groups;
    };
    const compareFn = (first: string, a: string, b: string) => {
      let returnValue;
      if (a === first) {
        returnValue = -1;
      } else if (b === first) {
        returnValue = 1;
      } else if (a < b) {
        returnValue = -1;
      } else if (b < a) {
        returnValue = 1;
      } else {
        returnValue = 0;
      }
      return returnValue;
    };

    const sortGroups = (h: string) => (t: GroupTeam[][]) =>
      t
        .map((team) =>
          team.sort(
            ({ name: a }: { name: string }, { name: b }: { name: string }) =>
              compareFn(h, a, b)
          )
        )
        .sort(([{ name: a }], [{ name: b }]) => compareFn(h, a, b));

    const drawAndSort = (t: GroupTeam[][], h: string, nbrOfGroups: number) =>
      sortGroups(h)(draw(t, nbrOfGroups));

    return drawAndSort(potTeams, host.name, teamsInPot);
  }

  getNationClass(nation: GroupTeam) {
    return `nation ${nation.region}`;
  }

  compareObj(o1: GroupTeam, o2: GroupTeam) {
    return o1?.name === o2?.name;
  }

  originalOrder = (): number => 0;
}
