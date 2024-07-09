import { getRandomInt } from '@shared/utils';
import { Champion } from '../champion/champion.model';
import { patchMSI24 } from '../patch-lists/msi-24';
import { AllRoles, Role, RoleIndex } from '../player/player.model';
import {
  DraftChampion,
  DraftPhase,
  DraftPlayer,
  AllRolesTierList,
  TierListRankings,
  blueSideBanRounds,
  blueSidePickRounds,
  redSideBanRounds,
  redSidePickRounds,
  tierValues,
  PatchData,
  PatchName,
  DraftDifficulty,
  ChampionAdvice,
  TierValue,
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

export function getAdviceTags(
  metaStrength: [number, number, number, number, number],
  playerMasteries: [number, number, number, number, number],
  opponentMasteries: [number, number, number, number, number]
): { player: ChampionAdvice; opp: ChampionAdvice } {
  return {
    player: {
      top: metaStrength[RoleIndex.TOP] < TierValue.C || playerMasteries[RoleIndex.TOP] < TierValue.D ? ['Not Recommended'] : [],
      jungle: metaStrength[RoleIndex.JUNGLE] < TierValue.C || playerMasteries[RoleIndex.JUNGLE] < TierValue.D ? ['Not Recommended'] : [],
      mid: metaStrength[RoleIndex.MID] < TierValue.C || playerMasteries[RoleIndex.MID] < TierValue.D ? ['Not Recommended'] : [],
      adc: metaStrength[RoleIndex.ADC] < TierValue.C || playerMasteries[RoleIndex.ADC] < TierValue.D ? ['Not Recommended'] : [],
      support: metaStrength[RoleIndex.SUPPORT] < TierValue.C || playerMasteries[RoleIndex.SUPPORT] < TierValue.D ? ['Not Recommended'] : [],
    },
    opp: {
      top: metaStrength[RoleIndex.TOP] < TierValue.C || opponentMasteries[RoleIndex.TOP] < TierValue.D ? ['Not Recommended'] : [],
      jungle: metaStrength[RoleIndex.JUNGLE] < TierValue.C || opponentMasteries[RoleIndex.JUNGLE] < TierValue.D ? ['Not Recommended'] : [],
      mid: metaStrength[RoleIndex.MID] < TierValue.C || opponentMasteries[RoleIndex.MID] < TierValue.D ? ['Not Recommended'] : [],
      adc: metaStrength[RoleIndex.ADC] < TierValue.C || opponentMasteries[RoleIndex.ADC] < TierValue.D ? ['Not Recommended'] : [],
      support:
        metaStrength[RoleIndex.SUPPORT] < TierValue.C || opponentMasteries[RoleIndex.SUPPORT] < TierValue.D ? ['Not Recommended'] : [],
    },
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
      // console.log(playerMasteries, opponentMasteries);
      const playerMastery = getAllMasteries(c, playerMasteries);
      const opponentMastery = getAllMasteries(c, opponentMasteries);
      return {
        ...c,
        metaStrength,
        playerMastery,
        opponentMastery,
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
        adviceTags: getAdviceTags(metaStrength, playerMastery, opponentMastery),
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

/**
 * Calculates the TierListRankings based on the provided list of champions and the draft difficulty.
 *
 * @param {number[]} allChamps - The list of all champions to consider.
 * @param {DraftDifficulty} difficulty - The difficulty level of the draft (easy, medium, hard).
 * @return {TierListRankings} The TierListRankings object with champion slices for each tier (s, a, b, c, d).
 */
function getChampionMasteryBasedOnDiff(allChamps: number[], difficulty: DraftDifficulty): TierListRankings {
  const diffFactors = { easy: 4.75, medium: 4, hard: 3.25 };
  const numOfChamps = allChamps.length;
  const sIndex = difficulty === 'hard' ? getRandomInt(2, 3) : difficulty === 'medium' ? getRandomInt(1, 2) : 1;
  const aIndex = Math.floor(numOfChamps / diffFactors[difficulty]) - 1;
  const bIndex = aIndex * 2 - 1;
  const cIndex = bIndex + Math.floor(aIndex / 1.5);
  const dIndex = Math.floor(cIndex + diffFactors[difficulty] * 1.5 - 1);
  console.log('numOfChamps', numOfChamps, aIndex, bIndex, cIndex, dIndex);
  return {
    s: allChamps.slice(0, sIndex),
    a: allChamps.slice(sIndex, aIndex),
    b: allChamps.slice(aIndex, bIndex),
    c: allChamps.slice(bIndex, cIndex),
    d: allChamps.slice(cIndex, dIndex),
  };
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
      const allChamps = [...mainChamps.slice(0, 4), ...shuffle(mainChamps.slice(4).concat(c, d))];
      // Randomly assign championMastery for the current role
      const championMastery = getChampionMasteryBasedOnDiff(allChamps, difficulty);

      const roleData: DraftPlayer = {
        mainRole: role as Role,
        championMastery,
      };

      playerMasteries.push(roleData);
    }
  }

  return playerMasteries;
}
