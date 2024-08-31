import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DraftComponent } from './draft.component';
import { MobaService } from '../moba.service';
import { DraftAdviceComponent } from './draft-advice/draft-advice.component';
import { DraftAdviceService } from './draft-advice/draft-advice.service';

const routes: Routes = [
  {
    path: '',
    component: DraftComponent,
  },
];

@NgModule({
  declarations: [DraftComponent, DraftAdviceComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  providers: [MobaService, DraftAdviceService],
})
export class DraftModule {}
