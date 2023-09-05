import { Component } from '@angular/core';
import { CreateRosterService } from '@core/services/create-roster.service';
import { Roster, RosterData } from 'app/models/roster.model';
import { Observable } from 'rxjs';
import { Club } from 'app/models/club.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/services/firestore.model';

@UntilDestroy()
@Component({
  selector: 'app-build-roster',
  templateUrl: './build-roster.component.html',
  styleUrls: ['./build-roster.component.scss'],
  providers: [CreateRosterService],
})
export class BuildRosterComponent {
  createRosterService;
  auth;
  user?: User;

  roster?: Roster;
  nationSelectValue = 's tier';
  rosterId = '';

  constructor(createRosterService: CreateRosterService, auth: AuthService) {
    this.createRosterService = createRosterService;
    this.auth = auth;
  }

  ngOnInit(): void {
    this.auth.user$.pipe(untilDestroyed(this)).subscribe(user => {
      if (user !== null && user !== undefined) {
        this.user = user;
      }
    });
  }

  createRoster(): void {
    if (this.nationSelectValue === '') {
      alert('You must select a nation or random nationalities before generating a team');
      // return;
    }
    // *** KEEP THIS COMMENTED FOR DEV BRANCH ***
    // let lastTime: any = localStorage.getItem('Last request time');
    // let currentTime = new Date().getTime();
    // if (lastTime !== null) {
    //   lastTime = parseInt(lastTime);
    // }
    // if (lastTime + 300000 > currentTime) { // if 5 minutes haven't passed since last request
    //   let timeLeft = (lastTime + 300000) - currentTime;
    //   let min = Math.floor(timeLeft / 60000);
    //   let seconds = Math.round((timeLeft % 60000) / 1000)
    //   let str = seconds == 60 ? (min+1) + ":00" : min + ":" + (seconds < 10 ? "0" : "") + seconds;

    //   alert(`Please wait ${str} to generate a new team.`);
    //   return
    // }
    // *** KEEP THIS COMMENTED FOR DEV BRANCH ***
    // if (this.roster) {
    //   if (window.confirm('Are you sure? Any unsaved data will be deleted.')) {
    //     this.resetStarters(true);
    //   } else {
    //     return;
    //   }
    // }
    // const timestamp = new Date().getTime().toString();
    // localStorage.setItem('Last request time', timestamp);
    // if (this.user) {
    //   const rosterData: RosterData = {
    //     user: this.user,
    //     id: this.rosterId,
    //     nationOrTier: this.nationSelectValue,
    //   };
    //   this.roster = this.createRosterService.createRoster(rosterData);
    // }
  }

