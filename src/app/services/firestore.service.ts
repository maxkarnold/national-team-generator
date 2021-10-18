import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { FirstName } from '../models/first-name';
import { LastName } from '../models/last-name';
import { Observable } from 'rxjs';
import { Player } from '../models/player';
import { SubmittedRoster } from '../models/submittedRoster';

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

  

  getFirstName(nation: string){
    let randomIndex = getRandomInt(1, 5);
    let randomQuery = getRandomInt(0, 50000);
    let nameOrigin: string[];
    switch (nation) {
      case "france":
        let num = getRandomInt(1, 10);
        if (num > 7) {
          nameOrigin = ["Arabic"];
        } else if (num > 9) {
          nameOrigin = ["Western African", "Basque"];
        } else {
          nameOrigin = ["French", "Occitan", "Breton", "Corsican"];
        }
        break;
      case "brazil":
      case "cape verde":
      case "portugal":
        nameOrigin = ["Portuguese"];
        break;
      case "germany":
        nameOrigin = ["German", "Frisian", "Limburgish", "Turkish"];
        break;
      case "austria":
        nameOrigin = ["German"];
        break;
      case "switzerland":
        nameOrigin = ["German", "Italian", "Albanian"];
        break;
      case "poland":
        nameOrigin = ["Polish"];
        break;
      case "italy":
        nameOrigin = ["Italian", "Sardinian", "Occitan"];
        break;
      case "spain":
        nameOrigin = ["Spanish", "Occitan", "Basque", "Galician", "Catalan"];
        break;
      case "argentina":
      case "honduras":
      case "panama":
      case "equatorial guinea":
      case "costa rica":
      case "dominican republic":
      case "bolivia":
      case "venezuela":
      case "ecuador":
      case "peru":
      case "paraguay":
      case "chile":
      case "mexico":
      case "colombia":
      case "uruguay":
        nameOrigin = ["Spanish"];
        break;
      case "england":
        nameOrigin = ["English", "Cornish"];
        break;
      case "wales": 
        nameOrigin = ["English", "Welsh"];
        break;
      case "canada": 
      case "french guiana":
        nameOrigin = ["English", "French"];
        break;
      case "trinidad & tobago":
      case "jamaica":
      case "grenada":
      case "new zealand":
      case "australia":
      nameOrigin = ["English"];
        break;
      case "northern ireland":
      case "ireland":
      case "scotland":
        nameOrigin = ["Scottish", "English", "Irish"];
        break;
      case "curaçao":
      case "el salvador":
      case "united states":
        nameOrigin = ["English", "Spanish"];
        break;
      case "netherlands":
        nameOrigin = ["Dutch", "Frisian", "Limburgish"];
        break;
      case "belgium":
        nameOrigin = ["Dutch", "Limburgish", "Western African", "French"];
        break;
      case "luxembourg":
        nameOrigin = ["French", "German"];
        break;
      case "denmark":
        nameOrigin = ["Danish"];
        break;
      case "norway":
        nameOrigin = ["Norwegian"];
        break;
      case "sweden":
        nameOrigin = ["Swedish"];
        break;
      case "finland":
        nameOrigin = ["Finnish"];
        break;
      case "iceland":
        nameOrigin = ["Icelandic"];
        break;
      case "croatia":
        nameOrigin = ["Croatian"];
        break;
      case "montenegro":
      case "serbia":
        nameOrigin = ["Serbian"];
        break;
      case "kosovo":
      case "albania":
        nameOrigin = ["Albanian"];
        break;
      case "bosnia & herzegovina":
        nameOrigin = ["Bosnian"];
        break;
      case "czech republic":
        nameOrigin = ["Czech"];
        break;
      case "slovakia":
        nameOrigin = ["Slovak"];
        break;
      case "slovenia":
        nameOrigin = ["Slovene"];
        break;
      case "north macedonia":
        nameOrigin = ["Macedonian"];
        break;
      case "belarus":
        nameOrigin = ["Belarusian"];
        break;
      case "estonia":
        nameOrigin = ["Estonian"];
        break;
      case "lithuania":
        nameOrigin = ["Lithuanian"];
        break;
      case "russia":
        nameOrigin = ["Russian"];
        break;
      case "kyrgyzstan":
        nameOrigin = ["Russian", "Kyrgyz"];
        break;
      case "ukraine":
        nameOrigin = ["Ukrainian"];
        break;
      case "georgia":
      nameOrigin = ["Georgian"];
        break;
      case "armenia":
      nameOrigin = ["Armenian"];
        break;
      case "uzbekistan":
      nameOrigin = ["Uzbek"];
        break;
      case "turkey":
        nameOrigin = ["Turkish"];
        break;
      case "nigeria":
      case "burkina faso":
      case "gambia":  
      case "mali":
      case "senegal":
        nameOrigin = ["Western African"];
        break;
      case "ghana":
      case "ivory coast":
      case "guinea":
      case "togo":
      case "benin":
      case "gabon":
      case "congo DR":
      case "chad":
      case "central african republic":
        nameOrigin = ["Western African", "French"];
        break;
      case "sierra leone":
        nameOrigin = ["Western African", "English"];
        break;
      case "angola":
      case "guinea-Bissau":
      nameOrigin = ["Western African", "Portuguese"];
        break;
      case "congo":
        nameOrigin = ["Western African", "French", "English"];
        break;
      case "madagascar":
      case "martinique":
      case "haiti":
      case "cameroon":
        nameOrigin = ["French"];
        break;
      case "mozambique":
        nameOrigin = ["Portuguese"];
        break;
      case "uganda":
        nameOrigin = ["Arabic", "English"];
        break;
      case "zimbabwe":
      case "zambia":
      case "south africa":
        nameOrigin = ["Southern African"];
        break;
      case "suriname":
        nameOrigin = ["Dutch", "English"];
        break;
      case "tunisia":
      case "algeria":
      case "morocco":
        nameOrigin = ["Northern African", "Arabic"];
        break;
      case "UAE":
      case "syria":
      case "lebanon":
      case "jordan":
      case "bahrain":
      case "qatar":
      case "saudi arabia": 
      case "egypt": 
        nameOrigin = ["Arabic"];
        break;
      case "israel":
        nameOrigin = ["Hebrew", "Arabic"];
        break;
      case "iran":
        nameOrigin = ["Persian"];
        break;
      case "iraq":
        nameOrigin = ["Arabic", "Kurdish", "Persian"];
        break;
      case "hungary":
      nameOrigin = ["Hungarian"];
        break;
      case "bulgaria":
      nameOrigin = ["Bulgarian"];
        break;
      case "romania":
        nameOrigin = ["Romanian"];
        break;
      case "cyprus":
      case "greece":
        nameOrigin = ["Greek"];
        break;
      case "japan":
        nameOrigin = ["Japanese"];
        break;
      case "south korea":
        nameOrigin = ["Korean"];
        break;
      case "china PR":
        nameOrigin = ["Chinese"];
        break;
      case "philippines":
        nameOrigin = ["Filipino", "English"];
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

  getLastName(nation: string){
    let nameOrigin: string[];
    let randomIndex = getRandomInt(1, 5);
    let randomQuery = getRandomInt(0, 50000);
    
    switch (nation) {
      case "france":
        let num = getRandomInt(1, 10);
        if (num > 6) {
          nameOrigin = ["Arabic"];
        } else if (num > 8) {
          nameOrigin = ["Western African"];
        } else {
          nameOrigin = ["French"];
        }
        break;
      case "brazil":
      case "cape verde":
      case "portugal":
        nameOrigin = ["Portuguese"];
        break;
      case "germany":
        nameOrigin = ["German", "Turkish"];
        break;
      case "austria":
        nameOrigin = ["German"];
        break;
      case "switzerland":
        nameOrigin = ["German", "Italian", "Albanian"];
        break;
      case "poland":
        nameOrigin = ["Polish"];
        break;
      case "italy":
        nameOrigin = ["Italian", "Occitan"];
        break;
      case "spain":
        nameOrigin = ["Spanish", "Basque", "Galician", "Catalan"];
        break;
      case "argentina":
      case "honduras":
      case "panama":
      case "equatorial guinea":
      case "costa rica":
      case "dominican republic":
      case "bolivia":
      case "venezuela":
      case "ecuador":
      case "peru":
      case "paraguay":
      case "chile":
      case "mexico":
      case "colombia":
      case "uruguay":
        nameOrigin = ["Spanish"];
        break;
      case "england":
        nameOrigin = ["English"];
        break;
      case "wales": 
        nameOrigin = ["English", "Welsh"];
        break;
      case "canada": 
      case "french guiana":
        nameOrigin = ["English", "French"];
        break;
      case "trinidad & tobago":
      case "jamaica":
      case "grenada":
      case "new zealand":
      case "australia":
      nameOrigin = ["English"];
        break;
      case "northern ireland":
      case "ireland":
      case "scotland":
        nameOrigin = ["Scottish", "English", "Irish"];
        break;
      case "curaçao":
      case "el salvador":
      case "united states":
        nameOrigin = ["English", "Spanish"];
        break;
      case "netherlands":
        nameOrigin = ["Dutch", "Frisian"];
        break;
      case "belgium":
        nameOrigin = ["Dutch", "Western African", "French"];
        break;
      case "luxembourg":
        nameOrigin = ["French", "German"];
        break;
      case "denmark":
        nameOrigin = ["Danish"];
        break;
      case "norway":
        nameOrigin = ["Norwegian"];
        break;
      case "sweden":
        nameOrigin = ["Swedish"];
        break;
      case "finland":
        nameOrigin = ["Finnish"];
        break;
      case "iceland":
        nameOrigin = ["Icelandic"];
        break;
      case "croatia":
        nameOrigin = ["Croatian"];
        break;
      case "montenegro":
        nameOrigin = ["Montenegrin"];
        break;
      case "serbia":
        nameOrigin = ["Serbian"];
        break;
      case "kosovo":
      case "albania":
        nameOrigin = ["Albanian"];
        break;
      case "bosnia & herzegovina":
        nameOrigin = ["Bosnian"];
        break;
      case "czech republic":
        nameOrigin = ["Czech"];
        break;
      case "slovakia":
        nameOrigin = ["Slovak"];
        break;
      case "slovenia":
        nameOrigin = ["Slovene"];
        break;
      case "north macedonia":
        nameOrigin = ["Macedonian"];
        break;
      case "belarus":
        nameOrigin = ["Belarusian"];
        break;
      case "estonia":
        nameOrigin = ["Estonian"];
        break;
      case "lithuania":
        nameOrigin = ["Lithuanian"];
        break;
      case "russia":
        nameOrigin = ["Russian"];
        break;
      case "kyrgyzstan":
        nameOrigin = ["Russian", "Kyrgyz"];
        break;
      case "ukraine":
        nameOrigin = ["Ukrainian"];
        break;
      case "georgia":
      nameOrigin = ["Georgian"];
        break;
      case "armenia":
      nameOrigin = ["Armenian"];
        break;
      case "uzbekistan":
      nameOrigin = ["Uzbek"];
        break;
      case "turkey":
        nameOrigin = ["Turkish"];
        break;
      case "nigeria":
      case "burkina faso":
      case "gambia":  
      case "mali":
      case "senegal":
        nameOrigin = ["Western African"];
        break;
      case "ghana":
      case "ivory coast":
      case "guinea":
      case "togo":
      case "benin":
      case "gabon":
      case "congo DR":
      case "chad":
      case "central african republic":
        nameOrigin = ["Western African", "French"];
        break;
      case "sierra leone":
        nameOrigin = ["Western African", "English"];
        break;
      case "angola":
      case "guinea-Bissau":
      nameOrigin = ["Western African", "Portuguese"];
        break;
      case "congo":
        nameOrigin = ["Western African", "French", "English"];
        break;
      case "madagascar":
      case "martinique":
      case "haiti":
      case "cameroon":
        nameOrigin = ["French"];
        break;
      case "mozambique":
        nameOrigin = ["Portuguese"];
        break;
      case "uganda":
        nameOrigin = ["Arabic", "English"];
        break;
      case "zimbabwe":
      case "zambia":
      case "south africa":
        nameOrigin = ["Southern African"];
        break;
      case "suriname":
        nameOrigin = ["Dutch", "English"];
        break;
      case "tunisia":
      case "algeria":
      case "morocco":
        nameOrigin = ["Northern African", "Arabic"];
        break;
      case "UAE":
      case "syria":
      case "lebanon":
      case "jordan":
      case "bahrain":
      case "qatar":
      case "saudi arabia": 
      case "egypt": 
        nameOrigin = ["Arabic"];
        break;
      case "israel":
        nameOrigin = ["Jewish", "Arabic"];
        break;
      case "iran":
        nameOrigin = ["Iranian"];
        break;
      case "iraq":
        nameOrigin = ["Arabic", "Persian"];
        break;
      case "hungary":
      nameOrigin = ["Hungarian"];
        break;
      case "bulgaria":
      nameOrigin = ["Bulgarian"];
        break;
      case "romania":
        nameOrigin = ["Romanian"];
        break;
      case "cyprus":
      case "greece":
        nameOrigin = ["Greek"];
        break;
      case "japan":
        nameOrigin = ["Japanese"];
        break;
      case "south korea":
        nameOrigin = ["Korean"];
        break;
      case "china PR":
        nameOrigin = ["Chinese"];
        break;
      case "philippines":
        nameOrigin = ["Filipino", "English", "Spanish (Philippines)"];
        break;
      default:
        nameOrigin = ["English"];
        break;
    }
    let request$ = this.afs.collection("lastNames", ref => ref
      .where(`randomNum.${randomIndex}`, ">=", randomQuery)
      .where('usages', 'array-contains-any', nameOrigin)
      .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
    let retryRequest$ = this.afs.collection("lastNames", ref => ref
      .where(`randomNum.${randomIndex}`, "<=", randomQuery)
      .where('usages', 'array-contains-any', nameOrigin)
      .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
    return {
      request$, 
      retryRequest$
    }
    
  }

  saveRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], nation: string): Promise<DocumentReference<DocumentData>>{
    return this.afs.collection("users").doc(uid).collection("savedRosters").add({
      benchReserves: benchReserves,
      starters: starters,
      nationOrTier: nation,
      saveName: saveName
    })

  }

  updateRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], firestoreId: string) {
    let docRef = this.afs.collection("users").doc(uid).collection("savedRosters").doc(firestoreId);
    docRef.update({
      saveName: saveName,
      benchReserves: benchReserves,
      starters: starters
    })
    .then(() => {
      console.log("Document Updated");
    });
  }

  submitRoster(roster: SubmittedRoster) {
    if (roster.id === '') {
      this.afs.collection("submittedRosters").doc().set({
        user: roster.user,
        roster: roster.roster,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating
      });
    } else {
      this.afs.collection("submittedRosters").doc(roster.id).set({
        user: roster.user,
        roster: roster.roster,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating
      });
    }
    
    alert("Check leaderboards page to see your roster");
  }

  getSubmittedRosters(): Observable<DocumentChangeAction<SubmittedRoster>[]> {
    let rostersCollection = this.afs.collection("submittedRosters", ref => ref.orderBy('squadRating', 'desc'));
    return rostersCollection.snapshotChanges() as Observable<DocumentChangeAction<SubmittedRoster>[]>;
  }

  getRosterId(uid: string) {
    return this.afs.collection("users").doc(uid).collection("savedRosters").snapshotChanges();
  }

  getRoster(uid: string, rosterId: string) {
    return this.afs.collection("users").doc(uid).collection("savedRosters").doc(rosterId).snapshotChanges();
  }

}

function makeId(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
  }

