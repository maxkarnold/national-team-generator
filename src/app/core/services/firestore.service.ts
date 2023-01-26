import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { WhereFilterOp } from '@firebase/firestore-types/';
import { getRandomInt } from '@shared/utils';
import { Nation } from 'app/models/nation.model';
import { catchError, map, take } from 'rxjs/operators';
import { Player } from '../../models/player.model';
import { Roster } from '../../models/roster.model';
import * as nationsJson from '../../../assets/json/nations.json';
import { Name } from './firestore.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  nations = nationsJson;
  nationsList: Nation[];

  constructor(public afs: AngularFirestore) {
    this.nationsList = [];
    Object.values(this.nations).forEach(t => {
      if (t.nations) {
        this.nationsList.push(...(t.nations as Nation[]));
      }
    });
  }

  getFullName(nationality: string): Observable<[Name[], string, number, Name[], string, number]> {
    const firstNameObj = this.getFirstNames(nationality);
    const lastNameObj = this.getLastNames(nationality, firstNameObj.ethnicity);

    return forkJoin([
      firstNameObj.request$,
      of(firstNameObj.ethnicity),
      of(firstNameObj.totalNames),
      lastNameObj.request$,
      of(lastNameObj.ethnicity),
      of(lastNameObj.totalNames),
    ]);
  }

  getFirstNames(nation: string): {
    request$: Observable<Name[]>;
    ethnicity: string;
    totalNames: number;
  } {
    let randomNum = getRandomInt(1, 100);
    if (randomNum > 25) {
      randomNum = 0;
    } else if (randomNum > 10) {
      randomNum = 1;
    } else if (randomNum > 5) {
      randomNum = 2;
    } else if (randomNum > 2) {
      randomNum = 3;
    } else if (randomNum > 0) {
      randomNum = 4;
    }

    const nameOrigin = (this.nationsList.find(n => n.name === nation)?.firstNameUsages.length || 0 < 1
      ? this.nationsList.find(n => n.name === nation)?.firstNameUsages
      : ['English']) || ['English'];
    if (nameOrigin.length === 1 || !nameOrigin) {
      console.log(nation, nameOrigin);
    } else {
      console.log(nation, nameOrigin);
    }

    let ethnicity: string;
    if (randomNum > nameOrigin.length - 1) {
      [ethnicity] = nameOrigin;
    } else if (randomNum < nameOrigin.length - 1) {
      ethnicity = nameOrigin[randomNum];
    } else {
      ethnicity = 'English';
    }

    switch (ethnicity) {
      case 'French':
      case 'Dutch':
      case 'Arabic':
      case 'Persian':
      case 'Kurdish': {
        // chance for 1-4 given names
        return this.nameRequest(getRandomInt(1, 4), 'firstNames_male', ethnicity);
      }
      case 'Western African': {
        // chance for 1-3 given names
        return this.nameRequest(getRandomInt(1, 3), 'firstNames_male', ethnicity);
      }
      case 'Russian':
      case 'Ukrainian':
      case 'Kazakh': {
        // first name and patronym
        return this.nameRequest(2, 'firstNames_male', ethnicity);
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
        return this.nameRequest(getRandomInt(1, 2), 'firstNames_male', ethnicity);
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
        return this.nameRequest(names, 'firstNames_male', ethnicity);
      }

      default: {
        // only first name (Czech, Slovak, Polish, Bosnian, Serbian, Croatian, Montenegrin, Albanian, Slovene, Macedonian (male-ending),
        // Chinese, Japanese, Korean, Icelandic, Faroese, Malay, Italian, Kyrgyz, Georgian, Armenian, Bulgarian, Uzbek (if no patronym), Hungarian, Greek, Thai)
        return this.nameRequest(1, 'firstNames_male', ethnicity);
      }
    }
  }

  getLastNames(
    nation: string,
    ethnicity: string
  ): {
    request$: Observable<Name[]>;
    ethnicity: string;
    totalNames: number;
  } {
    const nameOrigin = this.nationsList.find(n => n.name === nation)?.lastNameUsages || ['English'];

    let origin = ethnicity;

    if (nation === 'Argentina') {
      // 1-2 surname countries
      return this.nameRequest(getRandomInt(1, 2), 'lastNames', origin);
    }

    if (!nameOrigin.includes(origin)) {
      let randomNum = getRandomInt(1, 100);
      if (randomNum > 25) {
        randomNum = 0;
      } else if (randomNum > 10) {
        randomNum = 1;
      } else if (randomNum > 5) {
        randomNum = 2;
      } else if (randomNum > 2) {
        randomNum = 3;
      } else if (randomNum > 0) {
        randomNum = 4;
      }

      if (randomNum > nameOrigin.length - 1) {
        [origin] = nameOrigin;
      } else {
        origin = nameOrigin[randomNum];
      }
    }

    switch (origin) {
      case 'Spanish':
      case 'Basque':
      case 'Galician':
      case 'Catalan':
      case 'Bulgarian':
      case 'Filipino':
      case 'Spanish (Philippines)': {
        // 2 surname countries
        // need to fix bulgarian names to not include feminine surnames
        return this.nameRequest(2, 'lastNames', origin);
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
        return this.nameRequest(names, 'lastNames', origin);
      }
      case 'Icelandic':
      case 'Faroese':
      case 'Malay':
      case 'Kyrgyz':
      case 'Azerbaijani':
      case 'Eastern African': {
        // nordic/scandinavian/malay/kyrgyz/azerbaijani/eastern african patronym
        return this.nameRequest(1, 'firstNames_male', origin);
      }
      default:
        // just one last name (most countries)
        // need more surnames for pacific islanders
        return this.nameRequest(1, 'lastNames', origin);
    }
  }

  nameRequest(
    totalNames: number,
    collection: string,
    ethnicity: string
  ): {
    request$: Observable<Name[]>;
    ethnicity: string;
    totalNames: number;
  } {
    const randomIndex = getRandomInt(1, 5);
    const randomQuery = getRandomInt(0, 50000);

    const request$ = this.newRequest(totalNames, collection, ethnicity, randomIndex, randomQuery, '>=').pipe(
      catchError(err => {
        console.log(err);
        return this.newRequest(totalNames, collection, ethnicity, randomIndex, randomQuery, '<=');
      })
    );
    return { request$, ethnicity, totalNames };
  }

  newRequest(totalNames: number, collection: string, ethnicity: string, randomIndex: number, randomQuery: number, operator: WhereFilterOp) {
    if (!totalNames || !collection || !ethnicity || !randomIndex || !randomQuery || !operator) {
      console.log('error calling new request', totalNames, collection, ethnicity, randomIndex, randomQuery, operator);
    }
    return this.afs
      .collection<Name>(collection, ref =>
        ref
          .where(`randomNum.${randomIndex}`, operator, randomQuery)
          .where('usages', 'array-contains-any', [ethnicity])
          .orderBy(`randomNum.${randomIndex}`)
          .limit(totalNames)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            // console.log(a.payload.doc.metadata.fromCache);
            return {
              ...(a.payload.doc.data() as Name),
            };
          })
        ),
        take(1)
      );
  }

  saveRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], nationOrTier: string) {
    return this.afs.collection('users').doc(uid).collection('savedRosters').add({
      benchReserves,
      starters,
      nationOrTier,
      saveName,
    });
  }

  updateRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], firestoreId: string) {
    const docRef = this.afs.collection('users').doc(uid).collection('savedRosters').doc(firestoreId);
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
    const rostersCollection = this.afs.collection('submittedRosters', ref => ref.orderBy('startersRating', 'desc').limit(50));
    return rostersCollection.snapshotChanges();
  }

  getRosterId(uid: string) {
    return this.afs.collection('users').doc(uid).collection('savedRosters').snapshotChanges();
  }

  getRoster(uid: string, rosterId: string) {
    return this.afs.collection('users').doc(uid).collection('savedRosters').doc(rosterId).snapshotChanges();
  }
}
