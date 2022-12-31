import { Component, HostListener } from '@angular/core';
import { originalOrder } from '@shared/utils';
import { SimulationService } from 'app/pages/simulation/simulation.service';

@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.scss'],
})
export class KnockoutStageComponent {
  screenWidth: number;
  service: SimulationService;
  originalOrder = originalOrder;

  constructor(service: SimulationService) {
    this.service = service;
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }
}
