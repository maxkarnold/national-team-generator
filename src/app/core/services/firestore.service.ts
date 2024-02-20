import { inject, Injectable } from '@angular/core';
import { getRandomInt } from '@shared/utils';
import { Nation } from 'app/models/nation.model';
import { Player } from '../../models/player.model';
import { Roster } from '../../models/roster.model';
import * as nationsJson from '../../../assets/json/nations.json';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  limit,
  orderBy,
  Query,
  query,
  setDoc,
  updateDoc,
  where,
  WhereFilterOp,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  db = inject(Firestore);
  nations = nationsJson;
  nationsList: Nation[];

  constructor() {
    this.nationsList = [];
    Object.values(this.nations).forEach(t => {
      if (t.nations) {
        this.nationsList.push(...(t.nations as Nation[]));
      }
    });
  }

  getFullName(nationality: string): (string | number | Query<DocumentData, DocumentData>)[] {
    const firstNameObj = this.getFirstNames(nationality);
    const lastNameObj = this.getLastNames(nationality, firstNameObj.ethnicity);
    return [...Object.values(firstNameObj), ...Object.values(lastNameObj)];
  }

  getFirstNames(nation: string): {
    nameQuery: Query<DocumentData, DocumentData>;
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

    const usages = (this.nationsList.find(n => n.name === nation)?.firstNameUsages.length || 0 < 1
      ? this.nationsList.find(n => n.name === nation)?.firstNameUsages
      : ['English']) || ['English'];
    // if (nameOrigin.length === 1 || !nameOrigin) {
    //   console.log(nation, nameOrigin);
    // } else {
    //   console.log(nation, nameOrigin);
    // }

    let ethnicity: string;
    if (usages.length === 1 || randomNum > usages.length - 1) {
      [ethnicity] = usages;
    } else if (randomNum <= usages.length - 1) {
      ethnicity = usages[randomNum];
    } else if (usages.includes('Northern African')) {
      ethnicity = usages[1];
    } else {
      console.log('error with getFirstNames', nation, usages, randomNum);
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
    nameQuery: Query<DocumentData, DocumentData>;
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
    nameCollection: string,
    ethnicity: string,
    operator: WhereFilterOp = '>='
  ): {
    nameQuery: Query<DocumentData, DocumentData>;
    ethnicity: string;
    totalNames: number;
  } {
    const randomIndex = getRandomInt(1, 5);
    // changed this to 5,000 from 0, 50,000 in order to fix, need to change back
    const randomQuery = getRandomInt(0, 50000);
    const nameQuery = this.newRequest(totalNames, nameCollection, ethnicity, randomIndex, randomQuery, operator);
    return { nameQuery, ethnicity, totalNames };
  }

  saveRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], nationOrTier: string) {
    const rosterRef = doc(this.db, 'users', uid, 'savedRosters');
    return setDoc(rosterRef, {
      benchReserves,
      starters,
      nationOrTier,
      saveName,
    });
  }

  updateRoster(uid: string, saveName: string, benchReserves: Player[], starters: Player[], firestoreId: string) {
    const rosterRef = doc(this.db, 'users', uid, 'savedRosters', firestoreId);
    updateDoc(rosterRef, {
      saveName,
      benchReserves,
      starters,
    }).then(() => {
      console.log('Document Updated');
    });
  }

  submitRoster(roster: Roster) {
    if (roster.id === '') {
      const rostersCollection = collection(this.db, 'submittedRosters');
      addDoc(rostersCollection, {
        user: roster.user,
        roster: roster.players,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating,
        formation: roster.formation,
      }).then(docRef => {
        console.log('New firestore id', docRef.id);
        return docRef.id;
      });
    } else {
      const rosterRef = doc(this.db, 'submittedRosters', roster.id);
      setDoc(rosterRef, {
        user: roster.user,
        roster: roster.players,
        tier: roster.tier,
        nation: roster.nation,
        squadRating: roster.squadRating,
        startersRating: roster.startersRating,
        formation: roster.formation,
      });
    }
  }

  // ============ THE BELOW FUNCTIONS NEED TO BE LISTENED TO USING THE onSnapshot() function

  newRequest(
    totalNames: number,
    collectionPath: string,
    ethnicity: string,
    randomIndex: number,
    randomQuery: number,
    operator: WhereFilterOp
  ): Query<DocumentData, DocumentData> {
    if (!totalNames || !collectionPath || !ethnicity || !randomIndex || !randomQuery || !operator) {
      console.log('error calling new request', totalNames, collectionPath, ethnicity, randomIndex, randomQuery, operator);
    }
    const collectionRef = collection(this.db, collectionPath);
    const nameQuery = query(
      collectionRef,
      where(`randomNum.${randomIndex}`, operator, randomQuery),
      where('usages', 'array-contains-any', [ethnicity]),
      orderBy(`randomNum.${randomIndex}`),
      limit(totalNames)
    );
    return nameQuery;
  }

  getSubmittedRosters(): Query<DocumentData, DocumentData> {
    const collectionRef = collection(this.db, 'submittedRosters');
    const top50Rosters = query(collectionRef, orderBy('startersRating', 'desc'), limit(50));
    return top50Rosters;
  }

  getRosterId(uid: string): CollectionReference<DocumentData, DocumentData> {
    return collection(this.db, 'users', uid, 'savedRosters');
  }

  getRoster(uid: string, rosterId: string): DocumentReference<DocumentData, DocumentData> {
    return doc(this.db, 'users', uid, 'savedRosters', rosterId);
  }
}
