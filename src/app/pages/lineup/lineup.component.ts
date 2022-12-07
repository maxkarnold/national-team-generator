import { Component } from '@angular/core';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss'],
})
export class LineupComponent {
  constructor() {}

  // checkFormation() {
  //   const squad = this.pitchPlayers.concat(this.players.slice(0, 12));
  //   let gkCount = 0;
  //   let defCount = 0;
  //   let midCount = 0;
  //   let fwCount = 0;
  //   let startMidCount = 0;
  //   let startGkCount = 0;

  //   let DMCount = 0;
  //   let WBCount = 0;
  //   let AMCCount = 0;
  //   let AMRLCount = 0;
  //   let MCCount = 0;
  //   let MRLCount = 0;
  //   let DFCount = 0;
  //   let STCount = 0;

  //   this.pitchPlayers.forEach((player) => {
  //     if (player.pitchPosition?.includes('DM')) {
  //       DMCount++;
  //       startMidCount++;
  //     } else if (player.pitchPosition?.slice(0, 1) === 'D') {
  //       DFCount++;
  //     } else if (player.pitchPosition?.includes('WB')) {
  //       WBCount++;
  //     } else if (player.pitchPosition?.includes('AMC')) {
  //       AMCCount++;
  //       startMidCount++;
  //     } else if (player.pitchPosition?.includes('STC')) {
  //       STCount++;
  //     } else if (player.pitchPosition?.includes('AM')) {
  //       AMRLCount++;
  //     } else if (player.pitchPosition?.includes('MC')) {
  //       MCCount++;
  //     } else if (player.pitchPosition?.includes('M')) {
  //       MRLCount++;
  //     } else {
  //       startGkCount++;
  //     }
  //   });

  //   squad.forEach((player) => {
  //     if (player.mainPositions.includes('GK')) {
  //       gkCount++;
  //     } else if (player.mainPositions.includes('B')) {
  //       defCount++;
  //     } else if (player.mainPositions.includes('M')) {
  //       midCount++;
  //     } else {
  //       fwCount++;
  //     }
  //   });
  //   // Formation

