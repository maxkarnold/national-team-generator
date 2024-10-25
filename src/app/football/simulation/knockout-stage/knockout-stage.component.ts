import { Component, HostListener } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { originalOrder } from '@shared/utils';
import { GroupTeam } from 'app/football/models/nation.model';
import { Tournament } from 'app/football/simulation/simulation.model';
import { SimulationService } from 'app/football/simulation/simulation.service';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.scss'],
})
export class KnockoutStageComponent {
  screenWidth: number;
  service: SimulationService;
  tournament: Tournament | null = null;
  originalOrder = originalOrder;

  constructor(service: SimulationService) {
    this.service = service;
    this.screenWidth = window.innerWidth;
    this.getScreenSize();

    service.tournament$
      .pipe(
        untilDestroyed(this),
        filter(t => t?.bracket !== undefined)
      )
      .subscribe(t => {
        this.tournament = t;
      });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  openNationStats(nation: GroupTeam | null) {
    this.service.changeSelectedNation(nation);
  }
}
