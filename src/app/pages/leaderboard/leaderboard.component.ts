import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/models/player.model';
import { SubmittedRoster } from 'src/app/models/roster.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  allRosters: SubmittedRoster[] = [];
  organizedRosters: SubmittedRoster[][] = [];

  sTierRosters: SubmittedRoster[] = [];
  aTierRosters: SubmittedRoster[] = [];
  bTierRosters: SubmittedRoster[] = [];
  cTierRosters: SubmittedRoster[] = [];
  dTierRosters: SubmittedRoster[] = [];
  eTierRosters: SubmittedRoster[] = [];
  fTierRosters: SubmittedRoster[] = [];
  gTierRosters: SubmittedRoster[] = [];
  hTierRosters: SubmittedRoster[] = [];
  iTierRosters: SubmittedRoster[] = [];
  jTierRosters: SubmittedRoster[] = [];

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

  constructor(private db: FirestoreService, private auth: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.auth.currentAuthState.subscribe(
      (authState) => (this.isLoggedIn = authState)
    );
    for (let i = 0; i < 100; i++) {
      let roster = localStorage.getItem(`Roster #${i}`) || null;
      if (roster === null) {
        break;
      }
      this.allRosters.push(JSON.parse(roster));
    }
    this.organizeLeaderboards();
    // console.log(this.allRosters, this.organizedRosters);
  }

  trackByItems(index: number, item: SubmittedRoster) {
    return item.id;
  }

  updateLeaderboards() {
    this.db.getSubmittedRosters().subscribe((snapshot) => {
      // this.allRosters = [];

      snapshot: for (const data of snapshot) {
        if (this.allRosters.length === 0) {
          this.allRosters.push({
            ...data.payload.doc.data(),
            id: data.payload.doc.id,
          });
          continue snapshot;
        }
        for (const roster of this.allRosters) {
          if (roster.id === data.payload.doc.id) {
            continue snapshot;
          }
        }
        // console.log(data.payload.doc.id);
        this.allRosters.push({
          ...data.payload.doc.data(),
          id: data.payload.doc.id,
        });
      }
      let user = localStorage.getItem('user');
      let players = [];
      let pitchPlayers = [];

      for (let i = 0; i < 60; i++) {
        let playerString = localStorage.getItem(`TEAMGEN - Player #${i}`);
        if (playerString !== null) {
          players.push(playerString);
        } else {
          break;
        }
      }
      for (let i = 0; i < 11; i++) {
        let playerString = localStorage.getItem(
          `TEAMGEN - Starting Player #${i + 1}`
        );
        if (playerString !== null) {
          pitchPlayers.push(playerString);
        }
      }
      localStorage.clear();
      if (user !== null) {
        localStorage.setItem('user', user);
      }
      for (let i = 0; i < players.length; i++) {
        localStorage.setItem(`TEAMGEN - Player #${i}`, players[i]);
      }
      for (let i = 0; i < pitchPlayers.length; i++) {
        localStorage.setItem(
          `TEAMGEN - Starting Player #${i + 1}`,
          pitchPlayers[i]
        );
      }
      for (let i = 0; i < this.allRosters.length; i++) {
        localStorage.setItem(
          `Roster #${i}`,
          JSON.stringify(this.allRosters[i])
        );
      }
      console.log(this.allRosters, this.organizedRosters);
      this.organizeLeaderboards();
    });
  }

  organizeLeaderboards() {
    this.organizedRosters = [];
    this.sTierRosters = [];
    this.aTierRosters = [];
    this.bTierRosters = [];
    this.cTierRosters = [];
    this.dTierRosters = [];
    this.eTierRosters = [];
    this.fTierRosters = [];
    this.gTierRosters = [];
    this.hTierRosters = [];
    this.iTierRosters = [];
    this.jTierRosters = [];
    for (const roster of this.allRosters) {
      switch (roster.tier) {
        case 's':
          this.sTierRosters.push(roster);
          // console.log(this.sTierRosters);
          break;
        case 'a':
          this.aTierRosters.push(roster);
          break;
        case 'b':
          this.bTierRosters.push(roster);
          break;
        case 'c':
          this.cTierRosters.push(roster);
          break;
        case 'd':
          this.dTierRosters.push(roster);
          break;
        case 'e':
          this.eTierRosters.push(roster);
          break;
        case 'f':
          this.fTierRosters.push(roster);
          break;
        case 'g':
          this.gTierRosters.push(roster);
          break;
        case 'h':
          this.hTierRosters.push(roster);
          break;
        case 'i':
          this.iTierRosters.push(roster);
          break;
        case 'j':
          this.jTierRosters.push(roster);
          break;
        default:
          throw new Error('No tier found on roster');
      }
    }
    this.organizedRosters = [
      this.sTierRosters,
      this.aTierRosters,
      this.bTierRosters,
      this.cTierRosters,
      this.dTierRosters,
      this.eTierRosters,
      this.fTierRosters,
      this.gTierRosters,
      this.hTierRosters,
      this.iTierRosters,
      this.jTierRosters,
    ];
  }
}
