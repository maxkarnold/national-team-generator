import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { MobaService } from './moba.service';
import { PlayerSelectComponent } from './player-select/player-select.component';
import { DraftComponent } from './draft/draft.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'player-select', component: PlayerSelectComponent },
      { path: 'draft', component: DraftComponent },
      { path: '', redirectTo: 'draft', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [HomeComponent, PlayerSelectComponent, DraftComponent],
  providers: [MobaService],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class MobaModule {}
