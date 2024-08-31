import { Injectable } from '@angular/core';
import { sum } from 'lodash-es';
import { DraftChampion, CompStyleStats, compStyleReqs, CompStyle, TierValue } from '../draft.model';
import { get as _get } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class DraftAdviceService {
  constructor() {}

  /**
   * Calculates the team's composition style statistics based on the selected champions.
   *
   * @param {DraftChampion[]} selectedTeamChamps - The array of champions selected for the team.
   * @return {CompStyleStats} The composition style statistics for the team.
   */
  getTeamCompStyleScoring(selectedTeamChamps: DraftChampion[]): CompStyleStats {
    const compStats: CompStyleStats = {
      engage: 0,
      pick: 0,
      disengage: 0,
      poke: 0,
      split: 0,
    };

    selectedTeamChamps.forEach(champ => {
      compStyleReqs.forEach(comp => {
        const primarySum = comp.primary.reduce((acc, attrPath) => {
          return _get(champ, 'attributes.' + attrPath) ? acc + 2 : acc;
        }, 0);
        const secondarySum = comp.secondary.reduce((acc, attrPath) => {
          return _get(champ, 'attributes.' + attrPath) ? acc + 1 : acc;
        }, 0);
        compStats[comp.name] += +primarySum + secondarySum;
      });
    });

    return compStats;
  }

  compareCompStyle(compStats: CompStyleStats, champ: DraftChampion, numOfChamps: number): number {
    const champStyle = this.getTeamCompStyleScoring([champ]);
    const teamCompScores = Object.entries({ ...compStats })
      .sort((a, b) => b[1] - a[1])
      .map(([c, num]) => [c, num / numOfChamps]) as [CompStyle, number][];
    const champCompScores = Object.entries(champStyle).sort((a, b) => b[1] - a[1]) as [CompStyle, number][];

    const compDiffArr: number[] = [];
    for (const style of champCompScores) {
      const compStyle = teamCompScores.find(s => s[0] === style[0]);
      if (compStyle) {
        compDiffArr.push(Math.abs(compStyle[1] - style[1]));
      }
    }
    // console.log(compDiffArr, { ...compStats }, champ.name, champStyle);
    const arrSum = sum(compDiffArr);
    if (arrSum <= 5) {
      return TierValue.S;
    } else if (arrSum <= 8) {
      return TierValue.A;
    } else if (arrSum <= 10) {
      return TierValue.B;
    } else if (arrSum <= 12) {
      return TierValue.C;
    } else if (arrSum <= 15) {
      return TierValue.D;
    } else {
      return TierValue.F;
    }
  }
}
