import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-squad-rules',
  templateUrl: './squad-rules.component.html',
  styleUrls: ['./squad-rules.component.scss'],
})
export class SquadRulesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  // checkSquadRules(countArr: number[]): boolean {
  //   if (countArr[4] > 0) {
  //     this.squadRules[0].check = '✅';
  //   } else {
  //     this.squadRules[0].check = '❌';
  //   }
  //   if (countArr[0] === 3) {
  //     this.squadRules[1].check = '✅';
  //   } else {
  //     this.squadRules[1].check = '❌';
  //   }
  //   if (countArr[5] > 2 && countArr[5] < 5) {
  //     this.squadRules[2].check = '✅';
  //   } else {
  //     this.squadRules[2].check = '❌';
  //   }
  //   if (countArr[1] > 5) {
  //     this.squadRules[3].check = '✅';
  //   } else {
  //     this.squadRules[3].check = '❌';
  //   }
  //   if (countArr[6] > 1 && countArr[6] < 7) {
  //     this.squadRules[4].check = '✅';
  //   } else {
  //     this.squadRules[4].check = '❌';
  //   }
  //   if (countArr[2] > 4) {
  //     this.squadRules[5].check = '✅';
  //   } else {
  //     this.squadRules[5].check = '❌';
  //   }
  //   if (this.formation !== 'N/A') {
  //     this.squadRules[6].check = '✅';
  //   } else {
  //     this.squadRules[6].check = '❌';
  //   }

  //   return !this.squadRules.find((rule) => rule.check === '❌');
  // }

  // getBackupPositions() {
  //   const startingPositions: string[] = [];
  //   this.pitchPlayers.forEach((player) => {
  //     this.pitchPositions.forEach((pos) => {
  //       if (player.pitchPosition === pos.position) {
  //         startingPositions.push(pos.playerPosition);
  //       }
  //     });
  //   });

  //   const playersLeft = this.players.slice(0, 12);
  //   for (let j = 0; j < this.players.slice(0, 12).length; j++) {
  //     // for each player on the bench

  //     let used = false;
  //     const duplicates: string[] = [];

  //     for (let i = 0; i < startingPositions.length; i++) {
  //       const player = playersLeft[j];
  //       // for each position in the starting lineup
  //       if (
  //         !duplicates.includes(startingPositions[i]) &&
  //         startingPositions[i] !== ''
  //       ) {
  //         // if position hasn't already been used by same player
  //         if (
  //           player.mainPositions.find(
  //             (mainPos) => mainPos === startingPositions[i]
  //           )
  //         ) {
  //           // if main pos mathces
  //           used = true;
  //           duplicates.push(startingPositions[i]);
  //           startingPositions[i] = '';
  //         }

  //         if (
  //           player.altPositions.find(
  //             (altPos) => altPos === startingPositions[i]
  //           )
  //         ) {
  //           // if altPos matches
  //           used = true;
  //           duplicates.push(startingPositions[i]);
  //           startingPositions[i] = '';
  //         }
  //       }
  //     }
  //     if (used) {
  //       playersLeft.splice(j, 1, {} as Player);
  //     }
  //   }

  //   this.squadRules[8].text = '';
  //   for (let i = 0; i < startingPositions.length; i++) {
  //     if (startingPositions[i] !== '') {
  //       this.squadRules[8].text += ` ${startingPositions[i]}`;
  //     }
  //   }
  //   if (this.squadRules[8].text === '') {
  //     this.squadRules[7].check = '✅';
  //   } else {
  //     this.squadRules[7].check = '❌';
  //   }
  // }
}