  //   if (DFCount === 4) {
  //     if (DMCount === 1) {
  //       if (
  //         MCCount === 1 &&
  //         MRLCount === 1 &&
  //         AMCCount === 1 &&
  //         AMRLCount === 1 &&
  //         STCount === 1
  //       ) {
  //         this.formation = '4-1-4-1 DM Asymmetric AM (R/L)';
  //       } else if (MCCount === 2) {
  //         if (AMCCount === 1 && STCount === 2) {
  //           this.formation = '4-4-2 Diamond Narrow';
  //         } else if (AMCCount === 2 && STCount === 1) {
  //           this.formation = '4-1-2-3 DM AM Narrow';
  //         } else if (AMRLCount === 2 && STCount === 1) {
  //           this.formation = '4-1-4-1 DM Wide';
  //         } else if (MRLCount === 2 && STCount === 1) {
  //           this.formation = '4-1-4-1 DM';
  //         } else if (STCount === 3) {
  //           this.formation = '4-1-2-3 DM Narrow';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else if (MCCount === 3) {
  //         if (AMCCount === 1 && STCount === 1) {
  //           this.formation = '4-1-3-1-1 DM AM Narrow';
  //         } else if (STCount === 2) {
  //           this.formation = '4-1-3-2 DM Narrow';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else {
  //         this.formation = 'N/A';
  //       }
  //     } else if (DMCount === 2) {
  //       if (MCCount === 1 && AMRLCount === 2 && STCount === 1) {
  //         this.formation = '4-2-1-3 DM Wide';
  //       } else if (MCCount === 1 && MRLCount === 2 && STCount === 1) {
  //         this.formation = '4-2-3-1 DM MC Wide';
  //       } else if (MCCount === 3 && STCount === 1) {
  //         this.formation = '4-2-3-1 DM';
  //       } else if (MCCount === 2 && AMCCount === 1 && STCount === 1) {
  //         this.formation = '4-2-2-1-1 DM AM Narrow';
  //       } else if (MCCount === 2 && STCount === 2) {
  //         this.formation = '4-2-2-2 DM Narrow';
  //       } else if (AMCCount === 1 && AMRLCount === 2 && STCount === 1) {
  //         this.formation = '4-2-3-1 DM AM Wide';
  //       } else if (AMRLCount === 2 && STCount === 2) {
  //         this.formation = '4-2-4 DM Wide';
  //       } else if (AMCCount === 3 && STCount === 1) {
  //         this.formation = '4-2-3-1 DM AM Narrow';
  //       } else if (MRLCount === 2 && AMCCount === 1 && STCount === 1) {
  //         this.formation = '4-4-1-1 2DM';
  //       } else if (AMCCount === 2 && STCount === 2) {
  //         this.formation = '4-2-2-2 DM AM Narrow';
  //       } else if (MRLCount === 2 && STCount === 2) {
  //         this.formation = '4-2-2-2 DM';
  //       } else {
  //         this.formation = 'N/A';
  //       }
  //     } else if (MCCount === 2) {
  //       if (AMRLCount > 0) {
  //         if (STCount === 2 && AMRLCount === 2) {
  //           this.formation = '4-2-4 Wide';
  //         } else if (AMCCount === 1 && AMRLCount === 2 && STCount === 1) {
  //           this.formation = '4-2-3-1 Wide';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else if (AMCCount > 0) {
  //         if (STCount === 2 && AMCCount === 2) {
  //           this.formation = '4-2-2-2 Narrow';
  //         } else if (STCount === 1 && AMCCount === 3) {
  //           this.formation = '4-2-3-1 Narrow';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else {
  //         this.formation = 'N/A';
  //       }
  //     } else if (MCCount === 3) {
  //       if (AMRLCount === 2 && STCount === 1) {
  //         this.formation = '4-3-3 Wide';
  //       } else if (AMCCount === 1 && STCount === 2) {
  //         this.formation = '4-3-1-2 Narrow';
  //       } else if (AMCCount === 2 && STCount === 1) {
  //         this.formation = '4-3-2-1 Narrow';
  //       } else if (STCount === 3) {
  //         this.formation = '4-3-3 Narrow';
  //       } else {
  //         this.formation = 'N/A';
  //       }
  //     } else if (MRLCount === 2) {
  //       if (MCCount === 3 && STCount === 1) {
  //         this.formation = '4-5-1';
  //       } else if (MCCount === 2 && AMCCount === 1) {
  //         this.formation = '4-4-1-1';
  //       } else if (MCCount === 2 && STCount === 2) {
  //         this.formation = '4-4-2';
  //       } else {
  //         this.formation = 'N/A';
  //       }
  //     } else {
  //       this.formation = 'N/A';
  //     }
  //   } else if (DFCount === 3) {
  //     if (WBCount === 2) {
  //       if (DMCount === 1) {
  //         if (MCCount === 3 && STCount === 1) {
  //           this.formation = '5-1-3-1 DM WB';
  //         } else if (STCount === 2 && MCCount === 2) {
  //           this.formation = '5-1-2-2 DM WB';
  //         } else if (MCCount === 2 && AMCCount === 1 && STCount === 1) {
  //           this.formation = '5-4-1 Diamond WB';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else if (DMCount === 2) {
  //         if (MCCount === 2 && STCount === 1) {
  //           this.formation = '3-4-2-1 DM';
  //         } else if (AMRLCount === 2 && STCount === 1) {
  //           this.formation = '3-4-3 DM Wide';
  //         } else if (AMCCount === 2 && STCount === 1) {
  //           this.formation = '3-4-2-1 DM AM';
  //         } else if (MCCount === 1 && STCount === 2) {
  //           this.formation = '5-2-1-2 DM WB';
  //         } else if (AMCCount === 1 && STCount === 2) {
  //           this.formation = '5-2-1-2 DM AM WB';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else if (MCCount === 2) {
  //         if (AMRLCount === 2 && STCount === 1) {
  //           this.formation = '5-4-1 WB Wide';
  //         } else if (AMCCount === 2 && STCount === 1) {
  //           this.formation = '5-2-2-1 WB';
  //         } else if (AMCCount === 1 && STCount === 2) {
  //           this.formation = '5-2-1-2 WB';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else if (MCCount === 3) {
  //         if (STCount === 2) {
  //           this.formation = '5-3-2 WB';
  //         } else if (AMCCount === 1 && STCount === 1) {
  //           this.formation = '5-3-1-1 WB';
  //         } else {
  //           this.formation = 'N/A';
  //         }
  //       } else {
  //         this.formation = 'N/A';
  //       }
  //     } else if (MRLCount === 2) {
  //       if (DMCount === 2 && AMCCount === 2 && STCount === 1) {
  //         this.formation = '3-4-2-1 DM AM MRL';
  //       }
  //     } else {
  //       this.formation = 'N/A';
  //     }
  //   } else {
  //     this.formation = 'N/A';
  //   }

