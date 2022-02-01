import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'team-gen';
  loginOverlayOpen = false;
  registerOverlayOpen = false;
  navToggle = false;
  isLoggedIn = false;

  subscription: Subscription = new Subscription();

  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.auth.currentAuthState.subscribe(
      (authState) => (this.isLoggedIn = authState)
    );
    if (localStorage.getItem('user') !== null) {
      this.auth.changeAuthState(true);
    } else {
      this.auth.changeAuthState(false);
    }
  }

  loginOverlay() {
    if (!this.loginOverlayOpen) {
      this.loginOverlayOpen = true;
      this.registerOverlayOpen = false;
    } else {
      this.loginOverlayOpen = false;
    }
  }

  registerOverlay() {
    if (!this.registerOverlayOpen) {
      this.registerOverlayOpen = true;
      this.loginOverlayOpen = false;
    } else {
      this.registerOverlayOpen = false;
    }
  }

  login(email: string, password: string) {
    this.auth
      .login(email, password)
      .then((res) => {
        this.auth.changeAuthState(true);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.loginOverlayOpen = false;
        console.log('Logged in');
      })
      .catch((err) => {
        let errorCode = err.code;
        let errorMessage = err.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(err);
      });
  }

  signup(name: string, email: string, password: string) {
    this.auth
      .signUp(email, password)
      .then((res) => {
        this.auth.changeAuthState(true);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.registerOverlayOpen = false;
        console.log('Registered Account');
        alert('Succesfully registered and logged in!');
      })
      .catch((err) => {
        let errorCode = err.code;
        let errorMessage = err.message;
        if (errorCode === 'auth/email-already-in-use') {
          alert('This email is already in use.');
        } else if (errorCode === 'auth/invalid-email') {
          alert('This email address is invalid.');
        } else {
          alert(errorMessage);
        }
        console.log(err);
      });
    this.auth.getUser().subscribe((user) => {
      if (user) {
        this.afs.collection('users').doc(user.uid).set({
          email: email,
          userId: user.uid,
          displayName: name,
        });
      } else {
        console.log('error when signing up');
      }
    });
  }

  logout() {
    this.auth.logout();
    console.log('logged out');
    this.auth.changeAuthState(false);
  }
}
