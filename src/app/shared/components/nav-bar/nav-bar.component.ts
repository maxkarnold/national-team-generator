import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  loginOverlayOpen = false;
  navToggle = false;
  isLoggedIn = false;

  subscription: Subscription = new Subscription();

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    // this.subscription = this.auth.currentAuthState.subscribe(
    //   (authState) => (this.isLoggedIn = authState)
    // );
    // if (localStorage.getItem('user') !== null) {
    //   this.auth.changeAuthState(true);
    // } else {
    //   this.auth.changeAuthState(false);
    // }
  }
}
