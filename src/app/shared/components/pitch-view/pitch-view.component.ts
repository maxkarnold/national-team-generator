import { Component } from '@angular/core';

@Component({
  selector: 'app-pitch-view',
  templateUrl: './pitch-view.component.html',
  styleUrls: ['./pitch-view.component.scss'],
})
export class PitchViewComponent {
  constructor() {}

  // resetStarters(bypass?: boolean) {
  //   if (bypass) {
  //     this.pitchPlayers.map((player) => ({
  //       ...player,
  //       pitchPosition: undefined,
  //       pitchPositionIndex: undefined,
  //     }));

  //     this.players = this.pitchPlayers.concat(this.players);
  //     this.pitchPlayers = [];
  //     this.sortedPitchPlayers = [];
  //     this.squadRules.map((rule) => ({
  //       ...rule,
  //       check: '❌',
  //     }));

  //     this.squadRules[8].check = '→';

  //     this.positionBoxes.map((box) => ({
  //       ...box,
  //       playerClass: 'inactive player-box',
  //       posBoxClass: 'active pos-box',
  //       pitchPlayer: undefined,
  //     }));
  //   } else if (window.confirm('Remove starting players?')) {
  //     this.resetStarters(true);
  //   }
  // }

  // calcChemistry(obj: { def: number }) {
  //   // chemistry reset

  //   this.pitchPlayers.map((player) => ({
  //     ...player,
  //     chemistryNum: 0,
  //   }));
  //   this.chemistry = 0;

  //   const chemArr = [];
  //   if (this.formation !== 'N/A') {
  //     if (obj.def === 4) {
  //       chemArr.push(
  //         ['GK', 'DCL'],
  //         ['GK', 'DCR'],
  //         ['DCR', 'DCL'],
  //         ['DCL', 'DL'],
  //         ['DCR', 'DR']
  //       );
  //       if (this.formation === '4-1-4-1 DM Asymmetric AM (R/L)') {
  //         chemArr.push(
  //           ['STC', 'multi', 'AMC', 'AMCR', 'AMCL'],
  //           ['DR', 'multi', 'AMR', 'MR'],
  //           ['DL', 'multi', 'AML', 'ML'],
  //           ['AMC', 'MC'],
  //           ['STC', 'AMC'],
  //           ['MC', 'DMC'],
  //           ['DMC', 'DCL'],
  //           ['DMC', 'DCR']
  //         );
  //       }
  //     } else if (obj.def === 3) {
  //       chemArr.push(
  //         ['GK', 'DCL'],
  //         ['GK', 'DCR'],
  //         ['GK', 'DC'],
  //         ['DCL', 'DC'],
  //         ['DCR', 'DC'],
  //         ['DCR', 'WBR'],
  //         ['DCL', 'WBL']
  //       );
  //     }
  //   }
  //   chemArr.forEach((arr) => {
  //     let first: Player;
  //     let second: Player;
  //     this.pitchPlayers.forEach((player) => {
  //       // check for multiple possible positions for player1
  //       if (arr[0] === 'multi') {
  //         for (let i = 1; i < arr.length; i++) {
  //           if (player.pitchPosition === arr[i]) {
  //             first = player;
  //             break;
  //           }
  //         }
  //       }
  //       // Check for first player in chem pair
  //       else if (player.pitchPosition === arr[0]) {
  //         first = player;
  //       }
  //       // check for multiple possible positions for player2
  //       else if (arr[1] === 'multi') {
  //         for (let i = 2; i < arr.length; i++) {
  //           if (player.pitchPosition === arr[i]) {
  //             second = player;
  //             break;
  //           }
  //         }
  //       } else if (player.pitchPosition === arr[1]) {
  //         // Check for second player in chem pair
  //         second = player;
  //       }
  //       if (first && second && first.chemistryNum && second.chemistryNum) {
  //         if (first.nationality === second.nationality) {
  //           this.chemistry++;
  //           first.chemistryNum++;
  //           second.chemistryNum++;
  //         }
  //         if (first.club === second.club) {
  //           this.chemistry++;
  //           first.chemistryNum++;
  //           second.chemistryNum++;
  //         }
  //         break;
  //       }
  //     });
  //   });
  // }

  // // getChemColor(player: Player) {
  // //   if (player.chemistryNum) {
  // //     if (player.chemistryNum === 1) {
  // //       return '1px dashed yellow';
  // //     }
  // //     if (player.chemistryNum === 2) {
  // //       return '1px dashed lime';
  // //     }
  // //     if (player.chemistryNum > 2) {
  // //       return '1px dashed pink';
  // //     }
  // //     return '1px solid #353535';
  // //   }
  // //   return false
  // // }

  // calcStartersRating() {
  //   const startersArr: number[] = [];
  //   this.pitchPlayers.forEach((player) => {
  //     if (player.pitchRating !== undefined) {
  //       switch (player.pitchPosition) {
  //         case 'DR':
  //         case 'DL':
  //           startersArr.push(player.pitchRating * 0.88);
  //           break;
  //         case 'WBL':
  //         case 'WBR':
  //         case 'MR':
  //         case 'ML':
  //           startersArr.push(player.pitchRating * 0.97);
  //           break;
  //         case 'GK':
  //         case 'DCR':
  //         case 'DCL':
  //         case 'DC':
  //         case 'AMR':
  //         case 'AML':
  //           startersArr.push(player.pitchRating * 0.99);
  //           break;
  //         case 'AMCR':
  //         case 'AMC':
  //         case 'AMCL':
  //         case 'DMC':
  //         case 'DMR':
  //         case 'DML':
  //           startersArr.push(player.pitchRating * 1.01);
  //           break;
  //         case 'STC':
  //         case 'STCL':
  //         case 'STCR':
  //         case 'MC':
  //         case 'MCR':
  //         case 'MCL':
  //           startersArr.push(player.pitchRating * 1.03);
  //           break;
  //         default:
  //           console.log('error');
  //           break;
  //       }
  //     } else {
  //       console.log('Error: check home component');
  //     }
  //   });
  //   this.startersTotalRating = calcSumRating(startersArr);
  // }
}