  // async savePlayers(saveLocation: string, saveName?: string) {
  //   if (saveLocation === 'localStorage') {
  //     if (localStorage.length > 1) {
  //       if (
  //         window.confirm(
  //           'Are you sure you want to overwrite your current roster saved in Local Storage?'
  //         )
  //       ) {
  //         const user = localStorage.getItem('user');
  //         const rosters = [];
  //         for (let i = 0; i < 100; i++) {
  //           const roster = localStorage.getItem(`Roster #${i}`) || null;
  //           if (roster === null) {
  //             break;
  //           }
  //           rosters.push(roster);
  //         }
  //         localStorage.clear();
  //         if (user !== null) {
  //           localStorage.setItem('user', user);
  //         }
  //         if (rosters.length > 0) {
  //           for (let i = 0; i < rosters.length; i++) {
  //             localStorage.setItem(`Roster #${i}`, rosters[i]);
  //           }
  //         }
  //       } else {
  //         return false;
  //       }
  //     }
  //     for (let i = 0; i < this.players.length; i++) {
  //       localStorage.setItem(
  //         `TEAMGEN - Player #${i}`,
  //         JSON.stringify(this.players[i])
  //       );
  //     }
  //     for (let i = 0; i < this.pitchPlayers.length; i++) {
  //       localStorage.setItem(
  //         `TEAMGEN - Starting Player #${i + 1}`,
  //         JSON.stringify(this.pitchPlayers[i])
  //       );
  //     }
  //     localStorage.setItem(
  //       `TEAMGEN - Tier/Nationality`,
  //       JSON.stringify(this.nationOrTier)
  //     );
  //     localStorage.setItem(`Firestore ID`, JSON.stringify(this.rosterId));
  //     console.log('Roster ID: ', this.rosterId);
  //   } else if (saveLocation === 'firestore' && saveName !== undefined) {
  //     if (!this.isLoggedIn) {
  //       alert('You must be logged in to save roster to cloud');
  //       return false;
  //     }
  //     if (saveName.length < 4) {
  //       alert('Must be 4-20 characters long.');
  //       return false;
  //     }
  //     const user = JSON.parse(localStorage.getItem('user') || '');
  //     if (this.savedData) {
  //       const data = this.savedData.find((obj) => obj.id === this.rosterId);
  //       console.log(this.rosterId, saveName);
  //       if (data) {
  //         // if it's a duplicate roster
  //         if (data.id === this.rosterId) {
  //           // duplicateId = true;
  //           if (
  //             window.confirm(
  //               `This is already saved, would you like to update the save name and roster`
  //             )
  //           ) {
  //             this.afs.updateRoster(
  //               user.uid,
  //               saveName,
  //               this.players,
  //               this.pitchPlayers,
  //               this.rosterId
  //             );
  //             this.saveDataOverlayOpen = false;
  //           } else {
  //             return false;
  //           }
  //         }
  //         // if it's a duplicate saveName
  //         else if (data.saveName === saveName) {
  //           // ask the user if they want to overwrite
  //           if (
  //             window.confirm(`${saveName} is already a roster name. Overwrite?`)
  //           ) {
  //             this.afs
  //               .saveRoster(
  //                 user.uid,
  //                 saveName,
  //                 this.players,
  //                 this.pitchPlayers,
  //                 this.nationOrTier
  //               )
  //               .then((docRef) => {
  //                 this.rosterId = docRef.id;
  //                 console.log('new roster id:\n', this.rosterId);
  //               });
  //             this.saveDataOverlayOpen = false;
  //           } else {
  //             return false;
  //           }
  //         }
  //       }
  //     }
  //     if (window.confirm('Are you sure you want to save?')) {
  //       this.afs
  //         .saveRoster(
  //           user.uid,
  //           saveName,
  //           this.players,
  //           this.pitchPlayers,
  //           this.nationOrTier
  //         )
  //         .then((docRef) => {
  //           this.rosterId = docRef.id;
  //           console.log('new roster id:\n', this.rosterId);
  //         });
  //       this.saveDataOverlayOpen = false;
  //     } else {
  //       return false;
  //     }
  //   }
  //   throw new Error('Problem with savePlayers() function');
  // }

  // saveDataOverlay() {
  //   this.loadDataOverlayOpen = false;
  //   if (this.saveDataOverlayOpen === false) {
  //     this.saveDataOverlayOpen = true;
  //   } else {
  //     this.saveDataOverlayOpen = false;
  //   }
  //   if (this.savedData.length < 1) {
  //     console.time('label');
  //     this.loadDataOverlay('save');
  //   }
  // }

  // loadDataOverlay(loadMore?: string) {
  //   if (loadMore !== 'save') {
  //     this.loadDataOverlayOpen = true;
  //     this.saveDataOverlayOpen = false;
  //     if (loadMore !== 'check') {
  //       return false;
  //     }
  //   }

  //   if (!this.isLoggedIn) {
  //     alert('You must be logged in to access cloud saved data');
  //     return false;
  //   }
  //   const user = JSON.parse(localStorage.getItem('user') || '');
  //   this.afs.getRosterId(user.uid).subscribe((obj: any) => {
  //     console.log('Checking firestore for save data...\n');
  //     for (const roster of obj) {
  //       const { id } = roster.payload.doc;
  //       const save = roster.payload.doc.data().saveName;
  //       let duplicateId = false;
  //       for (let i = 0; i < this.savedData.length; i++) {
  //         if (this.savedData[i].id === id) {
  //           duplicateId = true;
  //         }
  //       }
  //       if (!duplicateId) {
  //         this.savedData.push({ id, saveName: save });
  //       }
  //     }
  //     console.log(this.savedData);
  //   });
  // }

