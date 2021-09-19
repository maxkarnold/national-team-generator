import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FirstName } from '../models/first-name';
import { LastName } from '../models/last-name';
import { merge, Observable, pipe } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import { Player } from '../models/player';

export interface Roster {
  starters: Player[];
  benchReserves: Player[];
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  firstNames: Observable<FirstName[]>;
  lastNames: Observable<LastName[]>;
  // private rosterDoc: AngularFirestoreDocument<Roster>
  // roster: Observable<Roster>
  

  constructor(public afs: AngularFirestore) {
    this.firstNames = new Observable;
    this.lastNames = new Observable;
    // this.rosterDoc = afs.doc<Roster>()
    // this.roster = this.rosterDoc.valueChanges();
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
  }

  getFirstName(nation: string){
    nation = "any";
    let randomIndex = this.getRandomInt(1, 5);
    let randomQuery = this.getRandomInt(0, 50000);
    if (nation === "any") {
      let request$ = this.afs.collection("firstNames_male", ref => ref.where(`randomNum.${randomIndex}`, ">=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();

      let retryRequest$ = this.afs.collection("firstNames_male", ref => ref.where(`randomNum.${randomIndex}`, "<=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return request$
    }
    else {
      console.log("getFirstName() failed!");
    }
  }

  getLastName(nation: string){
    nation = "any";
    let randomIndex = this.getRandomInt(1, 5);
    let randomQuery = this.getRandomInt(0, 50000);
    if (nation === "any") {
      let request$ = this.afs.collection("lastNames", ref => ref.where(`randomNum.${randomIndex}`, ">=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();

      let retryRequest$ = this.afs.collection("lastNames", ref => ref.where(`randomNum.${randomIndex}`, "<=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return request$
    }
    else {
      console.log("getLastName() failed!");
    }
  }

  saveRoster(benchReserves: Player[], starters: Player[]) {
    let docRef = this.afs.collection("savedRosters").doc();

    docRef.set({
      benchReserves: benchReserves,
      starters: starters
    })
      .then(() => {
        console.log("Document successfully written!");
        alert("Successfully Saved Roster");
      });

  }

  getRosterId() {
    return this.afs.collection("savedRosters").snapshotChanges()
  }

  getRoster(firestoreId: string) {
    return this.afs.doc<Roster>(`savedRosters/${firestoreId}`).valueChanges();
  }

}

