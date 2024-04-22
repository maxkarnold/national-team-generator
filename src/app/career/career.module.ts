import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CareerComponent } from './career.component';
import { CareerService } from './career.service';

@NgModule({
  declarations: [CareerComponent],
  providers: [CareerService],
  imports: [CommonModule, SharedModule],
})
export class CareerModule {}