  // closeLoadDataOverlay() {
  //   this.loadDataOverlayOpen = false;
  // }

  // loadPlayers(saveLocation: string) {
  //   this.loadDataOverlayOpen = false;
  //   if (saveLocation === 'loadLocalStorage') {
  //     if (localStorage.length > 1) {
  //       this.players = [];
  //       this.sortedData = [];
  //       this.pitchPlayers = [];
  //       this.nationOrTier =
  //         localStorage.getItem(`TEAMGEN - Tier/Nationality`) || '';
  //       this.nationOrTier = this.nationOrTier.slice(1, -1);
  //       this.rosterId = localStorage.getItem(`Firestore ID`) || '';
  //       this.rosterId = this.rosterId.slice(1, -1);
  //       for (const index in this.positions) {
  //         this.positions[index].amount = 0;
  //       }
  //       for (const box of this.positionBoxes) {
  //         box.playerClass = 'inactive player-box';
  //         box.posBoxClass = 'active pos-box';
  //         box.pitchPlayer = undefined;
  //       }

  //       for (let i = 0; i < 60; i++) {
  //         const playerString = localStorage.getItem(`TEAMGEN - Player #${i}`);
  //         let player: Player;
  //         if (playerString !== null) {
  //           player = JSON.parse(playerString);
  //           this.players.push(player);
  //           this.sortedData.push(player);
  //         }
  //       }
  //       for (let i = 0; i < 11; i++) {
  //         const playerString = localStorage.getItem(
  //           `TEAMGEN - Starting Player #${i + 1}`
  //         );
  //         let player: Player;
  //         if (playerString !== null) {
  //           player = JSON.parse(playerString);
  //           this.pitchPlayers.push(player);
  //           this.sortedData.unshift(player);
  //         }
  //       }

  //       this.startersTotalRating = 0;
  //       const ratingArr = [];
  //       for (const player of this.pitchPlayers) {
  //         if (player.pitchRating !== undefined) {
  //           ratingArr.push(player.pitchRating);
  //         }
  //         for (let i = 0; i < this.pitchPositions.length; i++) {
  //           if (player.pitchPositionIndex !== undefined) {
  //             const { boxIndex } =
  //               this.pitchPositions[player.pitchPositionIndex];
  //             for (let j = 0; j < this.positionBoxes.length; j++) {
  //               if (this.positionBoxes[j] === this.positionBoxes[boxIndex]) {
  //                 this.positionBoxes[j].pitchPlayer = player;
  //               }
  //             }
  //           }
  //         }
  //       }

  //       this.calcStartersRating();
  //       this.squadTotalRating = 0;
  //       for (let i = 0; i < 12; i++) {
  //         ratingArr.push(this.players[i].rating);
  //       }

  //       this.squadTotalRating = calcSumRating(ratingArr);

  //       checkStars(this.startersTotalRating, this.squadTotalRating);

  //       const combinedPlayers = this.pitchPlayers.concat(this.players);
  //       for (const player of combinedPlayers) {
  //         for (const pos of this.positions) {
  //           if (player.mainPositions[0] === pos.position) {
  //             pos.amount++;
  //             break;
  //           }
  //         }
  //       }

  //       if (this.pitchPlayers.length > 1) {
  //         this.sortedPitchPlayers = this.pitchPlayers.sort((a, b) => {
  //           if (
  //             a.pitchPositionIndex !== undefined &&
  //             b.pitchPositionIndex !== undefined
  //           ) {
  //             if (a.pitchPositionIndex < b.pitchPositionIndex) {
  //               return -1;
  //             }
  //             if (a.pitchPositionIndex > b.pitchPositionIndex) {
  //               return 1;
  //             }
  //           }
  //           return 0;
  //         });
  //       } else if (this.pitchPlayers.length > 0) {
  //         this.sortedPitchPlayers = this.pitchPlayers;
  //       }

