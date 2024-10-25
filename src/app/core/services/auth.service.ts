import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { User } from './firestore.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null> = EMPTY;
  auth = inject(Auth);
  firestore = inject(Firestore);

  constructor(private router: Router) {
    if (this.auth) {
      this.user$ = authState(this.auth);
    }
  }

  googleSignin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(credential => {
        if (credential.user) {
          this.updateUserData(credential.user);
          // this.snackbar.open('Successfully logged in!', 'Dismiss');
          this.router.navigate(['/simulation']);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        // this.snackbar.open('Successfully logged in!', 'Dismiss');
        // this.router.navigate(['/simulation']);
      })
      .catch(() => {
        // this.snackbar.open(`ERROR ${(err.code, err.message, err.name)}`);
      });
  }

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password).then(userCredential => {
      if (userCredential.user) {
        this.updateUserData(userCredential.user);
      }
    });
  }

  signOut() {
    signOut(this.auth).then(() => {
      // this.snackbar.open('Successfully logged out!', 'Dismiss');
      this.router.navigate(['/']);
    });
  }

  private updateUserData({ uid, email, displayName, savedRosters, submittedRosters }: User) {
    const userRef = doc(this.firestore, `users/${uid}`);

    const data = {
      uid,
      email,
      displayName,
      savedRosters,
      submittedRosters,
    };

    return setDoc(userRef, data, { merge: true });
  }
}
