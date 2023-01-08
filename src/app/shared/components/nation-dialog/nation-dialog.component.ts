import { Component, HostListener } from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { originalOrder } from '@shared/utils';
import { Tournament32 } from 'app/pages/simulation/simulation.model';
import { reportCard } from 'app/pages/simulation/simulation.utils';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-nation-dialog',
  templateUrl: './nation-dialog.component.html',
  styleUrls: ['./nation-dialog.component.scss'],
})
export class NationDialogComponent {
  service: SimulationService;
  nation: GroupTeam | null = null;
  tournament: Tournament32 | null = null;
  screenWidth: number;
  originalOrder = originalOrder;
  gradeSummary = '';
  rounds = ['Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals / Third Place Match'];
  stages = [
    {
      heading: 'Qualifiers',
      prop: 'qualifiers',
    },
    {
      heading: 'Group Stage',
      prop: 'group',
    },
    {
      heading: 'Knockout Stage',
      prop: 'bracket',
    },
  ];
  gradeStyle?: string;

  constructor(service: SimulationService) {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    this.service = service;

    service.tournament$.pipe(untilDestroyed(this)).subscribe(t => (this.tournament = t));

    combineLatest([service.tournament$, service.selectedNation$])
      .pipe(untilDestroyed(this))
      .subscribe(([tournament, nation]) => {
        this.tournament = tournament;
        this.nation = nation;
        if (this.nation !== null) {
          this.gradePerformance();
          this.gradeSummary = reportCard(this.nation);
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  changeSelectedNation(nation?: GroupTeam) {
    if (nation === this.nation) {
      return;
    }
    this.service.changeSelectedNation(nation || null);
  }

  gradePerformance() {
    const { nation, tournament } = this;
    if (nation?.ranking === undefined || tournament === null) {
      return;
    }
    if (nation.grade) {
      this.gradeStyle = this.getGradeStyle(nation.grade);
      return;
    }

    let rankingTiers: Array<string | number> = ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];
    if (tournament.availableRegions) {
      const availableRegions = tournament.availableRegions.map(r => r.value);

      if (availableRegions.length === 1) {
        if (availableRegions[0] === 'uefa') {
          rankingTiers = [5, 10, 20, 35, 50, 80, 100, 400];
        } else if (availableRegions[0] === 'caf') {
          rankingTiers = [30, 60, 80, 110, 120, 130, 140, 400];
        }
      } else if (availableRegions.length < 5) {
        if (!availableRegions.includes('uefa') && !availableRegions.includes('conmebol')) {
          rankingTiers = [30, 60, 80, 110, 120, 130, 140, 400];
        } else if (!availableRegions.includes('ofc') && !availableRegions.includes('afc') && !availableRegions.includes('concacaf')) {
          rankingTiers = [5, 10, 20, 35, 50, 80, 100, 400];
        } else {
          rankingTiers = [1, 1, 2, 2, 3, 3, 4, 4];
        }
      }
    }

    rankingTiers.every((r, i) => {
      if (nation.ranking && (nation.ranking <= r || nation.tier === r || nation.pot === r)) {
        const { grade, result } = this.calcGrade(i);
        nation.grade = grade;
        nation.tournamentFinish = result;
        this.gradeStyle = this.getGradeStyle(grade);
        return false;
      }
      return true;
    });

    this.updateNation(nation);
  }

  calcGrade(rankingIndex: number): {
    grade: string | undefined;
    result: string | undefined;
  } {
    const { nation, tournament } = this;
    if (!nation || tournament?.groupWinners === undefined || tournament.bracket === undefined || tournament.awards === undefined) {
      return { grade: undefined, result: undefined };
    }
    let gradeArr = ['f', 'f', 'f', 'f', 'f', 'f', 'f', 'f'];
    let result = '';
    if (nation.matchesPlayed < 3) {
      gradeArr = Array(7).fill('n/a');
      result = 'Did Not Qualify';
    } else if (nation.points < 3 && nation.gDiff < -3) {
      gradeArr = ['f', 'f', 'f', 'd', 'c', 'c', 'c', 'b'];
      result = 'Group Stage';
    } else if (nation.points < 3) {
      gradeArr = ['f', 'f', 'd', 'c', 'c', 'b', 'b', 'a'];
      result = 'Group Stage';
    } else if (!tournament.groupWinners.includes(nation)) {
      gradeArr = ['f', 'f', 'c', 'c', 'b', 'b', 'a', 's'];
      result = 'Group Stage';
    } else if (!tournament.bracket.quarterFinals.flat().includes(nation)) {
      gradeArr = ['d', 'd', 'b', 'a', 'a', 's', 's', 's'];
      [result] = this.rounds;
    } else if (!tournament.bracket.semiFinals.flat().includes(nation)) {
      gradeArr = ['c', 'c', 'b', 'a', 's', 's', 's', 's'];
      result = 'Quarter Finals';
    } else if (tournament.bracket.finals[1].includes(nation) && tournament.awards[2] !== nation) {
      gradeArr = ['b', 'b', 'a', 's', 's', 's', 's', 's'];
      result = '4th Place';
    } else if (tournament.awards[2] === nation) {
      gradeArr = ['b', 'a', 'a', 's', 's', 's', 's', 's'];
      result = '3rd Place';
    } else if (tournament.awards[1] === nation) {
      gradeArr = ['b', 'a', 's', 's', 's', 's', 's', 's'];
      result = 'Runner Up';
    } else if (tournament.awards[0] === nation) {
      gradeArr = ['a', 'a', 's', 's', 's', 's', 's', 's'];
      result = 'Winner';
    }
    return {
      grade: gradeArr[rankingIndex],
      result,
    };
  }

  getGradeStyle(grade: string | undefined): '' | 'good-grade' | 'ok-grade' | 'bad-grade' {
    if (grade) {
      switch (grade) {
        case 's':
        case 'a':
          return 'good-grade';
        case 'b':
        case 'c':
          return 'ok-grade';
        case 'd':
        case 'f':
          return 'bad-grade';
        default:
          return 'bad-grade';
      }
    }
    return '';
  }

  updateNation(nation: GroupTeam) {
    const updatedNation = this.tournament?.groups?.flat().find(a => a.name === nation.name);
    if (updatedNation !== undefined) {
      this.service.selectedNation$.next(updatedNation);
      return;
    }
  }
}
