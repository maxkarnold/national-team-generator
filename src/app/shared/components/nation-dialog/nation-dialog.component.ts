import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { originalOrder } from '@shared/utils';
import { Tournament32 } from 'app/pages/simulation/simulation.model';

@Component({
  selector: 'app-nation-dialog',
  templateUrl: './nation-dialog.component.html',
  styleUrls: ['./nation-dialog.component.scss'],
})
export class NationDialogComponent implements OnChanges {
  @Input() nation?: GroupTeam = undefined;
  @Input() tournament?: Tournament32;

  originalOrder = originalOrder;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nation && this.tournament?.bracket) {
      this.gradePerformance();
    }
  }

  gradePerformance() {
    const { nation } = this;
    if (nation?.ranking === undefined || nation.grade) {
      return;
    }

    const rankingTiers = [6, 11, 26, 41, 56, 80, 400];
    let hasGrade = false;

    rankingTiers.forEach((r, i) => {
      if (nation.ranking && nation.ranking < r && !hasGrade) {
        const { grade, result } = this.calcGrade(i);
        nation.grade = grade;
        nation.tournamentFinish = result;
        hasGrade = true;
      }
    });
  }

  calcGrade(rankingIndex: number): {
    grade: string | undefined;
    result: string | undefined;
  } {
    // top 5, top 10, top 25, top 40, top 55, top 80, other teams
    const { nation, tournament } = this;
    if (
      !nation ||
      tournament?.groupWinners === undefined ||
      tournament.bracket === undefined ||
      tournament.stats === undefined
    ) {
      console.log('fail');
      return { grade: undefined, result: undefined };
    }
    let gradeArr = ['f', 'f', 'f', 'f', 'f', 'f', 'f'];
    let result = '';
    if (nation.points < 3 && nation.gDiff < -3) {
      gradeArr = ['f', 'f', 'f', 'd', 'c', 'c', 'c'];
      result = 'Group Stage';
    } else if (nation.points < 3) {
      gradeArr = ['f', 'f', 'd', 'c', 'c', 'b', 'b'];
      result = 'Group Stage';
    } else if (!tournament.groupWinners.includes(nation)) {
      gradeArr = ['f', 'f', 'c', 'c', 'b', 'b', 'a'];
      result = 'Group Stage';
    } else if (!tournament.bracket.quarterFinals.flat().includes(nation)) {
      gradeArr = ['d', 'd', 'b', 'a', 'a', 's', 's'];
      [result] = this.rounds;
    } else if (!tournament.bracket.semiFinals.flat().includes(nation)) {
      gradeArr = ['c', 'c', 'b', 'a', 's', 's', 's'];
      result = 'Quarter Finals';
    } else if (
      tournament.bracket.finals[1].includes(nation) &&
      tournament.stats.third !== nation
    ) {
      gradeArr = ['b', 'b', 'a', 's', 's', 's', 's'];
      result = '4th Place';
    } else if (tournament.stats.third === nation) {
      gradeArr = ['b', 'a', 'a', 's', 's', 's', 's'];
      result = '3rd Place';
    } else if (tournament.stats.second === nation) {
      gradeArr = ['b', 'a', 's', 's', 's', 's', 's'];
      result = 'Runner Up';
    } else if (tournament.stats.first === nation) {
      gradeArr = ['a', 's', 's', 's', 's', 's', 's'];
      result = 'Winner';
    }
    return {
      grade: gradeArr[rankingIndex],
      result,
    };
  }

  gradeSummaries(nation: GroupTeam): string {
    const name = nation.name
      .split(' ')
      .map((l) => l[0].toLocaleUpperCase() + l.substring(1))
      .join(' ');
    switch (nation.grade) {
      case 's':
        return `${name} had perhaps their best performance at a major tournament ever! Fans will be ecstatic as ${name} blew expectations out of the water. No one thought they would make it this far.`;
      case 'a':
        return `What a tournament for ${name}! It was a resounding success that will send fans home with a smile.`;
      case 'b':
        return `A fairly decent tournament for ${name}. There should be no complaints as they were able to meet expectations.`;
      case 'c':
        return `The tournament was very mediocre for ${name}. Most likely no one will be fired, but perhaps players will be regretting this missed chance.`;
      case 'd':
        return `The tournament could have gone a lot better for ${name}, even if they didn't fully embarrass themselves.`;
      case 'f':
        return `This tournament was an absolute disaster in the eyes of the media. Head coach for the ${name} national team will most likely be fired shortly.`;
      default:
        return 'ERROR';
    }
  }
}
