import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSource = new BehaviorSubject<boolean>(false);
  currentAuthState = this.authStateSource.asObservable();

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signUp(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  logout() {
    this.afAuth.signOut();
    this.changeAuthState(true);
    localStorage.removeItem('user');
  }

  getUser() {
    const user$ = this.afAuth.user;
    return user$;
  }

  changeAuthState(authState: boolean) {
    this.authStateSource.next(authState);
  }
}
