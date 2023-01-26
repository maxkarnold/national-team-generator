import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Roster } from 'app/models/roster.model';
import { AuthService } from '@core/services/auth.service';
import { FirestoreService } from '@core/services/firestore.service';
import { LeaderboardItem, LeaderboardService } from './leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  service: LeaderboardService;
  allRosters: Roster[] = [];
  organizedRosters: Roster[][] = [];

  sTierRosters: Roster[] = [];
  aTierRosters: Roster[] = [];
  bTierRosters: Roster[] = [];
  cTierRosters: Roster[] = [];
  dTierRosters: Roster[] = [];
  eTierRosters: Roster[] = [];
  fTierRosters: Roster[] = [];
  gTierRosters: Roster[] = [];
  hTierRosters: Roster[] = [];
  iTierRosters: Roster[] = [];
  jTierRosters: Roster[] = [];

  subscription: Subscription = new Subscription();
  isLoggedIn = false;
  headers = [
    '#',
    'User',
    'Squad Rating',
    'Starters Rating',
    'Nation',
    'Formation',
    'Best Player',
    'Name',
    'Rating',
    'Position',
    'Nationality',
  ];

  personalLeaderboards: LeaderboardItem[] | null = null;
  worldLeaderboards: LeaderboardItem[] | null = null;

  constructor(private db: FirestoreService, private auth: AuthService, leaderboard: LeaderboardService) {
    this.service = leaderboard;
  }

  ngOnInit(): void {
    // this.subscription = this.auth.currentAuthState.subscribe(
    //   (authState) => (this.isLoggedIn = authState)
    // );
    // for (let i = 0; i < 100; i++) {
    //   const roster = localStorage.getItem(`Roster #${i}`) || null;
    //   if (roster === null) {
    //     break;
    //   }
    //   this.allRosters.push(JSON.parse(roster));
    // }
    // this.organizeLeaderboards();
    const { worldLeaderboards, personalLeaderboards } = this.service.fetchTournamentLeaderboards();
    this.personalLeaderboards = personalLeaderboards;
    console.log(this.personalLeaderboards);
    this.worldLeaderboards = worldLeaderboards;
  }

  // trackByItems(index: number, item: Roster) {
  //   return item.id;
  // }

  // updateLeaderboards() {
  //   this.db.getSubmittedRosters().subscribe((snapshot) => {

  //     snapshot: for (const data of snapshot) {
  //       if (this.allRosters.length === 0) {
  //         this.allRosters.push({
  //           ...data.payload.doc.data(),
  //           id: data.payload.doc.id,
  //         });
  //         continue snapshot;
  //       }
  //       for (const roster of this.allRosters) {
  //         if (roster.id === data.payload.doc.id) {
  //           continue snapshot;
  //         }
  //       }
  //       // console.log(data.payload.doc.id);
  //       this.allRosters.push({
  //         ...data.payload.doc.data(),
  //         id: data.payload.doc.id,
  //       });
  //     }
  //     let user = localStorage.getItem('user');
  //     let players = [];
  //     let pitchPlayers = [];

  //     for (let i = 0; i < 60; i++) {
  //       let playerString = localStorage.getItem(`TEAMGEN - Player #${i}`);
  //       if (playerString !== null) {
  //         players.push(playerString);
  //       } else {
  //         break;
  //       }
  //     }
  //     for (let i = 0; i < 11; i++) {
  //       let playerString = localStorage.getItem(
  //         `TEAMGEN - Starting Player #${i + 1}`
  //       );
  //       if (playerString !== null) {
  //         pitchPlayers.push(playerString);
  //       }
  //     }
  //     localStorage.clear();
  //     if (user !== null) {
  //       localStorage.setItem('user', user);
  //     }
  //     for (let i = 0; i < players.length; i++) {
  //       localStorage.setItem(`TEAMGEN - Player #${i}`, players[i]);
  //     }
  //     for (let i = 0; i < pitchPlayers.length; i++) {
  //       localStorage.setItem(
  //         `TEAMGEN - Starting Player #${i + 1}`,
  //         pitchPlayers[i]
  //       );
  //     }
  //     for (let i = 0; i < this.allRosters.length; i++) {
  //       localStorage.setItem(
  //         `Roster #${i}`,
  //         JSON.stringify(this.allRosters[i])
  //       );
  //     }
  //     console.log(this.allRosters, this.organizedRosters);
  //     this.organizeLeaderboards();
  //   });
  // }

  // organizeLeaderboards() {
  //   this.organizedRosters = [];
  //   this.sTierRosters = [];
  //   this.aTierRosters = [];
  //   this.bTierRosters = [];
  //   this.cTierRosters = [];
  //   this.dTierRosters = [];
  //   this.eTierRosters = [];
  //   this.fTierRosters = [];
  //   this.gTierRosters = [];
  //   this.hTierRosters = [];
  //   this.iTierRosters = [];
  //   this.jTierRosters = [];

  //   this.allRosters.forEach((roster) => {
  //     switch (roster.tier) {
  //       case 's':
  //         this.sTierRosters.push(roster);
  //         break;
  //       case 'a':
  //         this.aTierRosters.push(roster);
  //         break;
  //       case 'b':
  //         this.bTierRosters.push(roster);
  //         break;
  //       case 'c':
  //         this.cTierRosters.push(roster);
  //         break;
  //       case 'd':
  //         this.dTierRosters.push(roster);
  //         break;
  //       case 'e':
  //         this.eTierRosters.push(roster);
  //         break;
  //       case 'f':
  //         this.fTierRosters.push(roster);
  //         break;
  //       case 'g':
  //         this.gTierRosters.push(roster);
  //         break;
  //       case 'h':
  //         this.hTierRosters.push(roster);
  //         break;
  //       case 'i':
  //         this.iTierRosters.push(roster);
  //         break;
  //       case 'j':
  //         this.jTierRosters.push(roster);
  //         break;
  //       default:
  //         throw new Error('No tier found on roster');
  //     }
  //   });
  //   this.organizedRosters = [
  //     this.sTierRosters,
  //     this.aTierRosters,
  //     this.bTierRosters,
  //     this.cTierRosters,
  //     this.dTierRosters,
  //     this.eTierRosters,
  //     this.fTierRosters,
  //     this.gTierRosters,
  //     this.hTierRosters,
  //     this.iTierRosters,
  //     this.jTierRosters,
  //   ];
  // }
}