  //   // const formObj = {
  //   //   def: DFCount,
  //   //   dm: DMCount,
  //   //   wb: WBCount,
  //   //   mc: MCCount,
  //   //   mrl: MRLCount,
  //   //   amc: AMCCount,
  //   //   amrl: AMRLCount,
  //   //   st: STCount,
  //   // };
  //   // this.calcChemistry(formObj);
  //   const count = [
  //     gkCount,
  //     defCount,
  //     midCount,
  //     fwCount,
  //     startGkCount,
  //     DFCount,
  //     startMidCount,
  //     STCount,
  //   ];
  //   return this.checkSquadRules(count);
  // }

  // getPositionBox(box: PositionBox) {
  //   return box.class;
  // }

  // getPlayerClass(b: PositionBox) {
  //   const box = b;
  //   const posNum = parseInt(box.class.slice(-2), 10);
  //   // if posBox is a playable position
  //   if (!Number.isNaN(posNum)) {
  //     this.pitchPositions.forEach((pos) => {
  //       const player = this.pitchPlayers.find(
  //         (p) => p.pitchPosition === pos.position
  //       );
  //       if (player)
  //         if (player.mainPositions.includes(pos.playerPosition)) {
  //           // if main position (natural ~ lightest green ~ 0 change)
  //           player.pitchRating = player.rating;
  //         }
  //         // else if alt position (accomplished ~ darker green)
  //         else if (player.altPositions.includes(pos.playerPosition)) {
  //           player.pitchRating = player.rating - 3;
  //         }
  //         // add another section for playable positions (new property: competent ~ dark yellow-green ~ -6 change)
  //         else if (player.competentPositions.includes(pos.playerPosition)) {
  //           player.pitchRating = player.rating - 6;
  //         }
  //         // add another section for playable positions (new property: unconvincing ~ dark yellow ~ -12 change)
  //         else if (player.unconvincingPositions.includes(pos.playerPosition)) {
  //           player.pitchRating = player.rating - 12;
  //         }
  //         // else if gk position but not gk or else if outfield position but gk (ineffectual ~ red)
  //         else if (
  //           (pos.playerPosition === 'GK' &&
  //             !player.mainPositions.includes('GK')) ||
  //           (pos.playerPosition !== 'GK' && player.mainPositions.includes('GK'))
  //         ) {
  //           player.pitchRating = 20;
  //         }
  //         // any other position (awkward ~ dark orange ~ -25 change)
  //         else {
  //           player.pitchRating = player.rating - 25;
  //         }
  //     });
  //     const player = this.pitchPlayers.find((p) =>
  //       this.pitchPositions.find(
  //         (_pos, i) => p.pitchPositionIndex === i && p.pitchRating !== undefined
  //       )
  //     );
  //     if (typeof player !== 'undefined' && player?.pitchRating) {
  //       box.playerClass = 'active player-box';
  //       if (player.pitchRating > 81) {
  //         box.playerClass += ' diamond';
  //       } else if (player.pitchRating > 75) {
  //         box.playerClass += ' platinum';
  //       } else if (player.pitchRating > 69) {
  //         box.playerClass += ' gold';
  //       } else if (player.pitchRating > 61) {
  //         box.playerClass += ' silver';
  //       } else if (player.pitchRating > 54) {
  //         box.playerClass += ' bronze';
  //       } else {
  //         box.playerClass += ' brown';
  //       }
  //       box.pitchPlayer = player;
  //       return box.playerClass;
  //     }

