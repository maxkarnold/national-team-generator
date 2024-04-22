import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationComponent } from './simulation.component';
import { SharedModule } from '@shared/shared.module';
import { SimulationService } from './simulation.service';
import { SimulationQualifiersService } from './simulation-qualifiers.service';
import { RouterModule, Routes } from '@angular/router';
import { GroupStageComponent } from './group-stage/group-stage.component';
import { KnockoutStageComponent } from './knockout-stage/knockout-stage.component';
import { StatsOverviewComponent } from './stats-overview/stats-overview.component';

const routes: Routes = [
  {
    path: '',
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
        path: 'stats-overview',
        component: StatsOverviewComponent,
      },
      { path: '', redirectTo: 'group-stage', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [SimulationComponent],
  providers: [SimulationService, SimulationQualifiersService],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class SimulationModule {}
