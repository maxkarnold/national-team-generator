import { Champion } from '../champion/champion.model';
import { AllRoles, Role } from '../player/player.model';
import {
  CompStyleStats,
  DraftChampion,
  DraftPhase,
  DraftPlayer,
  AllRolesTierList,
  PatchVersion,
  TierListRankings,
  blueSideBanRounds,
  blueSidePickRounds,
  compStyleReqs,
  patchMSI24,
  redSideBanRounds,
  redSidePickRounds,
  tierValues,
} from './draft.model';

import { get as _get, shuffle } from 'lodash-es';

function getRoleMetaStrength(id: number, roleTierList: TierListRankings): number {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tierFound = Object.entries(roleTierList).find(([_, championIds]: [string, number[]]) => {
    const typedChampionIds = championIds as number[];
    return typedChampionIds.includes(id);
  });

  if (tierFound) {
    const [tier] = tierFound;
    return tierValues[tier];
  }

  return 0;
}

function getMetaStrength(champion: Champion, patchVersion: string): [number, number, number, number, number] {
  if (patchVersion === 'MSI 24') {
    const { id } = champion;

    const topStrength = getRoleMetaStrength(id, patchMSI24.top);
    const jungleStrength = getRoleMetaStrength(id, patchMSI24.jungle);
    const midStrength = getRoleMetaStrength(id, patchMSI24.mid);
    const adcStrength = getRoleMetaStrength(id, patchMSI24.adc);
    const supportStrength = getRoleMetaStrength(id, patchMSI24.support);

    return [topStrength, jungleStrength, midStrength, adcStrength, supportStrength];
  } else {
    return [0, 0, 0, 0, 0];
  }
}

function getRoleMastery(id: number, roleMasteries: TierListRankings) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tierFound = Object.entries(roleMasteries).find(([_, championIds]: [string, number[]]) => {
    const typedChampionIds = championIds as number[];
    return typedChampionIds.includes(id);
  });

  if (tierFound) {
    const [tier] = tierFound;
    return tierValues[tier];
  }

  return 0;
}

export function getAllMasteries(champ: Champion, playerMasteries: DraftPlayer[]): [number, number, number, number, number] {
  // This will get all the masteries for a champion for each team
  const { id } = champ;

  const masteries = playerMasteries.reduce(
    (acc, player) => {
      acc[player.mainRole] = player.championMastery;
      return acc;
    },
    {} as Record<string, TierListRankings>
  );

  const topMastery = getRoleMastery(id, masteries['top']);
  const jungleMastery = getRoleMastery(id, masteries['jungle']);
  const midMastery = getRoleMastery(id, masteries['mid']);
  const adcMastery = getRoleMastery(id, masteries['adc']);
  const supportMastery = getRoleMastery(id, masteries['support']);

  return [topMastery, jungleMastery, midMastery, adcMastery, supportMastery];
}

export function getDraftChampions(
  champions: Champion[],
  patchVersion: PatchVersion,
  playerMasteries: DraftPlayer[],
  opponentMasteries: DraftPlayer[]
): DraftChampion[] {
  return champions.map(c => {
    const metaStrength = getMetaStrength(c, patchVersion);
    const selectedRole = AllRoles[metaStrength.indexOf(Math.max(...metaStrength))];
    return {
      ...c,
      metaStrength,
      playerMastery: getAllMasteries(c, playerMasteries),
      opponentMastery: getAllMasteries(c, opponentMasteries),
      currentSynergy: {},
      currentCounter: {},
      currentScore: {},
      isPlaceholder: false,
      selectedRole,
    };
  });
}

export function getChampPropFromDraftPhase(draftPhase: DraftPhase, currentDraftRound: number, isRedSide: boolean) {
  if (draftPhase.includes('Ban')) {
    let currentBans: number[];
    if (isRedSide) {
      currentBans = [...redSideBanRounds];
    } else {
      currentBans = [...blueSideBanRounds];
    }
    const isBanning = currentBans.includes(currentDraftRound);
    return isBanning ? 'opponent' : 'player';
  } else {
    let currentPicks: number[];
    if (isRedSide) {
      currentPicks = [...redSidePickRounds];
    } else {
      currentPicks = [...blueSidePickRounds];
    }
    const isPicking = currentPicks.includes(currentDraftRound);
    return isPicking ? 'player' : 'opponent';
  }
}

export function getChampMasteries(
  champ: DraftChampion,
  draftPhase: DraftPhase,
  currentDraftRound: number,
  isRedSide: boolean
): [number, number, number, number, number] {
  // this will return the masteries of the champ based on the playerMastery and opponentMastery prop on the champ
  const prop = getChampPropFromDraftPhase(draftPhase, currentDraftRound, isRedSide);

  if (prop === 'player') {
    return champ.playerMastery;
  } else {
    return champ.opponentMastery;
  }
}

export function getMasterySort(draftPhase: DraftPhase, currentDraftRound: number, isRedSide: boolean): 'playerMastery' | 'opponentMastery' {
  if (draftPhase.includes('Ban')) {
    let currentBans: number[];
    if (isRedSide) {
      currentBans = [...redSideBanRounds];
    } else {
      currentBans = [...blueSideBanRounds];
    }
    const isBanning = currentBans.includes(currentDraftRound);
    return isBanning ? 'opponentMastery' : 'playerMastery';
  } else {
    let currentPicks: number[];
    if (isRedSide) {
      currentPicks = [...redSidePickRounds];
    } else {
      currentPicks = [...blueSidePickRounds];
    }
    const isPicking = currentPicks.includes(currentDraftRound);
    return isPicking ? 'playerMastery' : 'opponentMastery';
  }
}