  //     box.playerClass = 'inactive player-box';
  //     box.pitchPlayer = undefined;
  //     return box.playerClass;
  //   }
  //   return box.playerClass;
  // }

  // getPosBoxClass(b: PositionBox) {
  //   const box = b;
  //   const pos = parseInt(box.class.slice(-2), 10);
  //   // if posBox is a playable position
  //   if (!Number.isNaN(pos)) {
  //     // for each of the current pitch players
  //     if (
  //       this.pitchPlayers.find((player) => player.pitchPositionIndex === pos)
  //     ) {
  //       box.posBoxClass = 'inactive pos-box';
  //     }
  //   }
  //   return box.posBoxClass;
  // }

  // drop(event: CdkDragDrop<Player[]>) {
  //   const newPlayerIndex = event.previousIndex;
  //   let newPlayer = event.previousContainer.data[newPlayerIndex];
  //   const positionIndex = parseInt(
  //     event.container.element.nativeElement.classList[1],
  //     10
  //   );

  //   if (event.previousContainer === event.container) {
  //     // if moving within same container
  //     moveItemInArray(
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //   } else if (event.previousContainer.id === 'bench-players') {
  //     // if moving from bench container and to the pitch
  //     // Check for 11 players in starting lineup and no player swap
  //     if (
  //       this.pitchPlayers.length === 11 &&
  //       event.container.element.nativeElement.innerText === ''
  //     ) {
  //       alert('You can only have 11 players starting.');
  //       return false;
  //     }
  //     newPlayer.pitchPositionIndex = positionIndex;
  //     switch (positionIndex) {
  //       case 0:
  //         newPlayer.pitchPosition = 'GK';
  //         break;
  //       case 1:
  //         newPlayer.pitchPosition = 'DR';
  //         break;
  //       case 2:
  //         newPlayer.pitchPosition = 'DCR';
  //         break;
  //       case 3:
  //         newPlayer.pitchPosition = 'DC';
  //         break;
  //       case 4:
  //         newPlayer.pitchPosition = 'DCL';
  //         break;
  //       case 5:
  //         newPlayer.pitchPosition = 'DL';
  //         break;
  //       case 6:
  //         newPlayer.pitchPosition = 'WBR';
  //         break;
  //       case 7:
  //         newPlayer.pitchPosition = 'DMR';
  //         break;
  //       case 8:
  //         newPlayer.pitchPosition = 'DMC';
  //         break;
  //       case 9:
  //         newPlayer.pitchPosition = 'DML';
  //         break;
  //       case 10:
  //         newPlayer.pitchPosition = 'WBL';
  //         break;
  //       case 11:
  //         newPlayer.pitchPosition = 'MR';
  //         break;
  //       case 12:
  //         newPlayer.pitchPosition = 'MCR';
  //         break;
  //       case 13:
  //         newPlayer.pitchPosition = 'MC';
  //         break;
  //       case 14:
  //         newPlayer.pitchPosition = 'MCL';
  //         break;
  //       case 15:
  //         newPlayer.pitchPosition = 'ML';
  //         break;
  //       case 16:
  //         newPlayer.pitchPosition = 'AMR';
  //         break;
  //       case 17:
  //         newPlayer.pitchPosition = 'AMCR';
  //         break;
  //       case 18:
  //         newPlayer.pitchPosition = 'AMC';
  //         break;
  //       case 19:
  //         newPlayer.pitchPosition = 'AMCL';
  //         break;
  //       case 20:
  //         newPlayer.pitchPosition = 'AML';
  //         break;
  //       case 21:
  //         newPlayer.pitchPosition = 'STCR';
  //         break;
  //       case 22:
  //         newPlayer.pitchPosition = 'STC';
  //         break;
  //       case 23:
  //         newPlayer.pitchPosition = 'STCL';
  //         break;
  //       default:
  //         console.log('Error in drop() function');
  //         break;
  //     }

