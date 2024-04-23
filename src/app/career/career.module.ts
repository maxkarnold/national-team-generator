import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CareerComponent } from './career.component';
import { CareerService } from './career.service';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: CareerComponent,
  },
];

@NgModule({
  declarations: [CareerComponent],
  providers: [CareerService],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class CareerModule {}
