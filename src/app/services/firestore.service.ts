import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FirstName } from '../models/first-name';
import { LastName } from '../models/last-name';
import { Observable } from 'rxjs';
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
    let randomIndex = this.getRandomInt(1, 5);
    let randomQuery = this.getRandomInt(0, 50000);
    if (nation === "any" || nation === "united states") {
      let request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      let retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return {
        request$,
        retryRequest$
      }
    }
    else {
      let nameOrigin: string[];
      switch (nation) {
        case "france":
          nameOrigin = ["French", "Medieval French", "Arabic", "Western African", "Occitan", "Breton", "Basque", "Corsican"];
          break;
        case "brazil":
          nameOrigin = ["Portuguese"];
          break;
        case "germany":
          nameOrigin = ["German", "Ancient Germanic", "Germanic Mythology", "Frisian", "Limburgish", "Turkish"];
          break;
        case "italy":
          nameOrigin = ["Italian", "Sardinian", "Occitan"];
          break;
        case "spain":
          nameOrigin = ["Spanish", "Medieval Spanish", "Occitan", "Basque", "Galician", "Catalan"];
          break;
        case "argentina":
          nameOrigin = ["Spanish"];
          break;
        case "england":
          nameOrigin = ["English", "Cornish", "Arabic"];
          break;
        default:
          nameOrigin = ["English"];
          break;
      }
      let request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      let retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return {
        request$, 
        retryRequest$
      }
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