  //     // if swapping a player
  //     if (event.container.element.nativeElement.innerText !== '') {
  //       for (let i = 0; i < this.pitchPlayers.length; i++) {
  //         if (this.pitchPlayers[i].pitchPosition === newPlayer.pitchPosition) {
  //           const oldPlayer = this.pitchPlayers[i];
  //           oldPlayer.pitchPosition = undefined;
  //           oldPlayer.pitchPositionIndex = undefined;
  //           this.pitchPlayers.splice(i, 1);
  //           this.players.splice(newPlayerIndex, 1, oldPlayer);
  //         }
  //       }
  //     } else {
  //       this.players.splice(newPlayerIndex, 1);
  //     }
  //     this.pitchPlayers.push(newPlayer);
  //     const el = event.container.element.nativeElement;
  //     // el.children[0].className = "active player-box";
  //     el.children[1].className = 'inactive pos-box';
  //   }
  //   // Else if the player is moved to the bench
  //   else if (event.container.id === 'bench-players') {
  //     const el = event.previousContainer.element.nativeElement;

  //     for (let i = 0; i < this.pitchPlayers.length; i++) {
  //       if (
  //         parseInt(el.classList[1], 10) ===
  //         this.pitchPlayers[i].pitchPositionIndex
  //       ) {
  //         const prevIndex = i;
  //         transferArrayItem(
  //           event.previousContainer.data,
  //           event.container.data,
  //           prevIndex,
  //           event.currentIndex
  //         );
  //         const movingPlayer: Player = event.container.data[event.currentIndex];
  //         movingPlayer.pitchPosition = undefined;
  //         movingPlayer.pitchPositionIndex = undefined;
  //       }
  //     }
  //     el.children[0].className = 'inactive player-box';
  //     el.children[1].className = 'active pos-box';
  //   }
  //   // Else if the player is moved to another pitch position
  //   else if (
  //     event.previousContainer.id !== 'bench-players' &&
  //     event.container.id !== 'bench-players'
  //   ) {
  //     newPlayer = event.item.data.pitchPlayer;
  //     const el = event.container.element.nativeElement;
  //     const prevEl = event.previousContainer.element.nativeElement;
  //     // if swapping a player
  //     if (event.container.element.nativeElement.innerText !== '') {
  //       for (let i = 0; i < this.pitchPlayers.length; i++) {
  //         if (
  //           this.pitchPlayers[i].pitchPositionIndex ===
  //           parseInt(event.container.element.nativeElement.classList[1], 10)
  //         ) {
  //           const oldPlayer = this.pitchPlayers[i];
  //           oldPlayer.pitchPosition = newPlayer.pitchPosition;
  //           oldPlayer.pitchPositionIndex = newPlayer.pitchPositionIndex;
  //         }
  //       }
  //     } else {
  //       prevEl.children[1].className = 'active pos-box';
  //     }
  //     newPlayer.pitchPositionIndex = positionIndex;
  //     el.children[1].className = 'inactive pos-box';
  //     switch (positionIndex) {
  //       case 0:
  //         newPlayer.pitchPosition = 'GK';
  //         break;
  //       case 1:
  //         newPlayer.pitchPosition = 'DR';
  //         break;
  //       case 2:
  //         newPlayer.pitchPosition = 'DCR';
  //         break;
  //       case 3:
  //         newPlayer.pitchPosition = 'DC';
  //         break;
  //       case 4:
  //         newPlayer.pitchPosition = 'DCL';
  //         break;
  //       case 5:
  //         newPlayer.pitchPosition = 'DL';
  //         break;
  //       case 6:
  //         newPlayer.pitchPosition = 'WBR';
  //         break;
  //       case 7:
  //         newPlayer.pitchPosition = 'DMR';
  //         break;
  //       case 8:
  //         newPlayer.pitchPosition = 'DMC';
  //         break;
  //       case 9:
  //         newPlayer.pitchPosition = 'DML';
  //         break;
  //       case 10:
  //         newPlayer.pitchPosition = 'WBL';
  //         break;
  //       case 11:
  //         newPlayer.pitchPosition = 'MR';
  //         break;
  //       case 12:
  //         newPlayer.pitchPosition = 'MCR';
  //         break;
  //       case 13:
  //         newPlayer.pitchPosition = 'MC';
  //         break;
  //       case 14:
  //         newPlayer.pitchPosition = 'MCL';
  //         break;
  //       case 15:
  //         newPlayer.pitchPosition = 'ML';
  //         break;
  //       case 16:
  //         newPlayer.pitchPosition = 'AMR';
  //         break;
  //       case 17:
  //         newPlayer.pitchPosition = 'AMCR';
  //         break;
  //       case 18:
  //         newPlayer.pitchPosition = 'AMC';
  //         break;
  //       case 19:
  //         newPlayer.pitchPosition = 'AMCL';
  //         break;
  //       case 20:
  //         newPlayer.pitchPosition = 'AML';
  //         break;
  //       case 21:
  //         newPlayer.pitchPosition = 'STCR';
  //         break;
  //       case 22:
  //         newPlayer.pitchPosition = 'STC';
  //         break;
  //       case 23:
  //         newPlayer.pitchPosition = 'STCL';
  //         break;
  //       default:
  //         console.log('Error in drop() function');
  //         break;
  //     }
  //   }
  //   window.setTimeout(() => {
  //     // starter/squad rating calculation
  //     this.startersTotalRating = 0;
  //     const ratingArr = [];
  //     this.pitchPlayers.forEach((p) => {
  //       if (p.pitchRating) {
  //         ratingArr.push(p.pitchRating);
  //       }
  //     });

