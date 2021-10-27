import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authStateSource = new BehaviorSubject<boolean>(false);
  currentAuthState = this.authStateSource.asObservable();
  
  
  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore) { }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      
  }

  async signUp(email: string, password: string) {
    await this.afAuth.createUserWithEmailAndPassword(email, password)
      .then(res => {
        this.changeAuthState(true);
        localStorage.setItem('user', JSON.stringify(res.user));
      });
    this.getUser().subscribe((user) => {
      if (user) {
        this.afs.collection('users').doc(user.uid).set({
          email: email,
          userId: user.uid
        });
      } else {
        console.log('error when signing up');
      }
    })
    
  }

  logout() {
    this.afAuth.signOut();
    this.changeAuthState(true);
    localStorage.removeItem('user');
  }

  getUser() {
    const user = this.afAuth.user;
    return user
  }

  changeAuthState(authState: boolean) {
    this.authStateSource.next(authState);
  }
  

}
