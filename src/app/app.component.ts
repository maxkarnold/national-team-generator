import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'team-gen';
  loginOverlayOpen = false;
  navToggle = false;
  isLoggedIn = false;
  
  subscription: Subscription = new Subscription;

  constructor (private auth: AuthService, private cd: ChangeDetectorRef ) {

  }

  ngOnInit(): void {
    this.subscription = this.auth.currentAuthState.subscribe(authState => this.isLoggedIn = authState);
    if (localStorage.getItem('user') !== null) {
      this.auth.changeAuthState(true);
    } else {
      this.auth.changeAuthState(false);
    }
  }

  loginOverlay() {
    if (!this.loginOverlayOpen) {
      this.loginOverlayOpen = true;
    } else {
      this.loginOverlayOpen = false;
    }
  }

  login(email: string, password: string) {
    this.auth.login(email, password)
      .then(res => {
        this.auth.changeAuthState(true);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.loginOverlayOpen = false;
        console.log('Logged in');
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
  
  logout() {
    this.auth.logout();
    console.log('logged out');
    this.auth.changeAuthState(false);
  }

}
