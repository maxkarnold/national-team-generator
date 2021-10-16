import { Component, SimpleChange } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'team-gen';
  loginOverlayOpen = false;
  navToggle = false;
  isLoggedIn = false;

  constructor (private auth: AuthService) {

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
    if (this.auth.isLoggedIn) {
      this.isLoggedIn = true;
      this.loginOverlayOpen = false;
    }
    console.log('Logged in');
  }
  
  logout() {
    this.auth.logout();
    console.log('logged out');
    this.isLoggedIn = false;
  }
}
