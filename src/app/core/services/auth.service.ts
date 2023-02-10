import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider } from 'firebase/auth';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from './firestore.model';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user$: Observable<User | null> = of(null);
  user: User | null = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router, private snackbar: MatSnackBar) {
    this.user$ = afAuth.user;
    this.user$.pipe(untilDestroyed(this)).subscribe(u => {
      this.user = u;
    });
  }

  googleSignin() {
    const provider = new GoogleAuthProvider();
    this.afAuth
      .signInWithPopup(provider)
      .then(credential => {
        if (credential.user) {
          this.updateUserData(credential.user);
          this.snackbar.open('Successfully logged in!', 'Dismiss');
          this.router.navigate(['/simulation']);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  login(email: string, password: string) {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        this.snackbar.open('Successfully logged in!', 'Dismiss');
        this.router.navigate(['/simulation']);
        this.user$ = of(userCredential.user);
      })
      .catch((err: FirebaseError) => {
        this.snackbar.open(`ERROR ${(err.code, err.message, err.name)}`);
      });
  }

  register(email: string, password: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password).then(userCredential => {
      if (userCredential.user) {
        this.updateUserData(userCredential.user);
      }
    });
  }

  signOut() {
    this.afAuth.signOut().then(_ => {
      this.user$ = of(null);
      this.snackbar.open('Successfully logged out!', 'Dismiss');
      this.router.navigate(['/']);
    });
  }

  private updateUserData({ uid, email, displayName, savedRosters, submittedRosters }: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);

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
