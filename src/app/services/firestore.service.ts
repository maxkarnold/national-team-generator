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
  

  constructor(public afs: AngularFirestore) {
    this.firstNames = new Observable;
    this.lastNames = new Observable;
  }

  

  getFirstName(nation: string, originNum: number){
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
          nameOrigin = ["French"];
        }
        break;
      case "brazil":
      case "cabo verde":
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
        nameOrigin = ["Italian", "Portuguese"];
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
      case "guatemala":
        nameOrigin = ["Spanish"];
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
      case "barbados":
      case "bermuda":
      case "solomon islands": // no polynesian names from the database
      case "st. kitts & nevis":
      case "antigua & barbuda":
      case "england":
        nameOrigin = ["English"];
        break;
      case "northern ireland":
      case "ireland":
      case "scotland":
        nameOrigin = ["Scottish", "English", "Irish"];
        break;
      case "curaçao":
        nameOrigin = ["English", "Spanish", "Dutch"];
        break;
      case "el salvador":
      case "united states":
      case "nicaragua":
        nameOrigin = ["English", "Spanish"];
        break;
      case "netherlands":
        nameOrigin = ["Dutch"];
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
      case "faroe islands":
        nameOrigin = ["Faroese", "Danish"];
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
      case "latvia":
        nameOrigin = ["Latvian"];
        break;
      case "russia":
        nameOrigin = ["Russian"];
        break;
      case "kyrgyz republic":
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
      case "azerbaijan":
        nameOrigin = ["Azerbaijani"];
        break;
      case "uzbekistan":
        nameOrigin = ["Uzbek"];
        break;
      case "kazakhstan":
        nameOrigin = ["Kazakh"];
        break;
      case "tajikistan":
        nameOrigin = ["Tajik"];
        break;
      case "turkmenistan":
        nameOrigin = ["Turkmen"];
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
      case "sudan":
        nameOrigin = ["Western African", "Arabic"];
        break;
      case "ghana":
      case "Côte d'Ivoire":
      case "guinea":
      case "togo":
      case "benin":
      case "gabon":
      case "congo DR":
      case "chad":
      case "central african republic":
        nameOrigin = ["Western African", "French"];
        break;
      case "niger":
        nameOrigin = ["Western African", "French", "Arabic"];
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
      case "tanzania":
        nameOrigin = ["Arabic", "English", "Eastern African"];
        break;
      case "zimbabwe":
      case "zambia":
      case "south africa":
      case "namibia":
      case "malawi":
        nameOrigin = ["Southern African", "English"];
        break;
      case "kenya":
        nameOrigin = ["Eastern African"];
        break;
      case "suriname":
        nameOrigin = ["Dutch", "English"];
        break;
      case "tunisia":
      case "algeria":
      case "morocco":
      case "libya":
      case "mauritania":
        nameOrigin = ["Northern African", "Arabic"];
        break;
      case "UAE":
      case "syria":
      case "lebanon":
      case "jordan":
      case "bahrain":
      case "qatar":
      case "saudi arabia":
      case "oman":
      case "kuwait":
      case "egypt":
        nameOrigin = ["Arabic"];
        break;
      case "israel":
      case "palestine":
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
      case "korea DPR":
        nameOrigin = ["Korean"];
        break;
      case "china PR":
      case "chinese taipei":
        nameOrigin = ["Chinese"];
        break;
      case "philippines":
        nameOrigin = ["Filipino", "English"];
        break;
      case "thailand":
        nameOrigin = ["Thai"];
        break;
      case "vietnam":
        nameOrigin = ["Vietnamese"];
        break;
      case "india":
        nameOrigin = ["Indian"];
        break;
      case "singapore":
        nameOrigin = ["Chinese", "Malay", "Indian"];
        break;
      default:
        nameOrigin = ["English"];
        break;
    }

    let chance = getRandomInt(0, nameOrigin.length - 1);
    let usage = [nameOrigin[chance]];
    let request$: Observable<any[]>, retryRequest$: Observable<any[]>;

    
    if (usage.includes("French") || usage.includes("Dutch") || usage.includes("Arabic") || usage.includes("Persian") || usage.includes("Kurdish")) { // chance for 1-4 given names
      let names = getRandomInt(1, 4);
      request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: names
      }
    } else if (usage.includes("Western African")) { // chance for 1-3 given names
      let names = getRandomInt(1, 3);
      request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: names
      }
    } else if (usage.includes("Russian") || usage.includes("Ukrainian") || usage.includes("Kazakh")) { // first name and patronym
      request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(2)).valueChanges();
      retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(2)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: 2
      }
    } else if (usage.includes("Belarusian") || usage.includes("Indian") || usage.includes("English") || usage.includes("Irish") || usage.includes("Scottish") || usage.includes("Welsh") || usage.includes("Vietnamese") || usage.includes("Western African") || usage.includes("German") || usage.includes("Polish") || usage.includes("Danish") || usage.includes("Norwegian") || usage.includes("Swedish") || usage.includes("Finnish") || usage.includes("Lithuanian") || usage.includes("Latvian") || usage.includes("Estonian") || usage.includes("Azerbaijani") || usage.includes("Turkish") || usage.includes("Eastern African") || usage.includes("Southern African") || usage.includes("Hebrew") || usage.includes("Turkmen") || usage.includes("Tajik") || usage.includes("Romanian") || usage.includes("Filipino") || usage.includes("Portuguese") || usage.includes("Spanish")) { // one or two given names (two is not common for Estonians, Turkish)
      let names = getRandomInt(1, 2);
      request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: names
      }
    } else { // only first name (Czech, Slovak, Polish, Bosnian, Serbian, Croatian, Montenegrin, Albanian, Slovene, Macedonian (male-ending), Chinese, Japanese, Korean, Icelandic, Faroese, Malay, Italian, Kyrgyz, Georgian, Armenian, Catalan, Galician, Bulgarian, Uzbek (if no patronym), Hungarian, Greek, Thai)
      request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: 1
      }
    }

    
    
  }

  getLastName(nation: string, originNum: number){

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
      case "cabo verde":
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
        nameOrigin = ["Italian", "Portuguese"];
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
      case "guatemala":
        nameOrigin = ["Spanish"];
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
      case "barbados":
      case "bermuda":
      case "solomon islands": // no polynesian names from the database
      case "st. kitts & nevis":
      case "antigua & barbuda":
      case "england":
        nameOrigin = ["English"];
        break;
      case "northern ireland":
      case "ireland":
      case "scotland":
        nameOrigin = ["Scottish", "English", "Irish"];
        break;
      case "curaçao":
        nameOrigin = ["Spanish", "Dutch"];
        break;
      case "el salvador":
      case "united states":
      case "nicaragua":
        nameOrigin = ["English", "Spanish"];
        break;
      case "netherlands":
        nameOrigin = ["Dutch"];
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
      case "faroe islands":
        nameOrigin = ["Faroese", "Danish"];
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
      case "latvia":
        nameOrigin = ["Latvian"];
        break;
      case "russia":
        nameOrigin = ["Russian"];
        break;
      case "kyrgyz republic":
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
      case "azerbaijan":
        nameOrigin = ["Azerbaijani"];
        break;
      case "uzbekistan":
      nameOrigin = ["Uzbek"];
        break;
      case "kazakhstan":
        nameOrigin = ["Kazakh"];
        break;
      case "tajikistan":
        nameOrigin = ["Tajik"];
        break;
      case "turkmenistan":
        nameOrigin = ["Turkmen"];
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
      case "sudan":
      case "niger":
        nameOrigin = ["Western African", "Arabic"];
        break;
      case "ghana":
      case "Côte d'Ivoire":
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
      case "tanzania":
        nameOrigin = ["Arabic", "English", "Eastern African"];
        break;
      case "malawi":
        nameOrigin = ["English"];
        break;
      case "zimbabwe":
      case "zambia":
      case "south africa":
      case "namibia":
        nameOrigin = ["Southern African", "English"];
        break;
      case "kenya":
        nameOrigin = ["Eastern African"];
        break;
       case "tanzania":
        nameOrigin = ["Eastern African", "Arabic"];
        break;
      case "suriname":
        nameOrigin = ["Dutch", "English"];
        break;
      case "tunisia":
      case "algeria":
      case "morocco":
      case "libya":
      case "mauritania":
        nameOrigin = ["Northern African", "Arabic"];
        break;
      case "UAE":
      case "syria":
      case "lebanon":
      case "jordan":
      case "bahrain":
      case "qatar":
      case "saudi arabia": 
      case "oman":
      case "kuwait":
      case "egypt":
        nameOrigin = ["Arabic"];
        break;
      case "israel":
      case "palestine":
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
      case "korea DPR":
        nameOrigin = ["Korean"];
        break;
      case "china PR":
      case "chinese taipei":
        nameOrigin = ["Chinese"];
        break;
      case "philippines":
        nameOrigin = ["Filipino", "English"];
        break;
      case "thailand":
        nameOrigin = ["Thai"];
        break;
      case "vietnam":
        nameOrigin = ["Vietnamese"];
        break;
      case "india":
        nameOrigin = ["Indian"];
        break;
      case "singapore":
        nameOrigin = ["Chinese", "Malay", "Indian"];
        break;
      default:
        nameOrigin = ["English"];
        break;
    }

    let chance = getRandomInt(0, nameOrigin.length - 1);
    let usage = [nameOrigin[chance]];
    let request$: Observable<any[]>, retryRequest$: Observable<any[]>;

    
    if (nation === "Argentina") { // 1-2 surname countries
      let names = getRandomInt(1, 2);
      request$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      retryRequest$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: names
      }
    } else if (usage.includes("Spanish") || usage.includes("Basque") || usage.includes("Galician") || usage.includes("Catalan") || usage.includes("Bulgarian") || usage.includes("Filipino")) { // 2 surname countries
      // need to fix bulgarian names to not include feminine surnames
      request$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(2)).valueChanges();
      retryRequest$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(2)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: 2
      }
    } else if (usage.includes("Portuguese")) { // 1-4 surname countries e.g. Portuguese
      let names = getRandomInt(1, 4);
      request$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
      retryRequest$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(names)).valueChanges();
        return {
          request$,
          retryRequest$,
          patronym: usage[0],
          names: names
        }
    } else if (usage.includes("Icelandic") || usage.includes("Faroese") || usage.includes("Malay") || usage.includes("Kyrgyz") || usage.includes("Azerbaijani" || usage.includes("Eastern African"))) { // nordic/scandinavian/malay/kyrgyz/azerbaijani/eastern african patronym
      request$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      retryRequest$ = this.afs.collection("firstNames_male", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', nameOrigin)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return {
        request$,
        retryRequest$,
        patronym: usage[0],
        names: 1
      }
    } else { // just one last name (most countries)
      request$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, ">=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      retryRequest$ = this.afs.collection("lastNames", ref => ref
        .where(`randomNum.${randomIndex}`, "<=", randomQuery)
        .where('usages', 'array-contains-any', usage)
        .orderBy(`randomNum.${randomIndex}`).limit(1)).valueChanges();
      return {
        request$, 
        retryRequest$,
        patronym: usage[0],
        names: 1
      }
    }

    
    
  }

  saveRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], nationOrTier: string): Promise<DocumentReference<DocumentData>>{
    return this.afs.collection("users").doc(uid).collection("savedRosters").add({
      benchReserves: benchReserves,
      starters: starters,
      nationOrTier: nationOrTier,
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
      this.afs.collection("submittedRosters").add({
        user: roster.user,
        roster: roster.roster,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating,
        formation: roster.formation
      })
      .then((docRef) => {
        console.log("New firestore id", docRef.id);
        return docRef.id
      });
    } else {
      this.afs.collection("submittedRosters").doc(roster.id).set({
        user: roster.user,
        roster: roster.roster,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating,
        formation: roster.formation
      });
    }
    console.log("Function is still working");
    
  }

  getSubmittedRosters(): Observable<DocumentChangeAction<SubmittedRoster>[]> {
    let rostersCollection = this.afs.collection("submittedRosters", ref => ref.orderBy('startersRating', 'desc').limit(50));
    return rostersCollection.snapshotChanges() as Observable<DocumentChangeAction<SubmittedRoster>[]>;
  }

  getRosterId(uid: string) {
    return this.afs.collection("users").doc(uid).collection("savedRosters").snapshotChanges();
  }

  getRoster(uid: string, rosterId: string) {
    return this.afs.collection("users").doc(uid).collection("savedRosters").doc(rosterId).snapshotChanges();
  }

}

function getRandomInt(min: number, max: number) {

    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
}

