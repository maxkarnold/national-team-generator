import { Component, HostListener } from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { SimulationService } from './simulation.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent {
  service: SimulationService;
  selectedNation: GroupTeam | null = null;

  constructor(service: SimulationService) {
    this.service = service;

    service.selectedNation$
      .pipe(untilDestroyed(this))
      .subscribe((nation) => (this.selectedNation = nation));
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.service.changeSelectedNation(null);
  }

  changeSelectedNation(nation?: GroupTeam) {
    this.service.changeSelectedNation(nation || null);
  }
}
