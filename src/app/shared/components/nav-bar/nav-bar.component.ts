import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
  loginOverlayOpen = false;
  navToggle = false;
  isLoggedIn = false;

  subscription: Subscription = new Subscription();

  constructor(public auth: AuthService) {}
}
