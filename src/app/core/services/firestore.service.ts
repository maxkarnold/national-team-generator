import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { getRandomInt } from '@shared/utils';
import { Nation } from 'app/models/nation.model';
import { LastName, FirstName } from '../../models/names.model';
import { Player } from '../../models/player.model';
import { Roster } from '../../models/roster.model';
import * as nationsJson from '../../../assets/json/nations.json';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  firstNames: Observable<FirstName[]>;
  lastNames: Observable<LastName[]>;
  nations = nationsJson;
  nationsList: Nation[];

  constructor(public afs: AngularFirestore) {
    this.firstNames = new Observable();
    this.lastNames = new Observable();
    this.nationsList = [];
    this.nations
      .map((tier) => tier.nations)
      .forEach((nationsArr) =>
        nationsArr.forEach((nation) => this.nationsList.push(nation as Nation))
      );
  }

  getFirstName(nation: string, originNum: number) {
    const nameOrigin = this.nationsList.find((n) => n.name === nation)
      ?.firstNameUsages || ['English'];

    let usage: string;
    if (originNum > nameOrigin.length - 1) {
      [usage] = nameOrigin;
    } else {
      usage = nameOrigin[originNum];
    }

    switch (usage) {
      case 'French':
      case 'Dutch':
      case 'Arabic':
      case 'Persian':
      case 'Kurdish': {
        // chance for 1-4 given names
        return this.nameRequest(getRandomInt(1, 4), 'firstNames_male', usage);
      }
      case 'Western African': {
        // chance for 1-3 given names
        return this.nameRequest(getRandomInt(1, 3), 'firstNames_male', usage);
      }
      case 'Russian':
      case 'Ukrainian':
      case 'Kazakh': {
        // first name and patronym
        return this.nameRequest(2, 'firstNames_male', usage);
      }
      case 'Belarusian':
      case 'Indian':
      case 'English':
      case 'Irish':
      case 'Scottish':
      case 'Welsh':
      case 'Vietnamese':
      case 'German':
      case 'Polish':
      case 'Danish':
      case 'Norwegian':
      case 'Swedish':
      case 'Finnish':
      case 'Lithuanian':
      case 'Latvian':
      case 'Azerbaijani':
      case 'Eastern African':
      case 'Southern African':
      case 'Hebrew':
      case 'Turkmen':
      case 'Tajik':
      case 'Romanian':
      case 'Filipino':
      case 'Portuguese': {
        // one or two given names
        return this.nameRequest(getRandomInt(1, 2), 'firstNames_male', usage);
      }
      case 'Estonian':
      case 'Turkish':
      case 'Spanish':
      case 'Galician':
      case 'Basque':
      case 'Catalan': {
        // one or two given names where one is more common
        const chance = getRandomInt(1, 10);
        let names = 0;
        if (chance > 8) {
          names = 2;
        } else {
          names = 1;
        }
        return this.nameRequest(names, 'firstNames_male', usage);
      }

      default: {
        // only first name (Czech, Slovak, Polish, Bosnian, Serbian, Croatian, Montenegrin, Albanian, Slovene, Macedonian (male-ending), Chinese, Japanese, Korean, Icelandic, Faroese, Malay, Italian, Kyrgyz, Georgian, Armenian, Bulgarian, Uzbek (if no patronym), Hungarian, Greek, Thai)
        return this.nameRequest(1, 'firstNames_male', usage);
      }
    }
  }

  getLastName(nation: string, originNum: number) {
    const nameOrigin = this.nationsList.find((n) => n.name === nation)
      ?.lastNameUsages || ['English'];

    let usage: string;
    if (originNum > nameOrigin.length - 1) {
      [usage] = nameOrigin;
    } else {
      usage = nameOrigin[originNum];
    }

    if (nation === 'Argentina') {
      // 1-2 surname countries
      return this.nameRequest(getRandomInt(1, 2), 'lastNames', usage);
    }
    switch (usage) {
      case 'Spanish':
      case 'Basque':
      case 'Galician':
      case 'Catalan':
      case 'Bulgarian':
      case 'Filipino':
      case 'Spanish (Philippines)': {
        // 2 surname countries
        // need to fix bulgarian names to not include feminine surnames
        return this.nameRequest(2, 'lastNames', usage);
      }
      case 'Portuguese': {
        // 1-4 surname countries e.g. Portuguese
        let names = 1;
        const chance = getRandomInt(1, 10);

        if (chance < 3) {
          names = 1;
        } else if (chance > 8) {
          names = 4;
        } else {
          names = getRandomInt(2, 3);
        }
        return this.nameRequest(names, 'lastNames', usage);
      }
      case 'Icelandic':
      case 'Faroese':
      case 'Malay':
      case 'Kyrgyz':
      case 'Azerbaijani':
      case 'Eastern African': {
        // nordic/scandinavian/malay/kyrgyz/azerbaijani/eastern african patronym
        return this.nameRequest(1, 'firstNames_male', usage);
      }
      default:
        // just one last name (most countries)
        return this.nameRequest(1, 'lastNames', usage);
    }
  }

  nameRequest(
    names: number,
    collection: string,
    usage: string
  ): {
    request$: Observable<unknown[]>;
    retryRequest$: Observable<unknown[]>;
    patronym: string;
    names: number;
  } {
    const randomIndex = getRandomInt(1, 5);
    const randomQuery = getRandomInt(0, 50000);
    const request$ = this.afs
      .collection(collection, (ref) =>
        ref
          .where(`randomNum.${randomIndex}`, '>=', randomQuery)
          .where('usages', 'array-contains-any', [usage])
          .orderBy(`randomNum.${randomIndex}`)
          .limit(names)
      )
      .valueChanges();
    const retryRequest$ = this.afs
      .collection(collection, (ref) =>
        ref
          .where(`randomNum.${randomIndex}`, '<=', randomQuery)
          .where('usages', 'array-contains-any', [usage])
          .orderBy(`randomNum.${randomIndex}`)
          .limit(names)
      )
      .valueChanges();
    return {
      request$,
      retryRequest$,
      patronym: usage,
      names,
    };
  }

  saveRoster(
    uid: string,
    saveName: string,
    benchReserves: Player[],
    starters: Player[],
    nationOrTier: string
  ) {
    return this.afs
      .collection('users')
      .doc(uid)
      .collection('savedRosters')
      .add({
        benchReserves,
        starters,
        nationOrTier,
        saveName,
      });
  }

  updateRoster(
    uid: string,
    saveName: string,
    benchReserves: Player[],
    starters: Player[],
    firestoreId: string
  ) {
    const docRef = this.afs
      .collection('users')
      .doc(uid)
      .collection('savedRosters')
      .doc(firestoreId);
    docRef
      .update({
        saveName,
        benchReserves,
        starters,
      })
      .then(() => {
        console.log('Document Updated');
      });
  }

  submitRoster(roster: Roster) {
    if (roster.id === '') {
      this.afs
        .collection('submittedRosters')
        .add({
          user: roster.user,
          roster: roster.players,
          tier: roster.tier,
          nation: roster.nation,
          squadRating: roster.squadRating,
          startersRating: roster.startersRating,
          formation: roster.formation,
        })
        .then((docRef: DocumentReference<unknown>) => {
          console.log('New firestore id', docRef.id);
          return docRef.id;
        });
    } else {
      this.afs.collection('submittedRosters').doc(roster.id).set({
        user: roster.user,
        roster: roster.players,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating,
        formation: roster.formation,
      });
    }
    console.log('Function is still working');
  }

  getSubmittedRosters() {
    const rostersCollection = this.afs.collection('submittedRosters', (ref) =>
      ref.orderBy('startersRating', 'desc').limit(50)
    );
    return rostersCollection.snapshotChanges();
  }

  getRosterId(uid: string) {
    return this.afs
      .collection('users')
      .doc(uid)
      .collection('savedRosters')
      .snapshotChanges();
  }

  getRoster(uid: string, rosterId: string) {
    return this.afs
      .collection('users')
      .doc(uid)
      .collection('savedRosters')
      .doc(rosterId)
      .snapshotChanges();
  }
}
