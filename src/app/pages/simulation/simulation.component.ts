import { Component, HostListener } from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { SimulationService } from './simulation.service';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent {
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.service.selectedNation = undefined;
  }

  service: SimulationService;

  constructor(service: SimulationService) {
    this.service = service;

    service.createTeams();
    service.setupTournament();
  }

  compareObj(o1: GroupTeam, o2: GroupTeam) {
    return o1?.name === o2?.name;
  }
}
