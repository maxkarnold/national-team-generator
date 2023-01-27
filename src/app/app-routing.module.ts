import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/services/auth.guard';
import { AwardsComponent, GroupStageComponent, KnockoutStageComponent } from '@shared/components';
import { HomeComponent } from './pages/home/home.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { LoginComponent } from './pages/login/login.component';
import { SimulationComponent } from './pages/simulation/simulation.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'simulation',
    pathMatch: 'full',
  },
  {
    path: 'simulation',
    component: SimulationComponent,
    children: [
      {
        path: 'group-stage',
        component: GroupStageComponent,
      },
      {
        path: 'bracket',
        component: KnockoutStageComponent,
      },
      {
        path: 'awards',
        component: AwardsComponent,
      },
      { path: '', redirectTo: 'group-stage', pathMatch: 'full' },
    ],
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '/simulation/group-stage' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