  //     this.calcStartersRating();

  //     this.squadTotalRating = 0;
  //     for (let i = 0; i < 12; i++) {
  //       ratingArr.push(this.players[i].rating);
  //     }

  //     this.squadTotalRating = calcSumRating(ratingArr);
  //     checkStars(this.startersTotalRating, this.squadTotalRating);

  //     // sortedData
  //     this.sortedData = this.pitchPlayers.concat(this.players);
  //     if (this.pitchPlayers.length > 1) {
  //       this.sortedPitchPlayers = this.pitchPlayers.sort((a, b) => {
  //         if (
  //           a.pitchPositionIndex !== undefined &&
  //           b.pitchPositionIndex !== undefined
  //         ) {
  //           if (a.pitchPositionIndex < b.pitchPositionIndex) {
  //             return -1;
  //           }
  //           if (a.pitchPositionIndex > b.pitchPositionIndex) {
  //             return 1;
  //           }
  //         }
  //         return 0;
  //       });
  //     } else if (this.pitchPlayers.length > 0) {
  //       this.sortedPitchPlayers = this.pitchPlayers;
  //     }

  //     // backupPositionChecker
  //     if (this.pitchPlayers.length === 11) {
  //       this.getBackupPositions();
  //     } else {
  //       this.squadRules[7].check = '❌';
  //     }
  //   }, 250);
  // }

  // getPositionOutline(event: CdkDragStart) {
  //   const player: Player = event.source.data.pitchPlayer || event.source.data;
  //   // Add a placeholder element in origin

  //   // Get the displayName for the current player

  //   if (player.singleLastName.length < 8) {
  //     player.displayName = player.singleLastName;
  //   } else {
  //     [player.displayName] = player.firstNames;
  //   }

  //   // // Grab the current positions for the dragged player

  //   const mainPosArr = player.mainPositions;
  //   const altPosArr = player.altPositions;
  //   const compPosArr = player.competentPositions;
  //   const unPosArr = player.unconvincingPositions;
  //   const limeArr = [];
  //   const darkGreenArr = [];
  //   const yellowGreenArr = [];
  //   const orangeArr = [];

