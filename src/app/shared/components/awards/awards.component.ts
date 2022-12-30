import { Component } from '@angular/core';
import { SimulationService } from 'app/pages/simulation/simulation.service';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.scss'],
})
export class AwardsComponent {
  service: SimulationService;

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
  }
}
