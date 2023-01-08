import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GroupTeam } from 'app/models/nation.model';
import { Tournament32 } from 'app/pages/simulation/simulation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';

@UntilDestroy()
@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.scss'],
})
export class AwardsComponent {
  service: SimulationService;
  tournament: Tournament32 | null = null;

  tournamentStats = [
    {
      emoji: '🥇',
    },
    {
      emoji: '🥈',
    },
    {
      emoji: '🥉',
    },
    {
      emoji: '📉',
    },
    {
      emoji: '📈',
    },
  ];

  constructor(service: SimulationService) {
    this.service = service;
    service.tournament$
      .pipe(untilDestroyed(this))
      .subscribe((t) => (this.tournament = t));
  }

  openNationStats(nation: GroupTeam | null) {
    this.service.changeSelectedNation(nation);
  }
}
