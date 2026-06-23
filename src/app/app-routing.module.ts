import { NgModule } from '@angular/core';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/services/auth.guard';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LoginComponent } from './pages/login/login.component';
import { WorkInProgressComponent } from './pages/work-in-progress/work-in-progress.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'simulation',
    pathMatch: 'full',
  },
  {
    path: 'simulation',
    loadChildren: () => import('./football/simulation/simulation.module').then(m => m.SimulationModule),
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  {
    path: 'career',
    loadChildren: () => import('./football/career/career.module').then(m => m.CareerModule),
  },
  {
    path: 'moba',
    component: WorkInProgressComponent,
    // loadChildren: () => import('./moba/moba.module').then(m => m.MobaModule),
  },
  {
    path: 'rank-playlist',
    component: WorkInProgressComponent,
    // loadChildren: () => import('./spotify/spotify.module').then(m => m.SpotifyModule),
  },
  { path: '**', redirectTo: '/simulation' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [provideRouter(routes)],
})
export class AppRoutingModule {}
