import { ChangeDetectionStrategy, Component } from '@angular/core';
import { startsWithVowel } from '@shared/utils';
import { capitalize } from 'lodash-es';
import { DraftChampion, CompStyleStats } from '../draft.model';
import { get as _get } from 'lodash-es';
import { DraftAdviceService } from './draft-advice.service';
import { DraftService } from '../draft.service';

@Component({
  selector: 'app-draft-advice',
  templateUrl: './draft-advice.component.html',
  styleUrl: './draft-advice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftAdviceComponent {
  blueSideAdvice: string[] = [];
  redSideAdvice: string[] = [];

  constructor(
    private service: DraftAdviceService,
    private draftService: DraftService
  ) {
    const blueSideChamps = this.draftService.blueSideChamps();
    const redSideChamps = this.draftService.redSideChamps();
    this.blueSideAdvice = this.updateCompositionAdvice(blueSideChamps);
    this.redSideAdvice = this.updateCompositionAdvice(redSideChamps);
    console.log('DRAFTADVICE COMPONENT', this.blueSideAdvice, this.redSideAdvice);
  }

  updateCompositionAdvice(champions: Partial<DraftChampion>[]): string[] {
    const selectedTeamChamps = champions.filter(c => c.selectedRole) as DraftChampion[];
    if (selectedTeamChamps.length < 1) {
      return ['Choose champions before receiving advice.'];
    }
    const advice: string[] = [];

    // team comp should have some early, mid and late game champs to be more balanced, it can be skewed but not too much
    // Scaling balance does not currently affect draft score.
    const { needsMoreEarlyChamps, needsMoreMidChamps, needsMoreLateChamps } = this.needsMoreScalingAdvice(selectedTeamChamps);

    // team comp should have balanced damage sources (2 low dmg of each or 1 high dmg of each type, mix would count as half, so low mix is 1/2 a low dmg and high mix is equal to low dmg)
    const { needsMoreAdDmg, needsMoreApDmg } = this.needsMoreDmgAdvice(selectedTeamChamps);

    // team comp should have attributes that fill one comp style
    const compStyles: CompStyleStats = this.service.getTeamCompStyleScoring(selectedTeamChamps);
    const sortedComps = Object.entries(compStyles)
      .map(([a, b]) => [capitalize(a), b])
      .sort((a, b) => b[1] - a[1]);

    // TODO: add scoring calculation here
    // if (selectedTeamChamps.length === 5) {
    //   const scores = isBlueSide ? [...blueSideDraftScores()] : [...redSideDraftScores()];
    //   let grade = sum(scores) / 5;
    //   const allNegativeAdvice = [needsMoreAdDmg, needsMoreApDmg];
    //   for (let i = 0; i < allNegativeAdvice.length; i++) {
    //     grade -= allNegativeAdvice[i] ? 1.5 : 0;
    //   }
    //   if (sortedComps[0][1] > 25) {
    //     grade += 1.5;
    //   } else if (sortedComps[0][1] > 30) {
    //     grade += 3;
    //   }
    //   advice.push(`This draft scores ${round(grade, 1)} of 20.`);
    // }

    if (needsMoreAdDmg) {
      advice.push('You need more AD damage sources.');
    }
    if (needsMoreApDmg) {
      advice.push('You need more AP damage sources.');
    }

    if (selectedTeamChamps.length < 3) {
      advice.push(`Your team is most suited to ${startsWithVowel(sortedComps[0][0]) ? 'an' : 'a'} ${sortedComps[0][0]} composition.`);
      return advice;
    }

    if (needsMoreEarlyChamps) {
      advice.push('Your team lacks Early game capability.');
    }
    if (needsMoreMidChamps) {
      advice.push('Your team lacks Mid game capability.');
    }
    if (needsMoreLateChamps) {
      advice.push('Your team lacks Late game capability.');
    }
    advice.push(`Your team is most suited to ${startsWithVowel(sortedComps[0][0]) ? 'an' : 'a'} ${sortedComps[0][0]} composition. `);
    advice.push(`A secondary option would be ${startsWithVowel(sortedComps[1][0]) ? 'an' : 'a'} ${sortedComps[1][0]} composition.`);
    return advice;
  }

  needsMoreDmgAdvice(selectedTeamChamps: DraftChampion[]): { needsMoreApDmg: boolean; needsMoreAdDmg: boolean } {
    const teamDamageTypes = selectedTeamChamps.map(c => c.dmgType);
    const needsMoreApDmg =
      teamDamageTypes.reduce((acc, dmg) => {
        if (dmg === 'high ap') {
          return acc + 2;
        }
        if (dmg === 'low ap' || dmg === 'high mix') {
          return acc + 1;
        }
        if (dmg === 'low mix') {
          return acc + 0.5;
        }
        return acc;
      }, 0) < 2;
    const needsMoreAdDmg =
      teamDamageTypes.reduce((acc, dmg) => {
        if (dmg === 'high ad') {
          return acc + 2;
        }
        if (dmg === 'low ad' || dmg === 'high mix') {
          return acc + 1;
        }
        if (dmg === 'low mix') {
          return acc + 0.5;
        }
        return acc;
      }, 0) < 2;

    return {
      needsMoreApDmg,
      needsMoreAdDmg,
    };
  }

  needsMoreScalingAdvice(selectedTeamChamps: DraftChampion[]): {
    needsMoreEarlyChamps: boolean;
    needsMoreMidChamps: boolean;
    needsMoreLateChamps: boolean;
  } {
    const requiredScore = selectedTeamChamps.length * 9.5;
    const earlyScore = selectedTeamChamps.reduce((acc, champ) => acc + champ.gameStateAttributes.early, 0);
    const midScore = selectedTeamChamps.reduce((acc, champ) => acc + champ.gameStateAttributes.mid, 0);
    const lateScore = selectedTeamChamps.reduce((acc, champ) => acc + champ.gameStateAttributes.late, 0);
    const needsMoreEarlyChamps = earlyScore < requiredScore;
    const needsMoreMidChamps = midScore < requiredScore;
    const needsMoreLateChamps = lateScore < requiredScore;

    return {
      needsMoreEarlyChamps,
      needsMoreMidChamps,
      needsMoreLateChamps,
    };
  }
}