// function backtrack(index: number, chosen: (string | undefined)[], solutions: Set<string>, arrays: (string[] | undefined)[]): void {
//   if (index === arrays.length) {
//     solutions.add(chosen.filter(val => val !== undefined).join(''));
//     return;
//   }

//   if (arrays[index] === undefined) {
//     chosen.push(undefined);
//     backtrack(index + 1, chosen, solutions, arrays);
//     chosen.pop();
//   } else {
//     for (const value of arrays[index]!) {
//       chosen.push(value);
//       backtrack(index + 1, chosen, solutions, arrays);
//       chosen.pop();
//     }
//   }
// }

// function getPossibleStrings<T>(arrays: (string[] | undefined)[]): T[] {
//   const definedArrays = arrays.filter((arr): arr is string[] => arr !== undefined);
//   const uniqueStrings = [...new Set(definedArrays.flat())];
//   const possibleStrings: string[] = [];

//   for (const str of uniqueStrings) {
//     const newArrays = arrays.map(arr => (arr && arr.includes(str) ? arr : arr ? [...arr, str] : [str]));
//     const solutions = new Set<string>();
//     backtrack(0, [], solutions, newArrays);
//     if (solutions.size > definedArrays.length) {
//       possibleStrings.push(str);
//     }
//   }

//   return possibleStrings as T[];
// }

export function checkForAvailableRoles(selectedRoles: (Role | undefined)[]): Role[] {
  const undefinedCount = selectedRoles.filter(roleArr => !roleArr).length;
  const availableRoles = [...AllRoles];
  if (undefinedCount === 5) {
    return availableRoles;
  }
  if (undefinedCount === 0) {
    return [];
  }
  selectedRoles.forEach(role => {
    if (role) {
      availableRoles.splice(availableRoles.indexOf(role), 1);
    }
  });
  return availableRoles;
}

export function needsMoreDmgAdvice(selectedTeamChamps: DraftChampion[]): { needsMoreApDmg: boolean; needsMoreAdDmg: boolean } {
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

export function needsMoreScalingAdvice(selectedTeamChamps: DraftChampion[]): {
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

export function getTeamCompStyleScoring(selectedTeamChamps: DraftChampion[]): CompStyleStats {
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

export function getRandomMasteries(difficulty: 'easy' | 'medium' | 'hard'): DraftPlayer[] {
  // needs to check patchVersion
  // also can be used to add difficulties to draft

  const playerMasteries: DraftPlayer[] = [];

  for (const role in patchMSI24) {
    if (Object.prototype.hasOwnProperty.call(patchMSI24, role)) {
      const { s, a, b, c, d } = patchMSI24[role as keyof AllRolesTierList];
      const mainChamps = [...shuffle(s.concat(a, b))];
      const offMetaChamps = [...shuffle(c)];
      const weirdChamps = [...shuffle(d)];
      // Randomly assign championMastery for the current role
      const championMastery: TierListRankings = {
        s: [],
        a: [],
        b: [],
        c: [],
        d: [],
      };

      championMastery.s =
        difficulty === 'easy' ? mainChamps.slice(0, 1) : difficulty === 'hard' ? mainChamps.slice(0, 4) : mainChamps.slice(0, 2);
      championMastery.a =
        difficulty === 'easy'
          ? mainChamps.slice(1, 4)
          : difficulty === 'hard'
            ? [...mainChamps.slice(4, 8), offMetaChamps[0]]
            : [...mainChamps.slice(2, 5), offMetaChamps[0]];
      championMastery.b =
        difficulty === 'easy'
          ? [...mainChamps.slice(4, 7), offMetaChamps[0]]
          : difficulty === 'hard'
            ? [...mainChamps.slice(8, 11), ...offMetaChamps.slice(1, 3), ...weirdChamps.slice(0, 2)]
            : [...mainChamps.slice(5, 8), offMetaChamps[1], weirdChamps[0]];
      championMastery.c =
        difficulty === 'easy'
          ? [...mainChamps.slice(7, 9), ...offMetaChamps.slice(1, 3), ...weirdChamps.slice(0, 2)]
          : difficulty === 'hard'
            ? [...mainChamps.slice(11, 13), ...offMetaChamps.slice(3, 5), ...weirdChamps.slice(2, 4)]
            : [...mainChamps.slice(8, 12), offMetaChamps[2], weirdChamps[1]];
      championMastery.d =
        difficulty === 'easy'
          ? [...mainChamps.slice(9, 10), ...offMetaChamps.slice(3, 5), ...weirdChamps.slice(2, 5)]
          : difficulty === 'hard'
            ? [...offMetaChamps.slice(5, 7), ...weirdChamps.slice(4, 9)]
            : [...mainChamps.slice(12, 13), ...offMetaChamps.slice(3, 4), ...weirdChamps.slice(2, 4)];

      const roleData: DraftPlayer = {
        mainRole: role as Role,
        championMastery,
      };

      playerMasteries.push(roleData);
    }
  }

  return playerMasteries;
}
