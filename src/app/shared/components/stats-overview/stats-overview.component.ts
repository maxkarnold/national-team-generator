import { Component, HostListener } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GroupTeam } from 'app/models/nation.model';
import { Tournament32 } from 'app/pages/simulation/simulation.model';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { getDisplayRating } from 'app/pages/simulation/simulation.utils';
import { get as _get } from 'lodash';

interface RankingsRow {
  overall: GroupTeam;
  attack: GroupTeam;
  midfield: GroupTeam;
  defense: GroupTeam;
}

@UntilDestroy()
@Component({
  selector: 'app-stats-overview',
  templateUrl: './stats-overview.component.html',
  styleUrls: ['./stats-overview.component.scss'],
})
export class StatsOverviewComponent {
  service: SimulationService;
  screenWidth: number;
  get = _get;
  getDisplayRating = getDisplayRating;
  tournament: Tournament32 | null = null;
  // rankings: { heading: string; prop: string; class: string; nations?: GroupTeam[] }[] | null = null;
  rankings: GroupTeam[][] = [];

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
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    service.tournament$.pipe(untilDestroyed(this)).subscribe(t => {
      if (!t?.awards || !t?.allTeams) {
        return;
      }
      this.tournament = t;
      this.rankings = [];
      for (let i = 0; i < t.allTeams.rankings.length; i++) {
        this.rankings.push([t.allTeams.rankings[i], t.allTeams.attRankings[i], t.allTeams.midRankings[i], t.allTeams.defRankings[i]]);
      }
      // this.rankings = null;
      // this.rankings = [
      //   {
      //     heading: 'Overall',
      //     prop: 'r',
      //     class: 'main',
      //     nations: t.allTeams.rankings,
      //   },
      //   {
      //     heading: 'Attack',
      //     prop: 'attR',
      //     class: 'att',
      //     nations: t.allTeams.attRankings,
      //   },
      //   {
      //     heading: 'Midfield',
      //     prop: 'midR',
      //     class: 'mid',
      //     nations: t.allTeams.midRankings,
      //   },
      //   {
      //     heading: 'Defense',
      //     prop: 'defR',
      //     class: 'def',
      //     nations: t.allTeams.defRankings,
      //   },
      // ];
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
