import { Champion } from '../champion/champion.model';
import { AllRoles, Role } from '../player/player.model';
import {
  CompStyleStats,
  DraftChampion,
  DraftPhase,
  DraftPlayer,
  AllRolesTierList,
  TierListRankings,
  blueSideBanRounds,
  blueSidePickRounds,
  compStyleReqs,
  patchMSI24,
  redSideBanRounds,
  redSidePickRounds,
  tierValues,
  PatchData,
  PatchName,
  DraftDifficulty,
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

function getMetaStrength(champion: Champion, patchVersion: AllRolesTierList): [number, number, number, number, number] {
  const { id } = champion;

  const topStrength = getRoleMetaStrength(id, patchVersion.top);
  const jungleStrength = getRoleMetaStrength(id, patchVersion.jungle);
  const midStrength = getRoleMetaStrength(id, patchVersion.mid);
  const adcStrength = getRoleMetaStrength(id, patchVersion.adc);
  const supportStrength = getRoleMetaStrength(id, patchVersion.support);

  return [topStrength, jungleStrength, midStrength, adcStrength, supportStrength];
}

function getRoleMastery(id: number, roleMasteries: TierListRankings) {
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

export function getPatchData(name: PatchName): PatchData {
  if (name === 'MSI 24') {
    return {
      name,
      version: 14.8,
      excludedChamps: [133],
      patchTierList: patchMSI24,
    };
  }
  return {
    name,
    version: 14.8,
    excludedChamps: [],
    patchTierList: patchMSI24,
  };
}

export function getDraftChampions(
  champions: Champion[],
  patchData: PatchData,
  playerMasteries: DraftPlayer[],
  opponentMasteries: DraftPlayer[]
): DraftChampion[] {
  return champions
    .filter(c => !patchData.excludedChamps.includes(c.id))
    .map(c => {
      const metaStrength = getMetaStrength(c, patchData.patchTierList);
      const selectedRole = AllRoles[metaStrength.indexOf(Math.max(...metaStrength))];
      console.log(playerMasteries, opponentMasteries);
      return {
        ...c,
        metaStrength,
        playerMastery: getAllMasteries(c, playerMasteries),
        opponentMastery: getAllMasteries(c, opponentMasteries),
        currentSynergy: {},
        currentCounter: {
          player: {
            top: 0,
            jungle: 0,
            mid: 0,
            adc: 0,
            support: 0,
          },
          opp: {
            top: 0,
            jungle: 0,
            mid: 0,
            adc: 0,
            support: 0,
          },
        },
        currentScore: {},
        isPlaceholder: false,
        selectedRole,
        adviceTags: {
          player: {
            top: [],
            jungle: [],
            mid: [],
            adc: [],
            support: [],
          },
          opp: {
            top: [],
            jungle: [],
            mid: [],
            adc: [],
            support: [],
          },
        },
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
  isRedSide: boolean,
  playerSide?: string
): [number, number, number, number, number] {
  // this will return the masteries of the champ based on the playerMastery and opponentMastery prop on the champ
  if (playerSide) {
    return playerSide === 'player' ? champ.playerMastery : champ.opponentMastery;
  }
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

/**
 * Generates a list of draft players with randomly assigned champion masteries based on the provided patch tier list and difficulty level.
 *
 * @param {PatchData} patchTierList - An object containing the patch tier list for each role.
 * @param {DraftDifficulty} [difficulty='medium'] - The difficulty level for generating the champion masteries. Defaults to 'medium'.
 * @return {DraftPlayer[]} An array of draft players with their main role and randomly assigned champion masteries.
 */
export function getRandomMasteries({ patchTierList }: PatchData, difficulty: DraftDifficulty = 'medium'): DraftPlayer[] {
  const playerMasteries: DraftPlayer[] = [];

  for (const role in patchTierList) {
    if (Object.prototype.hasOwnProperty.call(patchTierList, role)) {
      const { s, a, b, c, d } = patchTierList[role as keyof AllRolesTierList];
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
