import { Component, OnInit } from '@angular/core';
import { Nation } from 'app/models/nation.model';
import * as nationsModule from 'assets/json/nations.json';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent implements OnInit {
  nations = nationsModule;
  nationsList: Nation[] = [];

  constructor() {
    this.nations
      .map((tier) => tier.nations)
      .forEach((nationsArr) =>
        nationsArr.forEach((nation) => this.nationsList.push(nation as Nation))
      );
  }

  ngOnInit(): void {
    console.log(this.nationsList);
  }
}
