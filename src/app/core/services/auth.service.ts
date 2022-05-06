import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null | undefined>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null)
        }
      })
    );
  }

  async googleSignin() {
    const provider = new GoogleAuthProvider;
    const credential = await this.afAuth.signInWithPopup(provider);
    if (credential.user) {return this.updateUserData(credential.user)}
  }

  async login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    if (credential.user) {this.updateUserData(credential.user)};
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(
    {
      uid,
      email,
      displayName,
      savedRosters,
      submittedRosters,
    }: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${uid}`
    );

    const data = {
      uid,
      email,
      displayName,
      savedRosters,
      submittedRosters,
    };

    return userRef.set(data, { merge: true });
  }
}
