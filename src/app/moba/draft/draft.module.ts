import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DraftComponent } from './draft.component';
import { MobaService } from '../moba.service';
import { DraftAdviceComponent } from './draft-advice/draft-advice.component';
import { DraftAdviceService } from './services/draft-advice.service';
import { DraftSideComponent } from './draft-side/draft-side.component';
import { DraftSelectionComponent } from './draft-selection/draft-selection.component';
import { DraftStartComponent } from './draft-start/draft-start.component';
import { DraftStartTableComponent } from './draft-start/draft-start-table/draft-start-table.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { DraftService } from './services/draft.service';

const routes: Routes = [
  {
    path: '',
    component: DraftComponent,
  },
];

@NgModule({
  declarations: [
    DraftComponent,
    DraftAdviceComponent,
    DraftSideComponent,
    DraftSelectionComponent,
    DraftStartComponent,
    DraftStartTableComponent,
    BottomNavComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  providers: [MobaService, DraftService],
})
export class DraftModule {}
