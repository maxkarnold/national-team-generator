import { Component, HostListener } from '@angular/core';
import { groupLetters } from 'app/football/simulation/simulation.utils';
import { GroupTeam } from 'app/football/models/nation.model';
import { SimulationService } from 'app/football/simulation/simulation.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Tournament } from 'app/football/simulation/simulation.model';

@UntilDestroy()
@Component({
  selector: 'app-group-stage',
  templateUrl: './group-stage.component.html',
  styleUrls: ['./group-stage.component.scss'],
})
export class GroupStageComponent {
  service: SimulationService;
  screenWidth: number;
  tournament: Tournament | null = null;
  groupLetters = groupLetters;
  headings = ['RNK', 'MP', 'PTS', 'GD', 'GS', 'GA'];

  constructor(service: SimulationService) {
    this.service = service;
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    service.tournament$.pipe(untilDestroyed(this)).subscribe(t => (this.tournament = t));
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  getNationClass(nation: GroupTeam) {
    return `nation ${nation.region}`;
  }

  openNationStats(nation: GroupTeam | null) {
    this.service.changeSelectedNation(nation);
  }
}