  //       for (const rule of this.squadRules) {
  //         if (rule.check === '✅') {
  //           rule.check = '❌';
  //         }
  //         this.squadRules[8].text = '';
  //       }
  //       if (this.pitchPlayers.length === 11) {
  //         this.getBackupPositions();
  //       } else {
  //         this.squadRules[7].check = '❌';
  //       }
  //       console.log('Successfully loaded', this.players, this.pitchPlayers);
  //     } else {
  //       throw new Error('Local Storage Data not found');
  //     }
  //   } else {
  //     const user = JSON.parse(localStorage.getItem('user') || '');
  //     for (const box of this.positionBoxes) {
  //       box.playerClass = 'inactive player-box';
  //       box.posBoxClass = 'active pos-box';
  //       box.pitchPlayer = undefined;
  //     }
  //     for (const index in this.positions) {
  //       this.positions[index].amount = 0;
  //     }
  //     this.players = [];
  //     this.sortedData = [];
  //     this.pitchPlayers = [];
  //     this.afs.getRoster(user.uid, saveLocation).subscribe((obj: any) => {
  //       const data = obj.payload.data();
  //       if (data !== undefined) {
  //         this.players = data.benchReserves;
  //         this.sortedData = data.starters.concat(data.benchReserves);
  //         this.pitchPlayers = data.starters;
  //         this.nationOrTier = data.nationOrTier;
  //         this.rosterId = obj.payload.id;
  //         console.log('Firestore ID', this.rosterId);
  //       } else {
  //         console.log('Problem loading data from firestore');
  //       }

  //       this.startersTotalRating = 0;
  //       const ratingArr = [];
  //       for (const player of this.pitchPlayers) {
  //         if (player.pitchRating !== undefined) {
  //           ratingArr.push(player.pitchRating);
  //         }
  //         for (let i = 0; i < this.pitchPositions.length; i++) {
  //           if (player.pitchPositionIndex !== undefined) {
  //             const { boxIndex } =
  //               this.pitchPositions[player.pitchPositionIndex];
  //             for (let j = 0; j < this.positionBoxes.length; j++) {
  //               if (this.positionBoxes[j] === this.positionBoxes[boxIndex]) {
  //                 this.positionBoxes[j].pitchPlayer = player;
  //               }
  //             }
  //           }
  //         }
  //       }

  //       this.calcStartersRating();

  //       this.squadTotalRating = 0;
  //       for (let i = 0; i < 12; i++) {
  //         ratingArr.push(this.players[i].rating);
  //       }

  //       this.squadTotalRating = calcSumRating(ratingArr);

  //       checkStars(this.startersTotalRating, this.squadTotalRating);

  //       const combinedPlayers = this.pitchPlayers.concat(this.players);

  //       combinedPlayers.forEach((player) => {
  //         const position = this.positions.find(
  //           (pos) => player.mainPositions[0] === pos.position
  //         );
  //         if (position) {
  //           position.amount++;
  //         }
  //       });

  //       if (this.pitchPlayers.length > 1) {
  //         this.sortedPitchPlayers = this.pitchPlayers.sort((a, b) => {
  //           if (
  //             a.pitchPositionIndex !== undefined &&
  //             b.pitchPositionIndex !== undefined
  //           ) {
  //             if (a.pitchPositionIndex < b.pitchPositionIndex) {
  //               return -1;
  //             }
  //             if (a.pitchPositionIndex > b.pitchPositionIndex) {
  //               return 1;
  //             }
  //           }
  //           return 0;
  //         });
  //       } else if (this.pitchPlayers.length > 0) {
  //         this.sortedPitchPlayers = this.pitchPlayers;
  //       }
  //       this.squadRules.map((rule) => {
  //         if (rule.check === '✅') {
  //           return { ...rule, check: '❌' };
  //         }
  //         return rule;
  //       });

  //       this.squadRules[8].text = '';

  //       if (this.pitchPlayers.length === 11) {
  //         this.getBackupPositions();
  //       } else {
  //         this.squadRules[7].check = '❌';
  //       }
  //     });
  //   }
  // }
}
