import { DestroyRef, Injectable, inject } from '@angular/core';
import { compare } from '@shared/utils';
import { findTeamInTournament, matchScore, roundOf32Helper } from './simulation.utils';
import { GroupTeam } from 'app/football/models/nation.model';
import { KnockoutRound, Region, Tournament } from './simulation.model';
import { BehaviorSubject } from 'rxjs';
import { CreatePlayerService } from '@core/services/create-player.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  createPerson: CreatePlayerService;
  selectedNation$ = new BehaviorSubject<GroupTeam | null>(null);
  tournament$ = new BehaviorSubject<Tournament | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(true);
  tournament: Tournament | null = null;
  hostNations?: GroupTeam[];
  destroyRef = inject(DestroyRef);

  constructor(createPerson: CreatePlayerService) {
    this.tournament$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(t => {
      this.tournament = t;
      this.hostNations = t?.hostNations;
    });

    this.createPerson = createPerson;
  }

  checkForApp() {
    // not ideal to type this as any, but no choice until I find a better solution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window.navigator as any).standalone === true) {
      console.log('iOS app');
      return true;
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('android app');
      return true;
    }
    return false;
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

  simulateBracket(groups: GroupTeam[][]): {
    groupWinners: GroupTeam[];
    bracket: {
      roundOf16: KnockoutRound;
      quarterFinals: KnockoutRound;
      semiFinals: KnockoutRound;
      finals: KnockoutRound;
      roundOf32?: KnockoutRound;
    };
  } {
    const { gWinners, roundOf32 } = roundOf32Helper(groups);

    // assign numbers to letter values, to improve readability of code
    // CAN BE REMOVED
    const [a, b, c, d, e, f, g, h] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const roundOf16: KnockoutRound = [
      [gWinners[a][0], gWinners[b][1], matchScore(gWinners[a][0], gWinners[b][1])],
      [gWinners[c][0], gWinners[d][1], matchScore(gWinners[c][0], gWinners[d][1])],
      [gWinners[e][0], gWinners[f][1], matchScore(gWinners[e][0], gWinners[f][1])],
      [gWinners[g][0], gWinners[h][1], matchScore(gWinners[g][0], gWinners[h][1])],
      [gWinners[d][0], gWinners[c][1], matchScore(gWinners[d][0], gWinners[c][1])],
      [gWinners[b][0], gWinners[a][1], matchScore(gWinners[b][0], gWinners[a][1])],
      [gWinners[f][0], gWinners[e][1], matchScore(gWinners[f][0], gWinners[e][1])],
      [gWinners[h][0], gWinners[g][1], matchScore(gWinners[h][0], gWinners[g][1])],
    ];

    roundOf16.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const quarterFinals: KnockoutRound = [
      [roundOf16[0][2].winner, roundOf16[1][2].winner, matchScore(roundOf16[0][2].winner, roundOf16[1][2].winner)],
      [roundOf16[2][2].winner, roundOf16[3][2].winner, matchScore(roundOf16[2][2].winner, roundOf16[3][2].winner)],
      [roundOf16[4][2].winner, roundOf16[5][2].winner, matchScore(roundOf16[4][2].winner, roundOf16[5][2].winner)],
      [roundOf16[6][2].winner, roundOf16[7][2].winner, matchScore(roundOf16[6][2].winner, roundOf16[7][2].winner)],
    ];

    quarterFinals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const semiFinals: KnockoutRound = [
      [quarterFinals[0][2].winner, quarterFinals[1][2].winner, matchScore(quarterFinals[0][2].winner, quarterFinals[1][2].winner)],
      [quarterFinals[2][2].winner, quarterFinals[3][2].winner, matchScore(quarterFinals[2][2].winner, quarterFinals[3][2].winner)],
    ];

    semiFinals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const finals: KnockoutRound = [
      [semiFinals[0][2].winner, semiFinals[1][2].winner, matchScore(semiFinals[0][2].winner, semiFinals[1][2].winner)],
      [semiFinals[0][2].loser, semiFinals[1][2].loser, matchScore(semiFinals[0][2].loser, semiFinals[1][2].loser)],
    ];
    finals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    // console.log(groups.map(z => z.map(t => [t.name, t.ranking, `Pot${t.pot}`, t.tier, t.region])));

    // TODO: groupWinners might need to change for 48 team tournament
    const groupWinners = gWinners.flat() as GroupTeam[];

    if (roundOf32) {
      return {
        groupWinners,
        bracket: {
          roundOf32,
          roundOf16,
          quarterFinals,
          semiFinals,
          finals,
        },
      };
    }

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
      roundOf32?: KnockoutRound;
      roundOf16: KnockoutRound;
      quarterFinals: KnockoutRound;
      semiFinals: KnockoutRound;
      finals: KnockoutRound;
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

  // getCoachInfo(nations: GroupTeam[]): Observable<{
  //   nationality: string;
  //   lastNames: string[];
  //   lastNameUsage: string;
  //   firstNames: string[];
  //   firstInitial: string;
  //   firstNameUsage: string;
  //   totalLastNames: number;
  //   totalFirstNames: number;
  // }>[] {
  //   const updatedNations = [];
  //   for (let i = 0; i < nations.length; i++) {
  //     updatedNations.push(this.createPerson.getNames(nations[i].name).pipe(map(n => ({ ...n, nationality: nations[i].name }))));
  //   }
  //   return updatedNations;
  // }
}
