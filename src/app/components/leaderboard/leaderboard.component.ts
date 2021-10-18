import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubmittedRoster } from 'src/app/models/submittedRoster';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  rosters: SubmittedRoster[] = [];
  subscription: Subscription = new Subscription;
  isLoggedIn = false;

  constructor(private db: FirestoreService, private auth: AuthService) { }

  ngOnInit(): void {
    this.subscription = this.auth.currentAuthState.subscribe(authState => this.isLoggedIn = authState);
    for (let i = 0; i < 100; i++) {
      let roster = localStorage.getItem(`Roster #${i}`) || null;
      if (roster === null) {
        break;
      }
      this.rosters.push(JSON.parse(roster));
    }  
  }

  updateLeaderboards() {
    this.db.getSubmittedRosters().subscribe((snapshot) => {
      for (const data of snapshot) {
        this.rosters.push({
          ...data.payload.doc.data(),
          id: data.payload.doc.id
        });
      }
      console.log(this.rosters);
      for (let i = 0; i < this.rosters.length; i++) {
        localStorage.setItem(`Roster #${i}`, JSON.stringify(this.rosters[i]));
      }
    });
  }

}
