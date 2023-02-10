import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getRandomInt, shuffle, median } from '@shared/utils';
import { GkAttributes, OutfieldAttributes } from 'app/models/player-attributes.model';
import { Player } from 'app/models/player.model';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as nationsModule from 'assets/json/nations.json';
import { Nation } from 'app/models/nation.model';
import { Name, FirstName, LastName } from './firestore.model';
import { FirestoreService } from './firestore.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class CreatePlayerService {
  afsService;
  nations = nationsModule;
  nationsList: Nation[] = [];

  constructor(afsService: FirestoreService) {
    this.afsService = afsService;
    // this.nations.map(tier => tier.nations).forEach(nationsArr => nationsArr.forEach(nation => this.nationsList.push(nation as Nation)));
    // console.log(this.nations);
  }

  createPlayer(
    nationOrTier: string,
    count: [
      playerCount: number,
      first: number,
      second: number,
      third: number,
      fourth: number,
      fifth: number,
      sixth: number,
      seventh: number,
      eighth: number
    ]
  ) {
    // const { rating, clubRep } = this.getRatingAndClubRep(...count);
    // const mainPositions = this.getMainPositions(rating);
    // const foot = this.getFoot(mainPositions[0]);
    // const { altPos, compPos, unconvincingPos } = this.getAltPositions(
    //   mainPositions,
    //   foot
    // );
    // const age = this.getAge(rating, mainPositions[0]);
    // const { role, duty } = this.getPositionRole(
    //   mainPositions,
    //   altPos,
    //   foot,
    //   rating,
    //   age
    // );
    // const { nationality, logo } = this.getNationOrTier(
    //   nationOrTier,
    //   'nationality',
    //   rating
    // );
    // const { clubName, clubLogoUrl } = this.getClub(clubRep, nationality || '');
    // const { height, weight, weakFoot, attributes } = this.getAttributes(
    //   mainPositions[0],
    //   altPos,
    //   role,
    //   duty,
    //   rating,
    //   age
    // );
    // let firstInitial = '';
    // let firstNameUsage = '';
    // let firstNames: string[] = [];
    // let lastNameUsage = '';
    // let lastNames: string[] = [];
    // let singleLastName = '';
    // this.getNames(nationality)
    //   .pipe(untilDestroyed(this))
    //   .subscribe((obj) => {
    //     firstInitial = obj.firstInitial;
    //     firstNameUsage = obj.firstNameUsage;
    //     firstNames = obj.firstNames;
    //     lastNameUsage = obj.lastNameUsage;
    //     lastNames = obj.lastNames;
    //     [singleLastName] = obj.lastNames;
    //   });
    // return {
    //   rating,
    //   mainPositions,
    //   foot,
    //   weakFoot,
    //   height,
    //   weight,
    //   attributes,
    //   altPositions: altPos,
    //   competentPositions: compPos,
    //   unconvincingPositions: unconvincingPos,
    //   age,
    //   preferredRole: role,
    //   preferredDuty: duty,
    //   nationality: nationality || '',
    //   nationalityLogo: logo || '',
    //   club: clubName,
    //   clubLogo: clubLogoUrl,
    //   firstNames,
    //   firstNameUsage,
    //   firstInitial,
    //   lastNames,
    //   lastNameUsage,
    //   singleLastName,
    // };
  }

  getNames(nationality: string): Observable<{
    lastNames: string[];
    lastNameUsage: string;
    totalLastNames: number;
    firstNames: string[];
    firstInitial: string;
    firstNameUsage: string;
    totalFirstNames: number;
  }> {
    return this.afsService.getFullName(nationality).pipe(
      untilDestroyed(this),
      take(1),
      map(([fNames, firstNameUsage, totalFirstNames, lNames, lastNameUsage, totalLastNames]) => {
        const firstNames = fNames.map(fName => {
          return fName.name;
        });
        const lastNames = lNames.map(lName => {
          return lName.name;
        });
        return {
          ...this.getFirstNames(firstNames, firstNameUsage, totalFirstNames),
          ...this.getLastNames(lastNames, lastNameUsage, totalLastNames),
        };
      })
    );
    // add nickname based on nationality
    // About 90% chance: Mozambique
    // About 50% chance: Brazil, Spain, Portugal, Angola, Equatorial Guinea, Guinea-Bissau
  }

  getFirstNames(
    fNames: string[],
    firstNameUsage: string,
    totalFirstNames: number
  ): {
    firstNames: string[];
    firstInitial: string;
    firstNameUsage: string;
    totalFirstNames: number;
  } {
    let firstNames = fNames;
    if (fNames.length !== totalFirstNames) {
      console.log('error with first names', fNames, totalFirstNames, firstNameUsage);
    }

    if (totalFirstNames > 1 && fNames.length > 1) {
      const nameLength = fNames[1].length;
      const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
      const chance = getRandomInt(0, 2);

      switch (firstNameUsage) {
        case 'Russian':
        case 'Kazakh':
        case 'Tajik':
          if (chance > 0 && firstNameUsage === 'Kazakh') {
            firstNames = [...fNames, `${fNames[1]}uly`];
          } else if (vowels.includes(fNames[1].charAt(nameLength - 1))) {
            firstNames = [...fNames, `${fNames[1]}evich`];
          } else {
            firstNames = [...fNames, `${fNames[1]}ovich`];
          }
          break;
        case 'Ukrainian':
        case 'Belarusian':
          firstNames = [...fNames, `${fNames[1]}vych`];
          break;
        case 'Azerbaijani':
          firstNames = [...fNames, `${fNames[1]} oğlu`];
          break;
        case 'Turkmen':
          firstNames = [...fNames, `${fNames[1]}owiç`];
          break;
        default:
          firstNames = fNames;
          break;
      }
    }
    let firstInitial = '';
    if (firstNames.length > 0) {
      firstInitial = firstNames[0].charAt(0);
      if (firstInitial === "'") {
        firstInitial = firstNames[0].split("'")[1].charAt(0);
      }
      if (firstNames[0].includes(' ')) {
        // e.g. Abd al-Rahmin => A. a.
        firstInitial = `${firstNames[0]
          .split(' ')
          .map(full => full[0])
          .join('. ')}.`;
      }
    }

    return { firstNames, firstInitial, firstNameUsage, totalFirstNames };
  }

  getLastNames(
    lNames: string[],
    lastNameUsage: string,
    totalLastNames: number
  ): {
    lastNames: string[];
    lastNameUsage: string;
    totalLastNames: number;
  } {
    const lastNames: string[] = [];
    let articleUsed = false;
    let patronymArticle: string[];
    let chance: number;
    let nameLength: number;
    let vowels: string[];
    let first = lNames[0];
    if (lNames.length !== totalLastNames) {
      console.log('error with last names', lNames, totalLastNames, lastNameUsage);
    }
    switch (lastNameUsage) {
      case 'Portuguese':
        for (let i = 0; i < lNames.length; i++) {
          // for each surname
          if ((articleUsed && lastNames.length <= totalLastNames + 1) || (!articleUsed && lastNames.length <= totalLastNames)) {
            //
            chance = getRandomInt(1, 4);
            const surname = lNames[i];
            if (chance > 3 && !articleUsed && lNames[i].slice(0) !== 'D') {
              let articles = [];
              if (surname.slice(-1) === 's') {
                if (surname.slice(-2) !== 'as') {
                  articles = ['dos', 'de'];
                } else {
                  articles = ['das', 'de'];
                }
              } else if (surname.slice(-1) !== 'o') {
                articles = ['da', 'de'];
              } else {
                articles = ['do', 'de'];
              }

              chance = getRandomInt(0, 1);
              const chosenArticle = articles[chance];
              lastNames.push(chosenArticle);
              articleUsed = true;
            }
            lastNames.push(surname);
          }
        }
        break;
      case 'Icelandic':
      case 'Faroese':
        lastNames.push(`${lNames[0]}sson`);
        break;
      case 'Malay':
        lastNames.push('bin', ...lNames);
        break;
      case 'Kyrgyz':
        chance = getRandomInt(0, 1);
        patronymArticle = ['uulu', 'tegin'];
        lastNames.push(...lNames, patronymArticle[chance]);
        break;
      case 'Azerbaijani':
        nameLength = lNames[0].length;
        vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
        chance = getRandomInt(0, 2);
        if (chance > 1) {
          first += 'lı';
        } else if (chance > 0) {
          first += 'zade';
        } else if (vowels.includes(lNames[0].charAt(nameLength - 1))) {
          chance = getRandomInt(0, 1);
          patronymArticle = ['ev', 'yev'];
          first += patronymArticle[chance];
        } else {
          first += 'ov';
        }
        lastNames.push(first);
        break;
      default:
        lastNames.push(...lNames);
        break;
    }
    return { lastNames, lastNameUsage, totalLastNames };
  }

  // getNationOrTier(
  //   type: string,
  //   nationOrTier: string,
  //   rating?: number
  // ): { tier: string; nationality: string; logo: string } {
  //   if (type === 'tier') {
  //     const nationality: string = nationOrTier;
  //     let tier = '';
  //     if (nationality.includes('tier')) {
  //       tier = nationality.slice(0, 1);
  //     } else {
  //       let checking = true;
  //       while (checking) {
  //         for (let i = 0; i < this.nations.length; i++) {
  //           for (let j = 0; j < this.nations[i].nations.length; j++) {
  //             if (this.nations[i].nations[j].name === nationality) {
  //               tier = this.nations[i].tier.slice(0, 1);
  //               checking = false;
  //             }
  //           }
  //         }
  //       }
  //     }
  //     return {
  //       tier,
  //       nationality: '',
  //       logo: '',
  //     };
  //   }
  //   let nationality: string = nationOrTier;
  //   let logo = '';

  //   // If random nationalities
  //   if (nationality.includes('tier')) {
  //     // realistic nationalities turned on
  //     const realisticNationalities = true;
  //     if (realisticNationalities === true) {
  //       let tierName = '';
  //       if (rating !== undefined) {
  //         tierName = this.getRandomNationTier(rating);
  //       }

  //       const nationList = [];
  //       for (const tier of this.nations) {
  //         if (tier.tier === tierName) {
  //           for (const nation of tier.nations) {
  //             nationList.push(nation.name);
  //           }
  //           const i = getRandomInt(0, nationList.length - 1);
  //           nationality = nationList[i];
  //         }
  //       }
  //     } else {
  //       // realistic nationalities turned off
  //       const randomNum = getRandomInt(0, this.nationsList.length - 1);
  //       nationality = this.nationsList[randomNum].name;
  //     }
  //   }
  //   for (const tier of this.nations) {
  //     for (const nation of tier.nations) {
  //       if (nationality === nation.name) {
  //         logo = nation.logo;
  //       }
  //     }
  //   }
  //   return {
  //     tier: '',
  //     nationality,
  //     logo,
  //   };
  // }

  // getMainPositions(rating: number) {
  //   // should return an array of positions
  //   const chance = getRandomInt(1, 100);
  //   let mainPos: number;

  //   if (chance > 25) {
  //     // 75% chance for CB, DM, MC, MR, ML, AMR, AML, ST

  //     const arr = [3, 6, 7, 8, 9, 10, 11, 13];
  //     shuffle(arr);
  //     mainPos = arr[getRandomInt(0, 7)];
  //   } else {
  //     // 25% chance for GK, RB, LB, LWB, RWB, AMC
  //     const arr = [0, 1, 2, 4, 5, 12];
  //     shuffle(arr);
  //     mainPos = arr[getRandomInt(0, 5)];
  //   }

  //   // USE THIS COMMENT IF YOU NEED TO ADD POSITIONS

  //   // if (this.playerCount > 50 && (this.positions[0].amount < 3 || this.positions[3].amount < 3 || this.positions[13].amount < 2 || this.positions[7].amount < 3)) {
  //   //   if (this.positions[0].amount < 3) {
  //   //     mainPos = 0;
  //   //   } else if (this.positions[3].amount < 3) {
  //   //     mainPos = 3;
  //   //   } else if (this.positions[13].amount < 2) {
  //   //     mainPos = 13;
  //   //   } else {
  //   //     mainPos = 7;
  //   //   }
  //   // }
  //   // If there are 7 players in a certain position, choose a different position that doesn't have 7
  //   if (this.positions[mainPos].amount > 6) {
  //     // Prioritize 4 GKs
  //     if (this.positions[0].amount < 4) {
  //       mainPos = 0;
  //     }
  //     // Then prioritize 4 CBs
  //     else if (this.positions[3].amount < 4) {
  //       mainPos = 3;
  //     }
  //     // Then prioritize 2 STs
  //     else if (this.positions[13].amount < 2) {
  //       mainPos = 13;
  //     }
  //     // Then priortize 3 CMs
  //     else if (this.positions[7].amount < 3) {
  //       mainPos = 7;
  //     }
  //     // Otherwise add to any position
  //     else {
  //       for (let j = 0; j < this.positions.length; j++) {
  //         if (this.positions[mainPos].amount > 5) {
  //           mainPos = getRandomInt(0, 13);
  //         }
  //       }
  //     }
  //   }
  //   this.positions[mainPos].amount++;

  //   const mainPositions = [];
  //   mainPositions.push(this.positions[mainPos].position);

  //   if (!(mainPos === 0 || mainPos === 3 || mainPos === 13)) {
  //     // 20-35% chance of two natural positions
  //     // 2-7% chance of three natural positions
  //     let highChance = 0;
  //     let lowChance = 0;
  //     if (rating > 69) {
  //       highChance = getRandomInt(1, 100);
  //     } else {
  //       lowChance = getRandomInt(1, 100);
  //     }
  //     let indexes = 0;
  //     let posArr: number[] = [];
  //     if (highChance > 58 || lowChance > 78) {
  //       indexes = 1;
  //     } else if (highChance > 93 || lowChance > 98) {
  //       indexes = 2;
  //     }
  //     switch (mainPos) {
  //       case 1: // RB
  //         posArr = [2, 3, 5, 6, 7, 9];
  //         break;
  //       case 2: // LB
  //         posArr = [1, 3, 4, 6, 7, 8];
  //         break;
  //       case 4: // LWB
  //         posArr = [2, 5, 6, 7, 8, 11];
  //         break;
  //       case 5: // RWB
  //         posArr = [1, 4, 6, 7, 9, 10];
  //         break;
  //       case 6: // DM
  //         posArr = [1, 2, 3, 7, 12];
  //         break;
  //       case 7: // MC
  //         posArr = [1, 2, 6, 8, 9, 12];
  //         break;
  //       case 8: // ML
  //         posArr = [2, 4, 7, 9, 10, 11];
  //         break;
  //       case 9: // MR
  //         posArr = [1, 5, 7, 8, 10, 11];
  //         break;
  //       case 10: // AMR
  //         posArr = [8, 9, 11, 12, 13];
  //         break;
  //       case 11: // AML
  //         posArr = [8, 9, 10, 12, 13];
  //         break;
  //       case 12: // AMC
  //         posArr = [6, 7, 10, 11, 13];
  //         break;
  //       default:
  //         break;
  //     }
  //     shuffle(posArr);
  //     for (let i = 0; i < indexes; i++) {
  //       const index = posArr[i];
  //       mainPositions.push(this.positions[index].position);
  //     }
  //   }
  //   return mainPositions;
  // }

  // getAltPositions(mainPositions: string[], mainFoot: string) {
  //   const altPosCount = Math.min(getRandomInt(1, 3), getRandomInt(0, 3));
  //   const compPosCount = Math.min(getRandomInt(0, 2), getRandomInt(0, 2));
  //   const unPosCount = Math.min(
  //     getRandomInt(0, 2),
  //     getRandomInt(0, 2),
  //     getRandomInt(0, 2)
  //   );

  //   let altPos: string[] = [];
  //   const compPos: string[] = [];
  //   const unconvincingPos: string[] = [];

  //   let arr: string[];

  //   let num: number;
  //   let str: string[];

  //   if (altPosCount === 0) {
  //     altPos = ['N/A'];
  //   } else {
  //     switch (mainPositions[0]) {
  //       case 'GK':
  //         altPos = ['N/A'];
  //         break;
  //       case 'CB':
  //         arr = ['DM', 'RB', 'LB'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('MC');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('AMC', 'ST');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'LB':
  //         arr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         arr.push('RWB', 'AML');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         arr.push('MR', 'AMR', 'AMC');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'RB':
  //         arr = ['CB', 'MR', 'RWB', 'LB', 'DM', 'MC'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('AMR', 'LWB');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('ML', 'AML', 'AMC');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'LWB':
  //         arr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('RB', 'MR');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('CB', 'AMC', 'AMR');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'RWB':
  //         arr = ['RB', 'MR', 'LWB', 'AMR', 'MC', 'DM'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('LB', 'ML');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('CB', 'AMC', 'AML');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'MR':
  //         arr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('LWB', 'DM', 'AMC');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('LB', 'ST');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'ML':
  //         arr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);

  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('RWB', 'DM', 'AMC');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('RB', 'ST');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'AMR':
  //         arr = ['AML', 'AMC', 'ST'];

  //         if (mainFoot === 'right') {
  //           arr.push('MR', 'RWB');
  //         } else if (mainFoot === 'left') {
  //           arr.push('ML', 'LWB');
  //         } else {
  //           arr.push('MR', 'ML', 'RWB', 'LWB');
  //         }
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         if (mainFoot === 'right') {
  //           arr.push('ML', 'LWB', 'MC');
  //         } else if (mainFoot === 'left') {
  //           arr.push('MR', 'RWB', 'MC');
  //         } else {
  //           arr.push('MC');
  //         }
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('RB', 'LB', 'DM');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'AML':
  //         arr = ['AMR', 'AMC', 'ST'];

  //         if (mainFoot === 'right') {
  //           arr.push('MR', 'RWB');
  //         } else if (mainFoot === 'left') {
  //           arr.push('ML', 'LWB');
  //         } else {
  //           arr.push('MR', 'ML', 'RWB', 'LWB');
  //         }
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         if (mainFoot === 'right') {
  //           arr.push('ML', 'LWB', 'MC');
  //         } else if (mainFoot === 'left') {
  //           arr.push('MR', 'RWB', 'MC');
  //         } else {
  //           arr.push('MC');
  //         }
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('RB', 'LB', 'DM');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'DM':
  //         arr = ['CB', 'MC', 'AMC'];

  //         if (mainFoot === 'right') {
  //           arr.push('RB');
  //         } else if (mainFoot === 'left') {
  //           arr.push('LB');
  //         } else {
  //           arr.push('RB', 'LB');
  //         }
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         if (mainFoot === 'right') {
  //           arr.push('LB', 'LWB', 'RWB', 'MR', 'ML', 'ST');
  //         } else if (mainFoot === 'left') {
  //           arr.push('RB', 'LWB', 'RWB', 'MR', 'ML', 'ST');
  //         } else {
  //           arr.push('LWB', 'RWB', 'MR', 'ML', 'ST');
  //         }

  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('AMR', 'AML');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'MC':
  //         arr = ['DM', 'AMC'];

  //         if (mainFoot === 'right') {
  //           arr.push('MR');
  //         } else if (mainFoot === 'left') {
  //           arr.push('ML');
  //         } else {
  //           arr.push('MR', 'ML');
  //         }
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         if (mainFoot === 'right') {
  //           arr.push('ML', 'RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML');
  //         } else if (mainFoot === 'left') {
  //           arr.push('MR', 'RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML');
  //         } else {
  //           arr.push('RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML');
  //         }

  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'AMC':
  //         arr = ['DM', 'MC', 'AMR', 'AML', 'ST'];

  //         if (mainFoot === 'right') {
  //           arr.push('MR');
  //         } else if (mainFoot === 'left') {
  //           arr.push('ML');
  //         } else {
  //           arr.push('MR', 'ML');
  //         }
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);

  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }

  //         if (mainFoot === 'right') {
  //           arr.push('ML');
  //         } else if (mainFoot === 'left') {
  //           arr.push('MR');
  //         }

  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('LWB', 'RWB', 'RB', 'LB', 'CB');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       case 'ST':
  //         arr = ['AMC', 'AMR', 'AML', 'MC'];
  //         // alternate positions
  //         for (let i = 1; i < mainPositions.length; i++) {
  //           const altIndex = arr.indexOf(mainPositions[i]);
  //           if (altIndex > -1) {
  //             arr.splice(altIndex, 1);
  //           }
  //         }
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < altPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');

  //             altPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('DM', 'MR', 'ML');
  //         // competent positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < compPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             compPos.push(arr[num]);
  //             const index = arr.indexOf(arr[num]);
  //             if (index > -1) {
  //               arr.splice(index, 1);
  //             }
  //           }
  //         }
  //         arr.push('RWB', 'LWB', 'CB');
  //         // unconvincing positions
  //         num = getRandomInt(0, arr.length - 1);
  //         for (let i = 0; i < unPosCount; i++) {
  //           if (arr.length > 0) {
  //             if (num - i < 0) {
  //               num = arr.length - 1;
  //             } else {
  //               num -= i;
  //             }
  //             // str = arr[num - i].split(', ');
  //             unconvincingPos.push(arr[num]);
  //           }
  //         }
  //         break;
  //       default:
  //         console.log('Error in the function getAltPositions()');
  //         break;
  //     }
  //   }
  //   return {
  //     altPos,
  //     compPos,
  //     unconvincingPos,
  //   };
  // }

  // getPositionRole(
  //   mainPosArr: string[],
  //   altPosArr: string[],
  //   foot: string,
  //   rating: number,
  //   age: number
  // ) {
  //   let num1;
  //   let num2;
  //   let roles: string[];
  //   let duties: string[];
  //   let arr = [];
  //   const pos = mainPosArr[0];
  //   let chance: number;
  //   switch (pos) {
  //     case 'GK': // roles = ['GK', 'SK'];
  //       chance = getRandomInt(1, 4);
  //       // better gk is more likely to be sweeper keeper
  //       if (rating > 69) {
  //         num1 = chance > 1 ? 1 : 0;
  //       } else {
  //         num1 = chance > 1 ? 0 : 1;
  //       }
  //       num2 = getRandomInt(0, 2);
  //       roles = ['GK', 'SK'];
  //       duties = ['De', 'Su', 'At'];
  //       if (num1 === 0) {
  //         num2 = 0;
  //       }
  //       break;
  //     case 'RB':
  //     case 'LB': // roles = ['IWB', 'WB', 'FB', 'CWB', 'DFB'];
  //       roles = ['IWB', 'WB', 'FB', 'CWB', 'DFB'];

  //       if (rating > 64) {
  //         chance = getRandomInt(1, 4);
  //         if (
  //           (pos === 'RB' && foot === 'left') ||
  //           (pos === 'LB' && foot === 'right')
  //         ) {
  //           num1 = 0;
  //         } else if (mainPosArr.includes('CB')) {
  //           num1 = chance > 1 ? 2 : 1;
  //         } else {
  //           num1 = chance > 1 ? getRandomInt(1, 2) : 3;
  //         }
  //       } else {
  //         chance = getRandomInt(1, 4);
  //         // 75% chance of full back and 25% for no nonsense full back
  //         num1 = chance > 1 ? 2 : 4;
  //       }

  //       num2 = getRandomInt(0, 2);
  //       duties = ['De', 'Su', 'At'];
  //       if (num1 === 3) {
  //         duties = ['Su', 'At'];
  //         num2 = getRandomInt(0, 1);
  //       } else if (num1 === 4) {
  //         duties = ['De'];
  //         num2 = 0;
  //       }

  //       break;
  //     case 'RWB':
  //     case 'LWB': // roles = ['IWB', 'WB', 'CWB'];
  //       roles = ['IWB', 'WB', 'CWB'];
  //       if (rating > 64) {
  //         if (
  //           (pos === 'RWB' && foot === 'left') ||
  //           (pos === 'LWB' && foot === 'right')
  //         ) {
  //           num1 = 0;
  //         } else {
  //           chance = getRandomInt(1, 4);
  //           num1 = chance > 1 ? 1 : 2;
  //         }
  //       } else if (
  //         (pos === 'RWB' && foot === 'left') ||
  //         (pos === 'LWB' && foot === 'right')
  //       ) {
  //         num1 = 0;
  //       } else {
  //         num1 = 1;
  //       }

  //       num2 = getRandomInt(0, 2);
  //       duties = ['De', 'Su', 'At'];
  //       if (num1 === 2) {
  //         duties = ['Su', 'At'];
  //         num2 = getRandomInt(0, 1);
  //       }
  //       break;
  //     case 'CB': // roles = ['NCB', 'BPD', 'CD', 'WCB', 'L'];
  //       roles = ['NCB', 'BPD', 'CD', 'WCB'];
  //       chance = getRandomInt(1, 40);
  //       if (rating > 70) {
  //         if (chance > 38) {
  //           num1 = 0;
  //         } else if (chance > 34) {
  //           num1 = 1;
  //         } else {
  //           num1 = 2;
  //         }
  //       } else if (chance > 38) {
  //         num1 = 1;
  //       } else if (chance > 34) {
  //         num1 = 0;
  //       } else {
  //         num1 = 2;
  //       }

  //       num2 = getRandomInt(0, 2);
  //       duties = ['De', 'Co', 'St'];
  //       if (num1 > 2) {
  //         duties = ['De', 'Su', 'At'];
  //       }

  //       break;
  //     case 'DM': // roles = ['A', 'HB', 'DM', 'BWM', 'DLP', 'RGA', 'RPM', 'VOL'];
  //       // A and VOL is 10%
  //       // DM and DLP are 40%
  //       // BWM is 50%
  //       roles = ['VOL', 'A', 'DM', 'DLP', 'BWM'];
  //       chance = getRandomInt(1, 10);
  //       if (chance > 9) {
  //         num1 = getRandomInt(0, 1);
  //       } else if (chance > 5) {
  //         num1 = getRandomInt(2, 3);
  //       } else {
  //         num1 = 4;
  //       }

  //       num2 = getRandomInt(0, 1);
  //       duties = ['De', 'Su'];
  //       if (num1 === 1) {
  //         duties = ['De'];
  //         num2 = 0;
  //       } else if (num1 === 0) {
  //         duties = ['Su', 'At'];
  //         num2 = getRandomInt(0, 1);
  //       }
  //       break;
  //     case 'MC': // roles = ['DLP', 'BWM', 'RPM', 'CM', 'CAR', 'BBM', 'MEZ', 'AP'];
  //       roles = ['DLP', 'BWM', 'CM', 'CAR', 'BBM', 'MEZ', 'AP'];
  //       // DLP and AP are 500 each
  //       // BWM is 1000
  //       // CM is 2000
  //       // BBM 200
  //       // Mez is 850
  //       // CAR
  //       if (rating > 64) {
  //         chance = getRandomInt(1, 50);
  //         if (chance > 49) {
  //           num1 = 3;
  //         } else if (chance > 45) {
  //           num1 = 4;
  //         } else {
  //           arr = [getRandomInt(0, 2), getRandomInt(5, 6)];
  //           num1 = arr[getRandomInt(0, 1)];
  //         }

  //         if (num1 < 2) {
  //           duties = ['De', 'Su'];
  //           num2 = getRandomInt(0, 1);
  //         } else if (num1 > 4) {
  //           duties = ['Su', 'At'];
  //           num2 = getRandomInt(0, 1);
  //         } else if (num1 === 2) {
  //           duties = ['De', 'Su', 'At'];
  //           num2 = getRandomInt(0, 2);
  //         } else {
  //           num2 = 0;
  //           duties = ['Su'];
  //         }
  //       } else {
  //         roles = ['CM', 'BWM', 'DLP', 'AP', 'BBM'];
  //         //
  //         chance = getRandomInt(1, 50);
  //         if (chance > 49) {
  //           num1 = 4;
  //         } else if (chance > 35) {
  //           num1 = getRandomInt(1, 2);
  //         } else if (chance > 25) {
  //           num1 = 1;
  //         } else {
  //           num1 = 0;
  //         }

  //         if (num1 < 1) {
  //           duties = ['De', 'Su', 'At'];
  //           num2 = getRandomInt(0, 2);
  //         } else if (num1 < 3) {
  //           duties = ['De', 'Su'];
  //           num2 = getRandomInt(0, 1);
  //         } else if (num1 < 4) {
  //           duties = ['Su', 'At'];
  //           num2 = getRandomInt(0, 1);
  //         } else {
  //           duties = ['Su'];
  //           num2 = 0;
  //         }
  //       }
  //       break;
  //     case 'AMC': // roles = ['AP', 'AM', 'EG', 'T', 'SS'];
  //       num1 = getRandomInt(0, 4);
  //       num2 = getRandomInt(0, 1);
  //       roles = ['AP', 'AM', 'EG', 'SS'];
  //       if (age > 33) {
  //         num1 = 2;
  //       } else {
  //         chance = getRandomInt(1, 4);
  //         if (mainPosArr.includes('ST')) {
  //           num1 = 3;
  //         } else if (mainPosArr.includes('DM')) {
  //           num1 = getRandomInt(0, 1);
  //         } else {
  //           num1 = chance > 1 ? getRandomInt(0, 1) : 3;
  //         }
  //       }

  //       if (num1 === 3) {
  //         duties = ['At'];
  //         num2 = 0;
  //       } else if (num1 === 2) {
  //         duties = ['Su'];
  //         num2 = 0;
  //       } else {
  //         duties = ['Su', 'At'];
  //       }
  //       break;
  //     case 'MR':
  //     case 'ML': // roles = ['W', 'IW', 'WP', 'WM', 'DW'];
  //       roles = ['W', 'IW', 'WP', 'WM', 'DW'];
  //       duties = ['Su', 'At'];
  //       chance = getRandomInt(1, 10);
  //       if (rating > 64) {
  //         num1 = 0;
  //         if (
  //           (foot === 'right' && pos === 'ML') ||
  //           (foot === 'left' && pos === 'MR')
  //         ) {
  //           num1 = 1;
  //         }
  //       } else {
  //         num1 = chance > 1 ? 0 : 4;
  //         if (
  //           (foot === 'right' && pos === 'ML') ||
  //           (foot === 'left' && pos === 'MR')
  //         ) {
  //           num1 = 1;
  //         }
  //       }
  //       num2 = getRandomInt(0, 1);

  //       if (num1 > 3) {
  //         duties = ['De', 'Su'];
  //       } else if (num1 > 2) {
  //         duties = ['De', 'Su', 'At'];
  //         num2 = getRandomInt(0, 2);
  //       }
  //       break;
  //     case 'AMR':
  //     case 'AML': // roles = ['W', 'IW', 'AP', 'IF', 'WT', 'T', 'RMD'];
  //       roles = ['W', 'IW', 'AP', 'IF', 'WT', 'T', 'RMD'];
  //       duties = ['Su', 'At'];
  //       chance = getRandomInt(1, 20);

  //       if (
  //         (pos === 'AMR' && foot === 'left') ||
  //         (pos === 'AML' && foot === 'right')
  //       ) {
  //         num1 = chance > 1 ? 1 : 3;
  //       } else {
  //         num1 = chance > 1 ? 0 : 2;
  //       }
  //       num2 = getRandomInt(0, 1);
  //       if (num1 > 4) {
  //         duties = ['At'];
  //         num2 = 0;
  //       }
  //       break;
  //     case 'ST': // roles = ['AF', 'P', 'T', 'CF', 'TF', 'DLF', 'F9', 'PF'];
  //       roles = ['P', 'AF', 'TF', 'PF', 'DLF'];
  //       duties = ['Su', 'At'];
  //       chance = getRandomInt(1, 2);
  //       // 50% chance for Poacher / 50% for all other positions
  //       num1 = chance > 1 ? 0 : getRandomInt(1, 4);
  //       num2 = getRandomInt(0, 1);

  //       if (num1 < 2) {
  //         duties = ['At'];
  //         num2 = 0;
  //       } else if (num1 === 3) {
  //         duties = ['De', 'Su', 'At'];
  //         num2 = getRandomInt(0, 2);
  //       }

  //       break;
  //     default:
  //       roles = [];
  //       duties = [];
  //       num1 = 0;
  //       num2 = 0;
  //       break;
  //   }
  //   const role = roles[num1];
  //   const duty = duties[num2];
  //   return {
  //     role,
  //     duty,
  //   };
  // }

  // getFoot(mainPos: string) {
  //   const num = getRandomInt(1, 100);
  //   switch (mainPos) {
  //     case 'GK':
  //     case 'CB':
  //     case 'DM':
  //     case 'MC':
  //     case 'AMC':
  //     case 'ST':
  //       if (num < 76.5) {
  //         return 'right';
  //       }
  //       return 'left';

  //     case 'AML':
  //     case 'ML':
  //       if (num < 50) {
  //         return 'left';
  //       }
  //       return 'right';

  //     case 'LB':
  //     case 'LWB':
  //       if (num < 75) {
  //         return 'left';
  //       }
  //       return 'right';

  //     case 'AMR':
  //     case 'MR':
  //       if (num < 70) {
  //         return 'right';
  //       }
  //       return 'left';

  //     case 'RB':
  //     case 'RWB':
  //       if (num < 98) {
  //         return 'right';
  //       }
  //       return 'left';

  //     default:
  //       console.log('Error in the function getPlayerFoot()');
  //       return 'Error with getFoot(), check console';
  //   }
  // }

  // getRatingAndClubRep(
  //   i: number,
  //   first: number,
  //   second: number,
  //   third: number,
  //   fourth: number,
  //   fifth: number,
  //   sixth: number,
  //   seventh: number,
  //   eighth: number
  // ) {
  //   let rating = 0;
  //   let clubRep = '';
  //   const chance = getRandomInt(1, 20);
  //   if (i < first) {
  //     if (chance > 1) {
  //       rating = Math.min(getRandomInt(82, 89), getRandomInt(82, 89));
  //     } else {
  //       rating = Math.min(
  //         getRandomInt(88, 99),
  //         getRandomInt(88, 99),
  //         getRandomInt(88, 99)
  //       );
  //     }
  //     clubRep = 'top50';
  //   } else if (i < first + second) {
  //     rating = getRandomInt(76, 81);
  //     clubRep = 'top200';
  //   } else if (i < first + second + third) {
  //     rating = getRandomInt(70, 75);
  //     clubRep = 'regularInternational';
  //   } else if (i < first + second + third + fourth) {
  //     rating = getRandomInt(65, 69);
  //     clubRep = 'averagePlayer';
  //   } else if (i < first + second + third + fourth + fifth) {
  //     rating = getRandomInt(60, 65);
  //     clubRep = 'championshipPlayer';
  //   } else if (i < first + second + third + fourth + fifth + sixth) {
  //     rating = getRandomInt(55, 61);
  //     clubRep = 'leagueOnePlayer';
  //   } else if (i < first + second + third + fourth + fifth + sixth + seventh) {
  //     rating = getRandomInt(48, 54);
  //     clubRep = 'leagueTwoPlayer';
  //   } else if (
  //     i <
  //     first + second + third + fourth + fifth + sixth + seventh + eighth
  //   ) {
  //     rating = getRandomInt(30, 47);
  //     clubRep = 'fillerPlayer';
  //   }

  //   return {
  //     rating,
  //     clubRep,
  //   };
  // }

  // getAttributes(
  //   pos: string,
  //   altPos: string[],
  //   role: string,
  //   duty: string,
  //   rating: number,
  //   age: number
  // ): { height: number; weight: number; weakFoot: number; attributes: any } {
  //   let height = 0; // in inches
  //   let weight = 0; // in lbs
  //   const weakFoot = 0; // 1-4 very weak, 5-8 weak, 8-11 reasonable, 12-14 fairly strong, 15-17 strong, 18-20 very strong
  //   // very weak and weak is right/left only, reasonable and fairly strong is right/left, and strong and very strong is either footed
  //   const bmi = median([getRandomInt(19, 29), getRandomInt(19, 29)]);

  //   if (pos === 'GK') {
  //     height = median([getRandomInt(69, 78), getRandomInt(69, 78)]);
  //   } else {
  //     height = median([getRandomInt(62, 78), getRandomInt(62, 78)]);
  //   }

  //   weight = Math.round((bmi * height ** 2) / 703);

  //   // current ability / potential ability
  //   const currentAbility = rating * 2;
  //   let potentialAbility;
  //   const gkAttributes = {} as GkAttributes;
  //   const outAttributes = {} as OutfieldAttributes;
  //   let attributes = {};
  //   let attr25;
  //   let attr17;
  //   let attr09;
  //   let attr06;
  //   let attr04;
  //   let attr01;
  //   let attr0;
  //   let ability;
  //   switch (pos) {
  //     case 'GK':
  //       // 2.5, 1.65, 0.92, 0.6, 0.35, 0.125, 0
  //       attr25 = ['handling', 'reflexes'];
  //       attr17 = [
  //         'aerialReach',
  //         'commandOfArea',
  //         'communication',
  //         'kicking',
  //         'oneOnOnes',
  //         'bravery',
  //         'concentration',
  //         'decisions',
  //         'positioning',
  //         'agility',
  //       ];
  //       attr09 = ['throwing', 'acceleration', 'strength'];
  //       attr06 = ['weakFoot'];
  //       attr04 = [
  //         'anticipation',
  //         'composure',
  //         'leadership',
  //         'teamwork',
  //         'balance',
  //         'pace',
  //       ];
  //       attr01 = [
  //         'firstTouch',
  //         'vision',
  //         'workRate',
  //         'jumpingReach',
  //         'stamina',
  //         'technique',
  //       ];
  //       attr0 = [
  //         'eccentricity',
  //         'freeKickTaking',
  //         'penalty taking',
  //         'rushingOutTendency',
  //         'punchingTendency',
  //         'aggression',
  //         'determination',
  //         'flair',
  //         'offTheBall',
  //         'naturalFitness',
  //       ];
  //       for (let i = 0; i < attr0.length; i++) {
  //         gkAttributes[attr0[i]] = getRandomInt(1, 20);
  //       }
  //       ability = 0;
  //       while (ability < currentAbility) {
  //         // green attributes
  //         gkAttributes.reflexes = Math.max(
  //           getRandomInt(5, 20),
  //           getRandomInt(5, 20)
  //         );
  //         gkAttributes.kicking = Math.max(
  //           getRandomInt(5, 20),
  //           getRandomInt(5, 20)
  //         );
  //         gkAttributes.commandOfArea = Math.max(
  //           getRandomInt(5, 20),
  //           getRandomInt(5, 20)
  //         );
  //         gkAttributes.concentration = Math.max(
  //           getRandomInt(5, 20),
  //           getRandomInt(5, 20)
  //         );
  //         gkAttributes.positioning = Math.max(
  //           getRandomInt(5, 20),
  //           getRandomInt(5, 20)
  //         );
  //         gkAttributes.agility = Math.max(
  //           getRandomInt(5, 20),
  //           getRandomInt(5, 20)
  //         );
  //         // blue attributes
  //         gkAttributes.throwing = getRandomInt(5, 20);
  //         gkAttributes.decisions = getRandomInt(5, 20);
  //         // others
  //         gkAttributes.eccentricity = getRandomInt(1, 20);
  //         gkAttributes.punchingTendency = getRandomInt(1, 20);
  //         if (role === 'GK') {
  //           // green attributes
  //           gkAttributes.aerialReach = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           gkAttributes.communication = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           gkAttributes.handling = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           // blue attributes
  //           gkAttributes.oneOnOnes = getRandomInt(5, 20);
  //           gkAttributes.anticipation = getRandomInt(5, 20);
  //           // others
  //           gkAttributes.firstTouch = getRandomInt(1, 20);
  //           gkAttributes.passing = getRandomInt(1, 20);
  //           gkAttributes.rushingOutTendency = getRandomInt(1, 20);
  //           gkAttributes.composure = getRandomInt(1, 20);
  //           gkAttributes.vision = getRandomInt(1, 20);
  //           gkAttributes.acceleration = getRandomInt(1, 20);
  //         } else if (role === 'SK') {
  //           // green attributes
  //           gkAttributes.oneOnOnes = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           gkAttributes.rushingOutTendency = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           gkAttributes.anticipation = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           gkAttributes.composure = Math.max(
  //             getRandomInt(5, 20),
  //             getRandomInt(5, 20)
  //           );
  //           // blue attributes
  //           gkAttributes.aerialReach = getRandomInt(5, 20);
  //           gkAttributes.communication = getRandomInt(5, 20);
  //           gkAttributes.handling = getRandomInt(5, 20);
  //           gkAttributes.firstTouch = getRandomInt(5, 20);
  //           gkAttributes.passing = getRandomInt(5, 20);
  //           gkAttributes.vision = getRandomInt(5, 20);
  //           gkAttributes.acceleration = getRandomInt(5, 20);
  //           // others
  //         }
  //       }
  //       attributes = gkAttributes;

  //       break;
  //     case 'CB':
  //       break;
  //     case 'RB':
  //     case 'LB':
  //       break;
  //     case 'RWB':
  //     case 'LWB':
  //       break;
  //     case 'DM':
  //       break;
  //     case 'MR':
  //     case 'ML':
  //       break;
  //     case 'MC':
  //       break;
  //     case 'AMR':
  //     case 'AML':
  //       break;
  //     case 'AMC':
  //       break;
  //     case 'ST':
  //       break;
  //     default:
  //       attributes = outAttributes;
  //       break;
  //   }

  //   return {
  //     height,
  //     weight,
  //     weakFoot,
  //     attributes,
  //   };
  // }

  // getClub(clubRep: string, playerNation: string) {
  //   const clubArr = this.clubs[clubRep];

  //   const nationObj = this.nationsList.find(
  //     (nation) => nation.name === playerNation
  //   );
  //   let clubName = '';
  //   let clubLogoUrl = '';

  //   shuffle(clubArr);
  //   if (nationObj) {
  //     // 50% chance for mainLeague
  //     const main = getRandomInt(1, 2);

  //     if (main < 2) {
  //       for (let i = 0; i < clubArr.length; i++) {
  //         if (nationObj.mainLeagues.includes(clubArr[i].league)) {
  //           clubName = clubArr[i].club;
  //           clubLogoUrl = clubArr[i].logo;
  //           return {
  //             clubName,
  //             clubLogoUrl,
  //           };
  //         }
  //       }
  //     }
  //     // 30% chance for secondLeague
  //     const secondary = getRandomInt(1, 10);

  //     if (secondary < 4 && clubName === '') {
  //       for (let i = 0; i < clubArr.length; i++) {
  //         if (nationObj.secondLeagues.includes(clubArr[i].league)) {
  //           clubName = clubArr[i].club;
  //           clubLogoUrl = clubArr[i].logo;
  //           return {
  //             clubName,
  //             clubLogoUrl,
  //           };
  //         }
  //       }
  //     }
  //     // 15% chance for thirdLeague
  //     const tertiary = getRandomInt(1, 100);

  //     if (tertiary < 16 && clubName === '') {
  //       for (let i = 0; i < clubArr.length; i++) {
  //         if (nationObj.thirdLeagues.includes(clubArr[i].league)) {
  //           clubName = clubArr[i].club;
  //           clubLogoUrl = clubArr[i].logo;
  //           return {
  //             clubName,
  //             clubLogoUrl,
  //           };
  //         }
  //       }
  //     }

  //     // 5% chance for thirdLeague
  //     const rare = getRandomInt(1, 100);

  //     if (rare < 6 && clubName === '') {
  //       for (let i = 0; i < clubArr.length; i++) {
  //         if (nationObj.rareLeagues.includes(clubArr[i].league)) {
  //           clubName = clubArr[i].club;
  //           clubLogoUrl = clubArr[i].logo;
  //           return {
  //             clubName,
  //             clubLogoUrl,
  //           };
  //         }
  //       }
  //     }

  //     // if still no club, choose a random club
  //     for (let i = 0; i < clubArr.length; i++) {
  //       if (!nationObj.excludeLeagues.includes(clubArr[i].league)) {
  //         // check for excluded league
  //         clubName = clubArr[i].club;
  //         clubLogoUrl = clubArr[i].logo;
  //         return {
  //           clubName,
  //           clubLogoUrl,
  //         };
  //       }
  //     }

  //     return {
  //       clubName,
  //       clubLogoUrl,
  //     };
  //   }
  //   throw new Error('Club was not found');
  // }

  // getAge(rating: number, mainPos: string) {
  //   // Average ages are based on this website https://football-observatory.com/IMG/sites/mr/mr49/en/
  //   let ageIndex: number;
  //   if (rating > 84) {
  //     const arr = [
  //       getRandomInt(0, 1000),
  //       getRandomInt(0, 1000),
  //       getRandomInt(0, 1000),
  //     ];
  //     ageIndex = median(arr);
  //   } else if (rating > 76) {
  //     const sum = getRandomInt(0, 1000) + getRandomInt(0, 1000);
  //     ageIndex = sum / 2;
  //   } else {
  //     ageIndex = getRandomInt(0, 1000);
  //   }

  //   if (mainPos === 'GK') {
  //     if (ageIndex < 1) {
  //       return 17;
  //     }
  //     if (ageIndex < 2) {
  //       return 18;
  //     }
  //     if (ageIndex < 5) {
  //       return 19;
  //     }
  //     if (ageIndex < 10) {
  //       return 20;
  //     }
  //     if (ageIndex < 15) {
  //       return 21;
  //     }
  //     if (ageIndex < 25) {
  //       return 22;
  //     }
  //     if (ageIndex < 51) {
  //       return 23;
  //     }
  //     if (ageIndex < 91) {
  //       return 24;
  //     }
  //     if (ageIndex < 141) {
  //       return 25;
  //     }
  //     if (ageIndex < 191) {
  //       return 26;
  //     }
  //     if (ageIndex < 246) {
  //       return 27;
  //     }
  //     if (ageIndex < 301) {
  //       return 28;
  //     }
  //     if (ageIndex < 371) {
  //       return 29;
  //     }
  //     if (ageIndex < 441) {
  //       return 30;
  //     }
  //     if (ageIndex < 516) {
  //       return 31;
  //     }
  //     if (ageIndex < 591) {
  //       return 32;
  //     }
  //     if (ageIndex < 666) {
  //       return 33;
  //     }
  //     if (ageIndex < 741) {
  //       return 34;
  //     }
  //     if (ageIndex < 816) {
  //       return 35;
  //     }
  //     if (ageIndex < 881) {
  //       return 36;
  //     }
  //     if (ageIndex < 931) {
  //       return 37;
  //     }
  //     if (ageIndex < 966) {
  //       return 38;
  //     }
  //     if (995) {
  //       return 39;
  //     }
  //     return 40;
  //   }
  //   if (ageIndex < 1) {
  //     return 16;
  //   }
  //   if (ageIndex >= 1 && ageIndex <= 8) {
  //     return 17;
  //   }
  //   if (ageIndex >= 9 && ageIndex <= 30) {
  //     return 18;
  //   }
  //   if (ageIndex >= 31 && ageIndex <= 74) {
  //     return 19;
  //   }
  //   if (ageIndex >= 75 && ageIndex <= 133) {
  //     return 20;
  //   }
  //   if (ageIndex >= 134 && ageIndex <= 207) {
  //     return 21;
  //   }
  //   if (ageIndex >= 208 && ageIndex <= 286) {
  //     return 22;
  //   }
  //   if (ageIndex >= 287 && ageIndex <= 365) {
  //     return 23;
  //   }
  //   if (ageIndex >= 365 && ageIndex <= 447) {
  //     return 24;
  //   }
  //   if (ageIndex >= 448 && ageIndex <= 524) {
  //     return 25;
  //   }
  //   if (ageIndex >= 525 && ageIndex <= 599) {
  //     return 26;
  //   }
  //   if (ageIndex >= 600 && ageIndex <= 669) {
  //     return 27;
  //   }
  //   if (ageIndex >= 670 && ageIndex <= 735) {
  //     return 28;
  //   }
  //   if (ageIndex >= 736 && ageIndex <= 794) {
  //     return 29;
  //   }
  //   if (ageIndex >= 795 && ageIndex <= 843) {
  //     return 30;
  //   }
  //   if (ageIndex >= 844 && ageIndex <= 890) {
  //     return 31;
  //   }
  //   if (ageIndex >= 891 && ageIndex <= 925) {
  //     return 32;
  //   }
  //   if (ageIndex >= 926 && ageIndex <= 952) {
  //     return 33;
  //   }
  //   if (ageIndex >= 953 && ageIndex <= 970) {
  //     return 34;
  //   }
  //   if (ageIndex >= 971 && ageIndex <= 983) {
  //     return 35;
  //   }
  //   if (ageIndex >= 984 && ageIndex <= 991) {
  //     return 36;
  //   }
  //   if (ageIndex >= 992 && ageIndex <= 996) {
  //     return 37;
  //   }
  //   return 38;
  // }

  // getRandomNationTier(rating: number) {
  //   const randomNum = getRandomInt(1, 100);
  //   const half = getRandomInt(0, 1);
  //   const third = getRandomInt(0, 2);
  //   const quarter = Math.min(getRandomInt(0, 3), getRandomInt(0, 3));
  //   let tier = '';
  //   if (rating > 75) {
  //     if (randomNum > 50) {
  //       if (third < 2) {
  //         tier = 's';
  //       } else {
  //         tier = 'a';
  //       }
  //     } else if (randomNum > 22) {
  //       if (half > 0) {
  //         tier = 'b';
  //       } else {
  //         tier = 'c';
  //       }
  //     } else {
  //       switch (quarter) {
  //         case 0:
  //           tier = 'd';
  //           break;
  //         case 1:
  //           tier = 'e';
  //           break;
  //         case 2:
  //           tier = 'f';
  //           break;
  //         case 3:
  //           tier = 'g';
  //           break;
  //         default:
  //           tier = 'd';
  //           break;
  //       }
  //     }
  //   } else if (rating > 59) {
  //     if (randomNum > 50) {
  //       switch (quarter) {
  //         case 0:
  //           tier = 's';
  //           break;
  //         case 1:
  //           tier = 'a';
  //           break;
  //         case 2:
  //           tier = 'b';
  //           break;
  //         case 3:
  //           tier = 'c';
  //           break;
  //         default:
  //           tier = 's';
  //           break;
  //       }
  //     } else if (randomNum > 20) {
  //       switch (quarter) {
  //         case 0:
  //           tier = 'd';
  //           break;
  //         case 1:
  //           tier = 'e';
  //           break;
  //         case 2:
  //           tier = 'f';
  //           break;
  //         case 3:
  //           tier = 'g';
  //           break;
  //         default:
  //           tier = 'd';
  //           break;
  //       }
  //     } else {
  //       switch (quarter) {
  //         case 0:
  //           tier = 'h';
  //           break;
  //         case 1:
  //           tier = 'i';
  //           break;
  //         case 2:
  //           tier = 'j';
  //           break;
  //         case 3:
  //           tier = 'k';
  //           break;
  //         default:
  //           tier = 'h';
  //           break;
  //       }
  //     }
  //   } else {
  //     const arr = [
  //       's',
  //       'a',
  //       'b',
  //       'c',
  //       'd',
  //       'e',
  //       'f',
  //       'g',
  //       'h',
  //       'i',
  //       'j',
  //       'k',
  //       'l',
  //     ];
  //     const i = Math.min(
  //       getRandomInt(0, arr.length - 1),
  //       getRandomInt(0, arr.length - 1)
  //     );
  //     tier = arr[i];
  //   }
  //   tier += ' tier';
  //   return tier;
  // }
}
