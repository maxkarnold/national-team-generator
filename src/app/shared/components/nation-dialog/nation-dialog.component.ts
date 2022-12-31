import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { originalOrder } from '@shared/utils';
import { Tournament32 } from 'app/pages/simulation/simulation.model';
import { reportCard } from 'app/pages/simulation/simulation.utils';

@Component({
  selector: 'app-nation-dialog',
  templateUrl: './nation-dialog.component.html',
  styleUrls: ['./nation-dialog.component.scss'],
})
export class NationDialogComponent implements OnChanges {
  @Input() nation?: GroupTeam = undefined;
  @Input() tournament?: Tournament32;
  @Output() closeDialog = new EventEmitter<boolean>(false);
  @Output() nationChange = new EventEmitter<GroupTeam>();

  screenWidth: number;
  originalOrder = originalOrder;
  reportCard = reportCard;
  rounds = [
    'Round of 16',
    'Quarter Finals',
    'Semi Finals',
    'Finals / Third Place Match',
  ];
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

  constructor() {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nation && this.tournament?.bracket) {
      this.gradePerformance();
    }
  }

  gradePerformance() {
    const { nation } = this;
    if (nation?.ranking === undefined) {
      return;
    }
    if (nation.grade) {
      this.gradeStyle = this.getGradeStyle(nation.grade);
      return;
    }
    // const rankingTiers = [6, 11, 26, 41, 56, 80, 400];
    const rankingTiers = ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];

    rankingTiers.every((r, i) => {
      if (nation.ranking && nation.tier === r) {
        const { grade, result } = this.calcGrade(i);
        nation.grade = grade;
        nation.tournamentFinish = result;
        this.gradeStyle = this.getGradeStyle(grade);
        return false;
      }
      return true;
    });
  }

  calcGrade(rankingIndex: number): {
    grade: string | undefined;
    result: string | undefined;
  } {
    // s, a, b, c, d, e, f, g tier
    const { nation, tournament } = this;
    if (
      !nation ||
      tournament?.groupWinners === undefined ||
      tournament.bracket === undefined ||
      tournament.stats === undefined
    ) {
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
    } else if (
      tournament.bracket.finals[1].includes(nation) &&
      tournament.stats[2] !== nation
    ) {
      gradeArr = ['b', 'b', 'a', 's', 's', 's', 's', 's'];
      result = '4th Place';
    } else if (tournament.stats[2] === nation) {
      gradeArr = ['b', 'a', 'a', 's', 's', 's', 's', 's'];
      result = '3rd Place';
    } else if (tournament.stats[1] === nation) {
      gradeArr = ['b', 'a', 's', 's', 's', 's', 's', 's'];
      result = 'Runner Up';
    } else if (tournament.stats[0] === nation) {
      gradeArr = ['a', 'a', 's', 's', 's', 's', 's', 's'];
      result = 'Winner';
    }
    return {
      grade: gradeArr[rankingIndex],
      result,
    };
  }

  getGradeStyle(
    grade: string | undefined
  ): '' | 'good-grade' | 'ok-grade' | 'bad-grade' {
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

  changeNation(nation: GroupTeam) {
    const updatedNation = this.tournament?.groups
      ?.flat()
      .find((a) => a.name === nation.name);
    if (updatedNation) {
      this.nationChange.emit(updatedNation);
    } else {
      this.nationChange.emit(nation);
    }
  }
}
