import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;
  

  constructor(public auth: AngularFireAuth, private db: AngularFirestore) { }

  async login(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password)
      .then(res => {
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(res.user));
      })
      .catch(err => {
        var errorCode = err.code;
        var errorMessage = err.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(err);
      });
  }

  async signUp(email: string, password: string) {
    await this.auth.createUserWithEmailAndPassword(email, password)
      .then(res => {
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(res.user));
      });
    this.getUser().subscribe((user) => {
      if (user) {
        this.db.collection('users').doc(user.uid).set({
          email: email,
          userId: user.uid
        });
      } else {
        console.log('error when signing up');
      }
    })
    
  }

  logout() {
    this.auth.signOut();
    localStorage.removeItem('user');
  }

  getUser() {
    const user = this.auth.user;
    return user
  }
  

}
