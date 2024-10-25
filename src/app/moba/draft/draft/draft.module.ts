import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DraftComponent } from './draft.component';
import { MobaService } from '../../moba.service';
import { DraftAdviceComponent } from './draft-advice/draft-advice.component';
import { DraftAdviceService } from './draft-advice/draft-advice.service';
import { DraftRosterComponent } from './draft-roster/draft-roster.component';
import { DraftSelectionComponent } from './draft-selection/draft-selection.component';
import { DraftStartComponent } from './draft-start/draft-start.component';

const routes: Routes = [
  {
    path: '',
    component: DraftComponent,
  },
];

@NgModule({
  declarations: [DraftComponent, DraftAdviceComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), DraftRosterComponent, DraftSelectionComponent, DraftStartComponent],
  providers: [MobaService, DraftAdviceService],
})
export class DraftModule {}
