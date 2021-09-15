import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/firestore';
import { FirstName } from '../models/first-name';
import { LastName } from '../models/last-name';
import { merge, Observable, pipe } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  firstNames: Observable<FirstName[]>;
  lastNames: Observable<LastName[]>;
  

  constructor(public afs: AngularFirestore) {
    this.firstNames = new Observable;
    this.lastNames = new Observable;
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
  }

  getFirstName(nation: string){
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

  saveRoster(roster: Player[], starters: Player[]) {
    let docRef = this.afs.collection("savedRosters").doc();

    docRef.set({
      bench_reserves: roster,
      starters: starters
    })
      .then(() => {
        console.log("Document successfully written!");
        alert("Successfully Saved Roster");
      });

  }

  getRoster() {
    return this.afs.collection("savedRosters", ref => ref.limit(1)).valueChanges()
  }

}

