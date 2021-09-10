import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/firestore';
import { FirstName } from '../models/first-name';
import { LastName } from '../models/last-name';
import { merge, Observable, pipe } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  firstName: Observable<FirstName[]>;
  lastName: Observable<LastName[]>;
  country = "any";
  

  constructor(public afs: AngularFirestore) {
    this.firstName = new Observable;
    this.lastName = new Observable;
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
  }



  // getFirstName(nationality: string): Observable<any[]> {
  //   let randomIndex = this.getRandomInt(1, 5);
  //   let randomQuery = this.getRandomInt(0, 50000);
  //   // let firstNameId = this.getRandomInt(0, 13893);
  //   // console.log("First Name ID", firstNameId);
  //   if (nationality == "any") {
  //     const request$ = this.afs.collection("firstNames_male", ref => ref.where(`randomNum.${randomIndex}`, ">=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).get();
  //     const retryRequest$ = this.afs.collection("firstNames_male", ref => ref.where(`randomNum.${randomIndex}`, "<=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).get();

  //     const docMap = pipe(
  //       map((docs: QuerySnapshot<any>) => {
  //         return docs.docs.map(e => {
  //           return {
  //             firestoreId: e.id,
  //             ...e.data()
  //           } as any;
  //         });
  //       })
  //     );
  //     const random$ = request$.pipe(docMap).pipe(filter(x => x !== undefined && x[0] !== undefined));
  //     const retry$ = request$.pipe(docMap).pipe(
  //       filter(x => x === undefined || x[0] === undefined),
  //       switchMap(() => retryRequest$),
  //       docMap
  //     );
  //     return merge(random$, retry$);
  //   }
  //   else {
  //     const request$ = this.afs.collection("firstNames_male", ref => ref.where(`randomNum.${randomIndex}`, ">=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).get();
  //     const retryRequest$ = this.afs.collection("firstNames_male", ref => ref.where(`randomNum.${randomIndex}`, "<=", randomQuery).orderBy(`randomNum.${randomIndex}`).limit(1)).get();

  //     const docMap = pipe(
  //       map((docs: QuerySnapshot<any>) => {
  //         return docs.docs.map(e => {
  //           return {
  //             firestoreId: e.id,
  //             ...e.data()
  //           } as any;
  //         });
  //       })
  //     );
  //     const random$ = request$.pipe(docMap).pipe(filter(x => x !== undefined && x[0] !== undefined));
  //     const retry$ = request$.pipe(docMap).pipe(
  //       filter(x => x === undefined || x[0] === undefined),
  //       switchMap(() => retryRequest$),
  //       docMap
  //     );
  //     return merge(random$, retry$);
  //   }
  //   // if (nationality == "any") {
  //   //   this.firstName = this.afs.collection('firstNames_male', ref => ref
  //   //     .where(`randomNum.${randomIndex}`, ">=", randomQuery)
  //   //     .orderBy(`randomNum.${randomIndex}`)
  //   //     .limit(1)
  //   //   )
  //   //   .snapshotChanges()
  //   //   .pipe(
  //   //     map(actions => actions.map(a => {
  //   //       if (a.payload.doc.exists) {
  //   //         const firestoreId = a.payload.doc.id;
  //   //         const data = a.payload.doc.data() as FirstName;
  //   //         console.log("firestore.service.ts", data);
  //   //         return {firestoreId, ...data}
  //   //       }     
  //   //     }))
  //   //   );
  //   // } else {
  //   //   this.firstName = this.afs.collection('firstNames', ref => ref
  //   //     .where(`randomNum.${randomIndex}`, ">=", randomQuery)
  //   //     .where("usages", "array-contains-any", nationality)
  //   //     .limit(1)
  //   //   )
  //   //   .snapshotChanges()
  //   //   .pipe(
  //   //     map(actions => actions.map(a => {
  //   //       const firestoreId = a.payload.doc.id;
  //   //       const data = a.payload.doc.data() as FirstName;
  //   //       console.log("Firestore Doc: ", firestoreId, data);
  //   //       return {firestoreId, ...data}
  //   //     }))
  //   //   );
  //   // }

    
   
  //   // return this.firstName;
  // }

  getLastnames() {
    let lastNameId = this.getRandomInt(0, 6755);
    this.lastName = this.afs.collection('last_names', ref => ref
      .where("id", "==", lastNameId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const firestoreId = a.payload.doc.id;
          const data = a.payload.doc.data() as LastName;
          // console.log("Last Name",  data.id);
          return {firestoreId, ...data}
        }))
      );
   
    return this.lastName;
  }

}

