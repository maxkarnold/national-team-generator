import { capitalize, round, sum } from 'lodash-es';
import { CompStyleStats, DraftChampion, compStyleReqs } from './draft.model';
import { startsWithVowel } from '@shared/utils';
import { WritableSignal } from '@angular/core';
import { get as _get } from 'lodash-es';

function needsMoreDmgAdvice(selectedTeamChamps: DraftChampion[]): { needsMoreApDmg: boolean; needsMoreAdDmg: boolean } {
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

function needsMoreScalingAdvice(selectedTeamChamps: DraftChampion[]): {
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

/**
 * Calculates the team's composition style statistics based on the selected champions.
 *
 * @param {DraftChampion[]} selectedTeamChamps - The array of champions selected for the team.
 * @return {CompStyleStats} The composition style statistics for the team.
 */
function getTeamCompStyleScoring(selectedTeamChamps: DraftChampion[]): CompStyleStats {
  const compStats: CompStyleStats = {
    engage: 0,
    pick: 0,
    protect: 0,
    siege: 0,
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

export function getCompositionAdviceAndGrade(
  isBlueSide: boolean,
  blueSideChampPlaceholders: WritableSignal<Partial<DraftChampion>[]>,
  redSideChampPlaceholders: WritableSignal<Partial<DraftChampion>[]>,
  blueSideDraftScores: WritableSignal<number[]>,
  redSideDraftScores: WritableSignal<number[]>
) {
  const selectedTeamChamps = isBlueSide
    ? ([...blueSideChampPlaceholders().filter(c => c?.id)] as DraftChampion[])
    : ([...redSideChampPlaceholders().filter(c => c?.id)] as DraftChampion[]);

  if (selectedTeamChamps.length < 1) {
    return ['Choose champions before receiving advice.'];
  }
  const advice: string[] = [];
  // composition advice
  // team comp should have balanced damage sources (2 low dmg of each or 1 high dmg of each type, mix would count as half, so low mix is 1/2 a low dmg and high mix is equal to low dmg)
  // team comp should have some early, mid and late game champs to be more balanced, it can be skewed but not too much
  // team comp should have attributes that fill one comp style

  const { needsMoreEarlyChamps, needsMoreMidChamps, needsMoreLateChamps } = needsMoreScalingAdvice(selectedTeamChamps);
  const { needsMoreAdDmg, needsMoreApDmg } = needsMoreDmgAdvice(selectedTeamChamps);

  const compStyles: CompStyleStats = getTeamCompStyleScoring(selectedTeamChamps);
  const sortedComps = Object.entries(compStyles)
    .map(([a, b]) => [capitalize(a), b])
    .sort((a, b) => b[1] - a[1]);

  if (selectedTeamChamps.length === 5) {
    const scores = isBlueSide ? [...blueSideDraftScores()] : [...redSideDraftScores()];
    let grade = sum(scores) / 5;
    const allNegativeAdvice = [needsMoreEarlyChamps, needsMoreMidChamps, needsMoreLateChamps, needsMoreAdDmg, needsMoreApDmg];
    for (let i = 0; i < allNegativeAdvice.length; i++) {
      grade -= allNegativeAdvice[i] ? 1.5 : 0;
    }
    if (sortedComps[0][1] > 25) {
      grade += 1.5;
    } else if (sortedComps[0][1] > 30) {
      grade += 3;
    }
    advice.push(`This draft scores ${round(grade, 1)} of 20.`);
  }

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
