import { Injectable } from '@angular/core';
import { Roster, RosterData } from 'app/football/models/roster.model';
import { Observable, of } from 'rxjs';
import { Nation } from 'app/football/models/nation.model';
import { Club } from 'app/football/models/club.model';
import { SQUAD_RULES } from '@shared/constants/squad-rules.model';
import { compare, getRandomInt } from '@shared/utils';
import * as pitchPositionsModule from '../../../assets/json/pitchPositions.json';
import * as positionsModule from '../../../assets/json/positions.json';
import * as clubsModule from '../../../assets/json/clubs.json';
import * as nationsModule from '../../../assets/json/nations.json';
import { CreatePlayerService } from './create-player.service';

@Injectable()
export class CreateRosterService {
  // playerService;
  // roster: Roster;
  squadRules = SQUAD_RULES;

  positions = positionsModule;
  pitchPositions = pitchPositionsModule;

  nations = nationsModule;
  // nationsList: Nation[];
  clubs: Club[] = clubsModule as Club[];

  shirtIcon = '../../../assets/img/shirt-icon.jpg';

  // roster$: Observable<Roster>;
  // squadRules$: Observable<unknown>;

  constructor(playerService: CreatePlayerService) {
    // this.playerService = playerService;
    // this.roster$.subscribe((val) => {
    //   this.roster = val;
    // });
    // this.squadRules$ = of(this.squadRules);
    // this.nationsList = [];
    // this.nations
    //   .map((tier) => tier.nations)
    //   .forEach((nationsArr) =>
    //     nationsArr.forEach((nation) => this.nationsList.push(nation as Nation))
    //   );
  }

  // currentRoster() {
  //   this.roster$ = of(this.roster);
  // }

  // createRoster(data: RosterData): Observable<Roster> {
  //   // RESETS
  //   this.positions.map((pos) => ({
  //     ...pos,
  //     amount: 0,
  //   }));

  //   this.squadRules.forEach((rule, i) => {
  //     if (rule.check === '✅') {
  //       this.squadRules[i].check = '❌';
  //     }
  //   });

  //   let playerCount = 0;

  //   const tier =
  //     this.playerService.getNationOrTier(data.nationOrTier, 'tier').tier || '';
  //   const numArray: number[] = this.getRatingBreakdown(tier);

  //   const first = getRandomInt(numArray[0], numArray[1]);
  //   const second = getRandomInt(numArray[2], numArray[3]);
  //   const third = getRandomInt(numArray[4], numArray[5]);
  //   const fourth = getRandomInt(numArray[6], numArray[7]);
  //   const fifth = getRandomInt(numArray[8], numArray[9]);
  //   const sixth = getRandomInt(numArray[10], numArray[11]);
  //   const seventh = getRandomInt(numArray[12], numArray[13]);
  //   const eighth = getRandomInt(numArray[14], numArray[15]);

  //   // Loops 60 times for 60 players
  //   while (playerCount < 60) {
  //     this.roster.players.push(
  //       this.playerService.createPlayer(data.nationOrTier, [
  //         playerCount,
  //         first,
  //         second,
  //         third,
  //         fourth,
  //         fifth,
  //         sixth,
  //         seventh,
  //         eighth,
  //       ])
  //     );
  //     playerCount++;
  //   }

  //   window.setTimeout(
  //     () => {
  //       this.roster.players = this.roster.players.sort((a, b) => {
  //         const isAsc = false;
  //         return compare(a.rating, b.rating, isAsc);
  //       });
  //       for (const player of this.players) {
  //         const firstLastName = player.lastNames[0];

  //         if (
  //           firstLastName === 'da' ||
  //           firstLastName === 'das' ||
  //           firstLastName === 'dos' ||
  //           firstLastName === 'do' ||
  //           firstLastName === 'de' ||
  //           firstLastName === 'bin'
  //         ) {
  //           player.singleLastName = player.lastNames[1];
  //         } else {
  //           player.singleLastName = player.lastNames[0];
  //         }
  //         player.firstInitial = player.firstNames[0].charAt(0);
  //         if (player.firstInitial === "'") {
  //           player.firstInitial = player.firstNames[0].charAt(1);
  //         }
  //       }

  //       this.sortedData = this.players;
  //       console.log(this.players);
  //     },
  //     20000,
  //     this.players
  //   );
  //   return this.roster$;
  // }

  // getRatingBreakdown(tier: string): number[] {
  //   switch (tier) {
  //     case 's':
  //       return [3, 9, 10, 30, 40, 70, 150, 200, 0, 0, 0, 0, 0, 0, 0, 0];
  //     case 'a':
  //       return [2, 5, 4, 12, 16, 45, 45, 70, 0, 0, 0, 0, 0, 0, 0, 0];
  //     case 'b':
  //       return [0, 4, 2, 5, 4, 15, 15, 60, 45, 100, 0, 0, 0, 0, 0, 0];
  //     case 'c':
  //       return [0, 2, 0, 3, 3, 12, 10, 25, 30, 70, 60, 160, 0, 0, 0, 0];
  //     case 'd':
  //       return [0, 2, 0, 3, 1, 7, 5, 25, 30, 65, 100, 200, 0, 0, 0, 0];
  //     case 'e':
  //       return [0, 1, 0, 3, 0, 6, 6, 18, 12, 40, 38, 75, 10, 10, 0, 0];
  //     case 'f':
  //       return [0, 1, 0, 2, 0, 4, 0, 8, 8, 22, 30, 100, 25, 25, 0, 0];
  //     case 'g':
  //       return [0, 1, 0, 1, 0, 4, 0, 6, 8, 18, 25, 45, 30, 30, 0, 0];
  //     case 'h':
  //       return [0, 0, 0, 1, 0, 2, 0, 5, 2, 10, 12, 35, 25, 115, 25, 25];
  //     case 'i':
  //       return [0, 0, 0, 1, 0, 1, 0, 4, 1, 7, 2, 18, 20, 90, 40, 40];
  //     case 'j':
  //       return [0, 0, 0, 1, 0, 1, 0, 4, 0, 5, 1, 12, 4, 50, 55, 55];
  //     case 'k':
  //       return [0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 4, 5, 25, 60, 60];
  //     case 'l':
  //       return [0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 3, 0, 10, 60, 60];
  //     default:
  //       throw new Error('getRatingBreakdown() had an error');
  //   }
  // }
}