  //   for (let i = 0; i < this.pitchPositions.length; i++) {
  //     if (mainPosArr.includes(this.pitchPositions[i].playerPosition)) {
  //       // For each main position
  //       for (let j = 0; j < mainPosArr.length; j++) {
  //         // if the player's main position matches the playerPosition
  //         if (mainPosArr[j] === this.pitchPositions[i].playerPosition) {
  //           // push taht position to the array
  //           limeArr.push(this.pitchPositions[i].position);
  //         }
  //       }
  //     } else if (altPosArr.includes(this.pitchPositions[i].playerPosition)) {
  //       // For each alt position
  //       for (let j = 0; j < altPosArr.length; j++) {
  //         // if the player's alt position matches the playerPosition
  //         if (altPosArr[j] === this.pitchPositions[i].playerPosition) {
  //           // push that position to the array
  //           darkGreenArr.push(this.pitchPositions[i].position);
  //         }
  //       }
  //     } else if (compPosArr.includes(this.pitchPositions[i].playerPosition)) {
  //       // for each competent position
  //       for (let j = 0; j < compPosArr.length; j++) {
  //         // if the player's alt position matches the playerPosition
  //         if (compPosArr[j] === this.pitchPositions[i].playerPosition) {
  //           // push that position to the array
  //           yellowGreenArr.push(this.pitchPositions[i].position);
  //         }
  //       }
  //     } else if (unPosArr.includes(this.pitchPositions[i].playerPosition)) {
  //       // for each unconvincing position
  //       for (let j = 0; j < unPosArr.length; j++) {
  //         // if the player's alt position matches the playerPosition
  //         if (unPosArr[j] === this.pitchPositions[i].playerPosition) {
  //           // push that position to the array
  //           orangeArr.push(this.pitchPositions[i].position);
  //         }
  //       }
  //     }
  //   }

  //   // For each playing position
  //   for (let i = 0; i < this.pitchPositions.length; i++) {
  //     // and for each position box
  //     for (let j = 0; j < this.positionBoxes.length; j++) {
  //       // get the number from the position box class if possible
  //       const boxNum = parseInt(this.positionBoxes[j].class.slice(-2), 10);
  //       // if there is a number in the class, it must be a playable position
  //       if (!Number.isNaN(boxNum)) {
  //         // If the pitchPosition index correlates with the box index, it's the same position
  //         if (this.pitchPositions[i].boxIndex === j) {
  //           // If this position correlates with the green array
  //           if (limeArr.includes(this.pitchPositions[i].position)) {
  //             this.positionBoxes[j].class += ' natural-placeholder';
  //           }
  //           // Else if this position correlates with the yellow array
  //           else if (darkGreenArr.includes(this.pitchPositions[i].position)) {
  //             this.positionBoxes[j].class += ' accomplished-placeholder';
  //           } else if (
  //             yellowGreenArr.includes(this.pitchPositions[i].position)
  //           ) {
  //             this.positionBoxes[j].class += ' competent-placeholder';
  //           } else if (orangeArr.includes(this.pitchPositions[i].position)) {
  //             this.positionBoxes[j].class += ' unconvincing-placeholder';
  //           } else if (
  //             (mainPosArr.includes('GK') &&
  //               this.pitchPositions[i].position !== 'GK') ||
  //             (!mainPosArr.includes('GK') &&
  //               this.pitchPositions[i].position === 'GK')
  //           ) {
  //             this.positionBoxes[j].class += ' ineffectual-placeholder';
  //           }
  //           // Else the position is red
  //           else {
  //             this.positionBoxes[j].class += ' awkward-placeholder';
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // removeOutlineDrop(event: CdkDragDrop<Player>) {
  //   this.positionBoxes.map((box) => {
  //     const outlineClass = box.class.split(' ')[2];
  //     switch (outlineClass) {
  //       case 'natural-placeholder':
  //       case 'awkward-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -20),
  //         };
  //       case 'accomplished-placeholder':
  //       case 'unconvincing-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -25),
  //         };
  //       case 'competent-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -22),
  //         };
  //       case 'ineffectual-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -24),
  //         };
  //       default:
  //         return box;
  //     }
  //   });
  // }

  // removeOutlineRelease(event: CdkDragRelease) {
  //   this.positionBoxes.map((box) => {
  //     const outlineClass = box.class.split(' ')[2];
  //     switch (outlineClass) {
  //       case 'natural-placeholder':
  //       case 'awkward-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -20),
  //         };
  //       case 'accomplished-placeholder':
  //       case 'unconvincing-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -25),
  //         };
  //       case 'competent-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -22),
  //         };
  //       case 'ineffectual-placeholder':
  //         return {
  //           ...box,
  //           class: box.class.slice(0, -24),
  //         };
  //       default:
  //         return box;
  //     }
  //   });
  // }
}
