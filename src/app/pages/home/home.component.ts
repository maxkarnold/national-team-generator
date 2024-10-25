import { Component, OnDestroy, OnInit } from '@angular/core';
import { Player } from 'app/football/models/player.model';
import { LastName, FirstName } from 'app/core/services/firestore.model';

import { SQUAD_RULES } from '@shared/constants/squad-rules.model';
import { POSITION_BOXES } from '@shared/constants/position-boxes';

import { Observable, Subscription } from 'rxjs';
import { Nation } from 'app/football/models/nation.model';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  playerCount = 0;
  // players: Player[];
  // sortedData: Player[];
  // pitchPlayers: Player[];
  // sortedPitchPlayers: Player[];
  // savedData: {
  //   id: string;
  //   saveName: string;
  // }[];

  lastName$!: Observable<LastName[]>;
  firstName$!: Observable<FirstName[]>;

  isLoggedIn = false;
  subscription: Subscription = new Subscription();

  saveDataOverlayOpen = false;
  loadDataOverlayOpen = false;
  instructionsOpen = false;
  nationOrTier = '';
  rosterId = '';

  realisticNationalities = true;
  startersTotalRating = 0;
  squadTotalRating = 0;
  formation = '';
  chemistry = 0;
  squadRules = SQUAD_RULES;
  positionBoxes = POSITION_BOXES;

  constructor(private afs: FirestoreService, private auth: AuthService) {
    // this.players = [];
    // this.pitchPlayers = [];
    // this.sortedData = this.pitchPlayers.concat(this.players);
    // this.sortedPitchPlayers = [];
    // this.savedData = [];
    // this.nationsList = [];
  }

  ngOnInit(): void {
    //   this.nations.forEach((tierObj) => {
    //     for (let i = 0; i < tierObj.nations.length; i++) {
    //       this.nationsList.push(tierObj.nations[i] as Nation);
    //     }
    //   });
    //   // this.subscription = this.auth.currentAuthState.subscribe(
    //   //   (authState) => (this.isLoggedIn = authState)
    //   // );
    //   if (
    //     this.isLoggedIn === true &&
    //     localStorage.getItem('TEAMGEN - Player #0')
    //   ) {
    //     this.loadPlayers('loadLocalStorage');
    //   }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submitRoster() {
    if (this.squadRules.find((rule) => rule.check === '❌')) {
      alert('Leaderboards are currently unavailable. Please try again later.');
      return false;
    }
    return true;
    // let submittedRoster: SubmittedRoster;
    // let user$ = this.auth.getUser();
    // let user = await user$.first().toPromise();
    // .subscribe((user) => {
    //   if (user && user.email !== null) {
    //     let nationName = '';
    //     let tierName = '';
    //     let id = this.rosterId;
    //     if (this.nationOrTier.includes(' tier')) {
    //       nationName = 'random';
    //       tierName = this.nationOrTier.slice(0, 1);
    //     } else {
    //       nationName = this.nationOrTier;
    //       tierName = this.getNation("tier").tier || '';
    //     }
    //     let sortedRoster = this.pitchPlayers.concat(this.players);
    //     sortedRoster = sortedRoster.sort((a, b) => {
    //       let isAsc = false;
    //       return compare(a.rating, b.rating, isAsc);
    //     });
    //     submittedRoster = {
    //       user: user.email,
    //       id: id,
    //       tier: tierName,
    //       nation: nationName,
    //       startersRating: this.startersTotalRating,
    //       squadRating: this.squadTotalRating,
    //       formation: this.formation,
    //       roster: {
    //         sortedRoster: sortedRoster
    //       }
    //     }
    //     this.afs.getSubmittedRosters().subscribe((data) => {
    //       for (const roster of data) {
    //         if (roster.payload.doc.id === this.rosterId) {
    //           alert("Already submitted roster");
    //           return false
    //         }
    //       }
    //
    //       alert("Check leaderboards page to see your roster");
    //     });
    //   } else {
    //     throw new Error("User not signed in - login error");
    //   }
    // });
  }

  infoOverlay() {
    if (!this.instructionsOpen) {
      this.instructionsOpen = true;
    } else {
      this.instructionsOpen = false;
    }
  }
}
