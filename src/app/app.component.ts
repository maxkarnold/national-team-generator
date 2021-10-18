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

  async login(email: string, password: string) {
    await this.auth.login(email, password);
    this.auth.changeAuthState(true);
    this.loginOverlayOpen = false;
    console.log('Logged in');
  }
  
  logout() {
    this.auth.logout();
    console.log('logged out');
    this.auth.changeAuthState(false);
  }
}
