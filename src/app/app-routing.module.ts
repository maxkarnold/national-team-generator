import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/services/auth.guard';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'rank-playlist',
    pathMatch: 'full',
  },
  {
    path: 'simulation',
    loadChildren: () => import('./simulation/simulation.module').then(m => m.SimulationModule),
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  {
    path: 'career',
    loadChildren: () => import('./career/career.module').then(m => m.CareerModule),
  },
  {
    path: 'moba',
    loadChildren: () => import('./moba/moba.module').then(m => m.MobaModule),
  },
  {
    path: 'rank-playlist',
    loadChildren: () => import('./spotify/spotify.module').then(m => m.SpotifyModule),
  },
  { path: '**', redirectTo: '/simulation/group-stage' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
