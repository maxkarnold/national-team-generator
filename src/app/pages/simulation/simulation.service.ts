import { Injectable } from '@angular/core';
import { compare } from '@shared/utils';
import { findTeamInTournament, matchScore } from './simulation.utils';
import { GroupTeam } from 'app/models/nation.model';
import { Match, Region, Tournament32 } from './simulation.model';
import { BehaviorSubject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CreatePlayerService } from '@core/services/create-player.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  createPerson: CreatePlayerService;
  selectedNation$ = new BehaviorSubject<GroupTeam | null>(null);
  tournament$ = new BehaviorSubject<Tournament32 | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(true);
  tournament: Tournament32 | null = null;
  hostNation?: GroupTeam;

  constructor(createPerson: CreatePlayerService) {
    this.tournament$.pipe(untilDestroyed(this)).subscribe(t => {
      this.tournament = t;
      this.hostNation = t?.hostNation;
    });

    this.createPerson = createPerson;
  }

  changeSelectedNation(value: null | GroupTeam) {
    if (!this.tournament?.groups || !value) {
      this.selectedNation$.next(value);
      return;
    }
    const updatedNation = findTeamInTournament(this.tournament?.groups, value);
    if (updatedNation) {
      this.selectedNation$.next(updatedNation);
    } else {
      this.selectedNation$.next(value);
    }
  }

  simulateGroups(groupGamesPerOpponent: number, groups: GroupTeam[][]): GroupTeam[][] {
    const g: GroupTeam[][] = groups || [];

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
        g[i][j].reportCard = {
          grade: null,
          gradeStyle: null,
          gradeSummary: null,
          tournamentFinish: null,
        };
      }
    }
    // go through each group
    // simulate each game and reward that team that many points
    // sort the teams by points
    for (let c = 0; c < groupGamesPerOpponent; c++) {
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
            const match = matchScore(team, otherTeam, this.hostNation);
            match.winner.matchHistory.group.push({
              match: match,
              opp: match.loser,
            });
            match.loser.matchHistory.group.push({
              match: match,
              opp: match.winner,
            });
            goalsFor = match.goalsFor;
            goalsAg = match.goalsAg;
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
          }
        }
        g[i].sort((a, b) => b.points - a.points || b.gDiff - a.gDiff || b.gFor - a.gFor || compare(a.name, b.name, true));
      }
    }
    return g;
  }

  simulateBracket(groups: GroupTeam[][]): {
    groupWinners: GroupTeam[];
    bracket: {
      roundOf16: [GroupTeam, GroupTeam, Match][];
      quarterFinals: [GroupTeam, GroupTeam, Match][];
      semiFinals: [GroupTeam, GroupTeam, Match][];
      finals: [GroupTeam, GroupTeam, Match][];
    };
  } {
    const gWinners = groups.map(group => group.slice(0, 2));
    const [a, b, c, d, e, f, g, h] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // assign numbers to letter values, to improve readability of code

    const roundOf16: [GroupTeam, GroupTeam, Match][] = [
      [gWinners[a][0], gWinners[b][1], matchScore(gWinners[a][0], gWinners[b][1], this.hostNation)],
      [gWinners[c][0], gWinners[d][1], matchScore(gWinners[c][0], gWinners[d][1], this.hostNation)],
      [gWinners[e][0], gWinners[f][1], matchScore(gWinners[e][0], gWinners[f][1], this.hostNation)],
      [gWinners[g][0], gWinners[h][1], matchScore(gWinners[g][0], gWinners[h][1], this.hostNation)],
      [gWinners[d][0], gWinners[c][1], matchScore(gWinners[d][0], gWinners[c][1], this.hostNation)],
      [gWinners[b][0], gWinners[a][1], matchScore(gWinners[b][0], gWinners[a][1], this.hostNation)],
      [gWinners[f][0], gWinners[e][1], matchScore(gWinners[f][0], gWinners[e][1], this.hostNation)],
      [gWinners[h][0], gWinners[g][1], matchScore(gWinners[h][0], gWinners[g][1], this.hostNation)],
    ];

    roundOf16.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const quarterFinals: [GroupTeam, GroupTeam, Match][] = [
      [roundOf16[0][2].winner, roundOf16[1][2].winner, matchScore(roundOf16[0][2].winner, roundOf16[1][2].winner, this.hostNation)],
      [roundOf16[2][2].winner, roundOf16[3][2].winner, matchScore(roundOf16[2][2].winner, roundOf16[3][2].winner, this.hostNation)],
      [roundOf16[4][2].winner, roundOf16[5][2].winner, matchScore(roundOf16[4][2].winner, roundOf16[5][2].winner, this.hostNation)],
      [roundOf16[6][2].winner, roundOf16[7][2].winner, matchScore(roundOf16[6][2].winner, roundOf16[7][2].winner, this.hostNation)],
    ];

    quarterFinals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const semiFinals: [GroupTeam, GroupTeam, Match][] = [
      [
        quarterFinals[0][2].winner,
        quarterFinals[1][2].winner,
        matchScore(quarterFinals[0][2].winner, quarterFinals[1][2].winner, this.hostNation),
      ],
      [
        quarterFinals[2][2].winner,
        quarterFinals[3][2].winner,
        matchScore(quarterFinals[2][2].winner, quarterFinals[3][2].winner, this.hostNation),
      ],
    ];

    semiFinals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const finals: [GroupTeam, GroupTeam, Match][] = [
      [semiFinals[0][2].winner, semiFinals[1][2].winner, matchScore(semiFinals[0][2].winner, semiFinals[1][2].winner, this.hostNation)],
      [semiFinals[0][2].loser, semiFinals[1][2].loser, matchScore(semiFinals[0][2].loser, semiFinals[1][2].loser, this.hostNation)],
    ];
    finals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    // console.log(groups.map(z => z.map(t => [t.name, t.ranking, `Pot${t.pot}`, t.tier, t.region])));

    const groupWinners = gWinners.flat() as GroupTeam[];

    return {
      groupWinners,
      bracket: {
        roundOf16,
        quarterFinals,
        semiFinals,
        finals,
      },
    };
  }

  getTournamentAwards(
    bracket: {
      roundOf16: [GroupTeam, GroupTeam, Match][];
      quarterFinals: [GroupTeam, GroupTeam, Match][];
      semiFinals: [GroupTeam, GroupTeam, Match][];
      finals: [GroupTeam, GroupTeam, Match][];
    },
    groups: GroupTeam[][],
    availableRegions?: Region[]
  ): [GroupTeam, GroupTeam, GroupTeam, GroupTeam, GroupTeam, GroupTeam?, GroupTeam?, GroupTeam?, GroupTeam?, GroupTeam?, GroupTeam?] {
    const first = bracket.finals[0][2].winner;
    const second = bracket.finals[0][2].loser;
    const third = bracket.finals[1][2].winner;

    const finalists = bracket.finals.flatMap(m => [m[2].winner, m[2].loser]);

    const overPerformer = finalists.find((t: GroupTeam) => {
      if (t.ranking && availableRegions) {
        return availableRegions.length > 4 ? t.ranking > 12 : t.ranking > 30;
      }
      return 0 > 1;
    })
      ? finalists.reduce((prev, curr) => (prev.rating < curr.rating ? prev : curr))
      : groups.flatMap(group => group.slice(0, 2)).reduce((prev, curr) => (prev.rating < curr.rating ? prev : curr));
    const underPerformer = groups.flatMap(group => group.slice(-2)).reduce((prev, curr) => (prev.rating > curr.rating ? prev : curr));

    return [first, second, third, underPerformer, overPerformer];
  }

  getPersonInfo(nations: GroupTeam[]): GroupTeam[] {
    const updatedNations: GroupTeam[] = [];
    for (let i = 0; i < nations.length; i++) {
      this.createPerson
        .getNames(nations[i].name)
        .pipe(untilDestroyed(this))
        .subscribe(a => {
          updatedNations.push({
            ...nations[i],
            coach: {
              firstNames: a.firstNames,
              lastNames: a.lastNames,
              firstInitial: a.firstInitial,
              singleLastName: a.lastNames[0],
              firstNameUsage: a.firstNameUsage,
              lastNameUsage: a.lastNameUsage,
              nationality: nations[i].name,
              age: 40,
              rating: nations[i].rating,
            },
          });
        });
    }
    return updatedNations;
  }
}
