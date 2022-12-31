import { Component, HostListener } from '@angular/core';
import { groupLetters } from 'app/pages/simulation/simulation.utils';
import { GroupTeam } from 'app/models/nation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';

@Component({
  selector: 'app-group-stage',
  templateUrl: './group-stage.component.html',
  styleUrls: ['./group-stage.component.scss'],
})
export class GroupStageComponent {
  screenWidth: number;
  service: SimulationService;
  groupLetters = groupLetters;
  headings = ['RNK', 'MP', 'PTS', 'GD', 'GS', 'GA'];

  constructor(service: SimulationService) {
    this.service = service;
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  getNationClass(nation: GroupTeam) {
    return `nation ${nation.region}`;
  }
}
