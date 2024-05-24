import { Champion } from '../champion/champion.model';
import { AllRoles, Role } from '../player/player.model';
import {
  CompStyleStats,
  DraftChampion,
  DraftPhase,
  DraftPlayer,
  PatchStrength,
  PatchVersion,
  RankedChampions,
  blueSideBanRounds,
  blueSidePickRounds,
  compStyleReqs,
  patchMSI24,
  redSideBanRounds,
  redSidePickRounds,
} from './draft.model';

import { get as _get, shuffle } from 'lodash-es';

function getRoleMetaStrength(id: number, roleTierList: RankedChampions, tierValues: { [key: string]: number }): number {
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
    const tierValues: { [key: string]: number } = { s: 20, a: 16, b: 12, c: 8, d: 4 };

    const topStrength = getRoleMetaStrength(id, patchMSI24.top, tierValues);
    const jungleStrength = getRoleMetaStrength(id, patchMSI24.jungle, tierValues);
    const midStrength = getRoleMetaStrength(id, patchMSI24.mid, tierValues);
    const adcStrength = getRoleMetaStrength(id, patchMSI24.adc, tierValues);
    const supportStrength = getRoleMetaStrength(id, patchMSI24.support, tierValues);

    return [topStrength, jungleStrength, midStrength, adcStrength, supportStrength];
  } else {
    return [0, 0, 0, 0, 0];
  }
}

function getRoleMastery(id: number, roleMasteries: RankedChampions, tierValues: { [key: string]: number }) {
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
  const tierValues: { [key: string]: number } = { s: 20, a: 16, b: 12, c: 8, d: 4 };

  const masteries = playerMasteries.reduce(
    (acc, player) => {
      acc[player.mainRole] = player.championMastery;
      return acc;
    },
    {} as Record<string, RankedChampions>
  );

  const topMastery = getRoleMastery(id, masteries['top'], tierValues);
  const jungleMastery = getRoleMastery(id, masteries['jungle'], tierValues);
  const midMastery = getRoleMastery(id, masteries['mid'], tierValues);
  const adcMastery = getRoleMastery(id, masteries['adc'], tierValues);
  const supportMastery = getRoleMastery(id, masteries['support'], tierValues);

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
      currentSynergy: 0,
      currentCounter: 0,
      currentScore: 0,
      isPlaceholder: false,
      selectedRole,
    };
  });
}

export function getChampMasteries(
  champ: DraftChampion,
  draftPhase: DraftPhase,
  currentDraftRound: number,
  isRedSide: boolean
): [number, number, number, number, number] {
  // this will return the masteries of the champ based on the playerMastery and opponentMastery prop on the champ
  if (draftPhase.includes('Ban')) {
    let currentBans: number[];
    if (isRedSide) {
      currentBans = [...redSideBanRounds];
    } else {
      currentBans = [...blueSideBanRounds];
    }
    const isBanning = currentBans.includes(currentDraftRound);
    return isBanning ? champ.opponentMastery : champ.playerMastery;
  } else {
    let currentPicks: number[];
    if (isRedSide) {
      currentPicks = [...redSidePickRounds];
    } else {
      currentPicks = [...blueSidePickRounds];
    }
    const isPicking = currentPicks.includes(currentDraftRound);
    return isPicking ? champ.playerMastery : champ.opponentMastery;
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

export function getRandomMasteries(): DraftPlayer[] {
  // needs to check patchVersion

  const playerMasteries: DraftPlayer[] = [];

  for (const role in patchMSI24) {
    if (Object.prototype.hasOwnProperty.call(patchMSI24, role)) {
      const { s, a, b, c, d } = patchMSI24[role as keyof PatchStrength];
      const mainChamps = [...shuffle(s.concat(a, b))];
      const offMetaChamps = [...shuffle(c)];
      const weirdChamps = [...shuffle(d)];
      // Randomly assign championMastery for the current role
      const championMastery: RankedChampions = {
        s: [],
        a: [],
        b: [],
        c: [],
        d: [],
      };

      championMastery.s = mainChamps.slice(0, 2);
      championMastery.a = [...mainChamps.slice(2, 5), offMetaChamps[0]];
      championMastery.b = [...mainChamps.slice(5, 8), offMetaChamps[1], weirdChamps[0]];
      championMastery.c = [...mainChamps.slice(8, 12), offMetaChamps[2]];
      if (mainChamps[12]) {
        championMastery.d.push(mainChamps[12]);
      }
      if (weirdChamps[1]) {
        championMastery.c.push(weirdChamps[1]);
      }
      if (weirdChamps[2]) {
        championMastery.d.push(weirdChamps[2]);
      }
      if (offMetaChamps[3]) {
        championMastery.d.push(offMetaChamps[3]);
      }
      const roleData: DraftPlayer = {
        mainRole: role as Role,
        championMastery,
      };

      playerMasteries.push(roleData);
    }
  }

  return playerMasteries;
}
