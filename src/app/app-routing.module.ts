import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/services/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LoginComponent } from './pages/login/login.component';
import { SimulationComponent } from './pages/simulation/simulation.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    // canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'simulation',
    component: SimulationComponent,
  },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
