import { Component, HostListener } from '@angular/core';
import {
  getRandFloat,
  getRandomInt,
  roundMax,
  shuffle,
  groupLetters,
  compare,
  calcScore,
  originalOrder,
} from '@shared/utils';
import nationsModule from 'assets/json/nations.json';
import { get, set } from 'lodash';
import { GroupTeam } from 'app/models/nation.model';
import { Match, Tournament32, TournamentStats } from './simulation.model';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent {
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.selectedNation = undefined;
  }
  isDialogOpen = false;
  nations = nationsModule;
  nationsList: GroupTeam[] = [];
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
    defRating: 0,
    rating: 0,
    matchesPlayed: 0,
    matchHistory: {
      qualifiers: [],
      group: [],
      bracket: [],
    },
  };

  tournamentStats = [
    {
      emoji: '🥇',
    },
    {
      emoji: '🥈',
    },
    {
      emoji: '🥉',
    },
    {
      emoji: '📉',
    },
    {
      emoji: '📈',
    },
  ];

  headings = ['RNK', 'MP', 'PTS', 'GD', 'GS', 'GA'];
  numberOfTeams = 32;
  groupGamesPerOpponent = 1;
  selectedNation?: GroupTeam;

  groupLetters = groupLetters;
  originalOrder = originalOrder;

  tournament: Tournament32;

  constructor() {
    this.createTeams();
    this.tournament = {};
    this.setupTournament();
  }

  setupTournament(): void {
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
      bracket: undefined,
      stats: undefined,
    };
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
        g[i][j].matchHistory = {
          qualifiers: g[i][j].matchHistory.qualifiers,
          group: [],
          bracket: [],
        };
        g[i][j].grade = undefined;
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
            matchScore.winner.matchHistory.group.push({
              match: matchScore,
              opp: matchScore.loser,
            });
            matchScore.loser.matchHistory.group.push({
              match: matchScore,
              opp: matchScore.winner,
            });
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
    this.tournament.groupWinners = groupWinners.flat() as GroupTeam[];
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
    roundOf16.forEach((t) => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin ? `${t[2].winner.name} win on penalties` : ''
        }`
      );
    });

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
    quarterFinals.forEach((t) => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin
            ? `${t[2].winner.name} win on penalties`
            : t[2].etWin
            ? `${t[2].winner.name} win in extra time`
            : ''
        }`
      );
    });

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
    semiFinals.forEach((t) => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin
            ? `${t[2].winner.name} win on penalties`
            : t[2].etWin
            ? `${t[2].winner.name} win in extra time`
            : ''
        }`
      );
    });

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
    finals.forEach((t) => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
      console.log(
        `${t[0].name} ${t[2].goalsFor} ${t[1].name} ${t[2].goalsAg} ${
          t[2].penaltyWin
            ? `${t[2].winner.name} win on penalties`
            : t[2].etWin
            ? `${t[2].winner.name} win in extra time`
            : ''
        }`
      );
    });

    console.log(
      groups.flat().map((t) => [t.name, t.ranking, `Pot${t.pot}`, t.tier])
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
            attRating = getRandFloat(80, 100);
            defRating = getRandFloat(80, 100);
            break;
          case 'a':
            attRating = getRandFloat(70, 95);
            defRating = getRandFloat(70, 95);
            break;
          case 'b':
            attRating = getRandFloat(65, 88);
            defRating = getRandFloat(65, 88);
            break;
          case 'c':
            attRating = getRandFloat(60, 88);
            defRating = getRandFloat(60, 88);
            break;
          case 'd':
            attRating = getRandFloat(55, 80);
            defRating = getRandFloat(55, 80);
            break;
          case 'e':
            attRating = getRandFloat(40, 78);
            defRating = getRandFloat(40, 78);
            break;
          case 'f':
            attRating = getRandFloat(30, 70);
            defRating = getRandFloat(30, 70);
            break;
          case 'g':
            attRating = getRandFloat(25, 55);
            defRating = getRandFloat(25, 55);
            break;
          default:
            attRating = getRandFloat(25, 55);
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
          rating: roundMax(attRating + defRating),
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
    const nationsLeft = this.nationsList
      .sort((a, b) => b.rating - a.rating)
      .map((team, i) => ({
        ...team,
        ranking: i + 1,
      }));

    const host = nationsLeft.findIndex((t) => t.name === this.hostNation.name);
    teamsQualified.push(nationsLeft.splice(host, 1)[0]);
    console.log(
      teamsQualified[0].name,
      teamsQualified[0].ranking,
      'qualifies as host'
    );

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
    const qualifyingSpots = [10, 4, 0, 3, 4, 0];
    allRegions.forEach((region, i) => {
      if (qualifyingSpots[i] === 0) {
        return;
      }
      region.sort((a, b) => b.rating - a.rating);
      if (Math.random() > 0.8 && regions[i] !== 'CONMEBOL') {
        const team = region.splice(
          getRandomInt(1, qualifyingSpots[i] - 1),
          1
        )[0];
        region.splice(qualifyingSpots[i], 0, team);
      }
      console.log(
        `qualified automatically for World Cup from ${regions[i]}`,
        region
          .slice(0, qualifyingSpots[i])
          .map((a) => `${a.name} ${a.ranking} - ${a.rating}`)
      );
      console.log(
        `didn't qualify automatically from ${regions[i]}`,
        region.slice(qualifyingSpots[i]).map((t) => `${t.name}-${t.ranking}`)
      );
      teamsQualified.push(...region.slice(0, qualifyingSpots[i]));
    });

    // ====== Playoff Qualifiers =======
    // ====== Confederation Qualifiers ======
    // ====== CAF Qualifiers ======
    const cafQualifiers = [
      this.matchScore(cafTeams[0], cafTeams[9]),
      this.matchScore(cafTeams[1], cafTeams[8]),
      this.matchScore(cafTeams[2], cafTeams[7]),
      this.matchScore(cafTeams[3], cafTeams[6]),
      this.matchScore(cafTeams[4], cafTeams[5]),
    ];

    cafQualifiers.forEach((match) => {
      match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
      match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
      console.log(
        `CAF qualifier playoff where ${match.winner.name} defeated ${
          match.loser.name
        } with a score of ${match.score}${
          match.penaltyWin
            ? ` after winning on penalties`
            : match.etWin
            ? ` after extra time`
            : ''
        }`
      );
    });

    teamsQualified.push(...cafQualifiers.map((m) => m.winner));

    console.log(
      `qualified from ${regions[2]}`,
      cafQualifiers.map(
        (a) => `${a.winner.name} ${a.winner.ranking} - ${a.winner.rating}`
      )
    );
    console.log(
      `didn't qualify from ${regions[2]}`,
      cafTeams.slice(10).map((t) => `${t.name} ${t.ranking} - ${t.rating}`),
      cafQualifiers.map((t) => `${t.loser.name}-${t.loser.ranking}`)
    );
    // ===== UEFA Qualifiers =====
    const uefaFirstRound = [
      this.matchScore(uefaTeams[10], uefaTeams[21]),
      this.matchScore(uefaTeams[11], uefaTeams[20]),
      this.matchScore(uefaTeams[12], uefaTeams[19]),
      this.matchScore(uefaTeams[13], uefaTeams[18]),
      this.matchScore(uefaTeams[14], uefaTeams[17]),
      this.matchScore(uefaTeams[15], uefaTeams[16]),
    ];
    uefaFirstRound.forEach((match) => {
      match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
      match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
      console.log(
        `UEFA qualifier playoff where ${match.winner.name} defeated ${
          match.loser.name
        } with a score of ${match.score}${
          match.penaltyWin
            ? ` after winning on penalties`
            : match.etWin
            ? ` after extra time`
            : ''
        }`
      );
    });
    const uefaQualifiers = [
      this.matchScore(uefaFirstRound[0].winner, uefaFirstRound[5].winner),
      this.matchScore(uefaFirstRound[1].winner, uefaFirstRound[4].winner),
      this.matchScore(uefaFirstRound[2].winner, uefaFirstRound[3].winner),
    ];
    uefaQualifiers.forEach((match) => {
      match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
      match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
      console.log(
        `UEFA qualifier playoff where ${match.winner.name} defeated ${
          match.loser.name
        } with a score of ${match.score}${
          match.penaltyWin
            ? ` after winning on penalties`
            : match.etWin
            ? ` after extra time`
            : ''
        }`
      );
    });
    teamsQualified.push(...uefaQualifiers.map((m) => m.winner));
    console.log(
      `qualified from ${regions[0]}`,
      uefaQualifiers.map(
        (a) => `${a.winner.name} ${a.winner.ranking} - ${a.winner.rating}`
      )
    );
    console.log(
      `didn't qualify from ${regions[0]}`,
      uefaTeams.slice(22).map((t) => `${t.name}-${t.ranking}`),
      uefaFirstRound.map((t) => `${t.loser.name}-${t.loser.ranking}`),
      uefaQualifiers.map((t) => `${t.loser.name}-${t.loser.ranking}`)
    );
    // ===== Other Qualifiers =====
    const afcQualifier = this.matchScore(afcTeams[4], afcTeams[5]);
    afcQualifier.winner.matchHistory.qualifiers.push({
      match: afcQualifier,
      opp: afcQualifier.loser,
    });
    afcQualifier.loser.matchHistory.qualifiers.push({
      match: afcQualifier,
      opp: afcQualifier.winner,
    });
    console.log(
      `AFC qualifier playoff where ${afcQualifier.winner.name} defeated ${
        afcQualifier.loser.name
      } with a score of ${afcQualifier.score}${
        afcQualifier.penaltyWin
          ? ` after winning on penalties`
          : afcQualifier.etWin
          ? ` after extra time`
          : ''
      }`
    );
    const ofcQualifier = this.matchScore(ofcTeams[0], ofcTeams[1]);
    ofcQualifier.winner.matchHistory.qualifiers.push({
      match: ofcQualifier,
      opp: ofcQualifier.loser,
    });
    ofcQualifier.loser.matchHistory.qualifiers.push({
      match: ofcQualifier,
      opp: ofcQualifier.winner,
    });
    console.log(
      `OFC qualifier playoff where ${ofcQualifier.winner.name} defeated ${
        ofcQualifier.loser.name
      } with a score of ${ofcQualifier.score}${
        ofcQualifier.penaltyWin
          ? ` after winning on penalties`
          : ofcQualifier.etWin
          ? ` after extra time`
          : ''
      }`
    );
    console.log(
      'teams in OFC',
      ofcTeams.map((t) => `${t.name}-${t.ranking}`)
    );
    // ===== Inter-confederation Qualifiers =====
    const playoff1 = this.matchScore(afcQualifier.winner, conmebolTeams[4]);
    playoff1.winner.matchHistory.qualifiers.push({
      match: playoff1,
      opp: playoff1.loser,
    });
    playoff1.loser.matchHistory.qualifiers.push({
      match: playoff1,
      opp: playoff1.winner,
    });
    teamsQualified.push(playoff1.winner);
    console.log(
      `playoff between ${afcQualifier.winner.name} and ${
        conmebolTeams[4].name
      } resulted in a win for ${playoff1.winner.name}
       with a score of ${playoff1.goalsFor}-${playoff1.goalsAg}${
        playoff1.penaltyWin
          ? ' decided on penalties'
          : playoff1.etWin
          ? ` after extra time`
          : ''
      }`
    );
    const playoff2 = this.matchScore(concacafTeams[3], ofcQualifier.winner);
    playoff2.winner.matchHistory.qualifiers.push({
      match: playoff2,
      opp: playoff2.loser,
    });
    playoff2.loser.matchHistory.qualifiers.push({
      match: playoff2,
      opp: playoff2.winner,
    });
    teamsQualified.push(playoff2.winner);
    console.log(
      `playoff between ${concacafTeams[3].name} and ${
        ofcQualifier.winner.name
      } resulted in a win for ${playoff2.winner.name}
       with a score of ${playoff2.goalsFor}-${playoff2.goalsAg}${
        playoff2.penaltyWin
          ? ' decided on penalties'
          : playoff2.etWin
          ? ` after extra time`
          : ''
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
  ): [
    GroupTeam,
    GroupTeam,
    GroupTeam,
    GroupTeam,
    GroupTeam,
    GroupTeam?,
    GroupTeam?,
    GroupTeam?,
    GroupTeam?,
    GroupTeam?,
    GroupTeam?
  ] {
    const first = bracket.finals[0][2].winner;
    const second = bracket.finals[0][2].loser;
    const third = bracket.finals[1][2].winner;

    const finalists = bracket.finals.flatMap((m) => [m[2].winner, m[2].loser]);

    const overPerformer = finalists.find((t: GroupTeam) => {
      if (t.ranking) {
        return t.ranking > 12;
      }
      return 0 > 1;
    })
      ? finalists.reduce((prev, curr) =>
          prev.rating < curr.rating ? prev : curr
        )
      : groups
          .flatMap((group) => group.slice(0, 2))
          .reduce((prev, curr) => (prev.rating < curr.rating ? prev : curr));
    const underPerformer = groups
      .flatMap((group) => group.slice(-2))
      .reduce((prev, curr) => (prev.rating > curr.rating ? prev : curr));

    return [first, second, third, underPerformer, overPerformer];
  }

  matchScore(team: GroupTeam, otherTeam: GroupTeam): Match {
    const [goalsFor, goalsAg] = calcScore(
      team.attRating,
      team.defRating,
      otherTeam.attRating,
      otherTeam.defRating
    );

    const etWin = getRandFloat(0, 1) > 0.9 && goalsFor !== goalsAg;
    const penaltyWin = goalsFor === goalsAg;

    const whoWon = (
      gf: number,
      ga: number
    ): { winner: GroupTeam; loser: GroupTeam; score: string } => {
      if (penaltyWin) {
        const rand = getRandFloat(0, 1);
        return rand > 0.5
          ? { winner: team, loser: otherTeam, score: `${goalsFor}-${goalsAg}` }
          : { winner: otherTeam, loser: team, score: `${goalsAg}-${goalsFor}` };
      }
      return gf > ga
        ? { winner: team, loser: otherTeam, score: `${goalsFor}-${goalsAg}` }
        : { winner: otherTeam, loser: team, score: `${goalsAg}-${goalsFor}` };
    };

    const { winner, loser, score } = whoWon(goalsFor, goalsAg);

    return {
      goalsFor,
      goalsAg,
      etWin,
      penaltyWin,
      winner,
      loser,
      score,
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

  openNationStats(nation: GroupTeam) {
    this.selectedNation = nation;
    this.isDialogOpen = true;
  }

  getNationClass(nation: GroupTeam) {
    return `nation ${nation.region}`;
  }

  compareObj(o1: GroupTeam, o2: GroupTeam) {
    return o1?.name === o2?.name;
  }
}
