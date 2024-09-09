import { Component } from '@angular/core';
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

  navigationItems = [
    {
      routerLink: '/simulation',
      displayName: 'Simulation',
    },
    {
      routerLink: '/career',
      displayName: 'Career',
    },
    // {
    //   routerLink: '/leaderboard',
    //   displayName: 'Leaderboard',
    // },
    {
      routerLink: '/moba',
      displayName: 'MOBA',
    },
    {
      routerLink: '/rank-playlist',
      displayName: 'Spotify',
    },
  ];
  constructor(public auth: AuthService) {}
}
