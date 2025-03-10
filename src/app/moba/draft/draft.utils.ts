import { Champion } from '../champion/champion.model';
import { AllRoles, Role, RoleIndex } from '../player-draft/player/player.model';
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
  DifficultyLevel,
  ChampionAdvice,
  TierValue,
} from './draft.model';

import { get as _get, shuffle } from 'lodash-es';
import { patchSummer24 } from './patch-lists/summer-24';
import { patchMSI24 } from './patch-lists/msi-24';
import { patchSummer24v2 } from './patch-lists/summer-24-v2';
import { patchWorlds24 } from './patch-lists/worlds-24';

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
  switch (name) {
    case 'MSI 2024':
      return patchMSI24;
    case 'Summer 2024':
      return patchSummer24;
    case 'Summer 14.14 2024':
      return patchSummer24v2;
    case 'Worlds 2024':
      return patchWorlds24;
    default:
      return patchWorlds24;
  }
}

export function getAdviceTags(
  _metaStrength: [number, number, number, number, number],
  _playerMasteries: [number, number, number, number, number],
  _opponentMasteries: [number, number, number, number, number]
): { player: ChampionAdvice; opp: ChampionAdvice } {
  return {
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
  };
  // return {
  //   player: {
  //     top: metaStrength[RoleIndex.TOP] < TierValue.C || playerMasteries[RoleIndex.TOP] < TierValue.D ? ['Not Recommended'] : [],
  //     jungle: metaStrength[RoleIndex.JUNGLE] < TierValue.C || playerMasteries[RoleIndex.JUNGLE] < TierValue.D ? ['Not Recommended'] : [],
  //     mid: metaStrength[RoleIndex.MID] < TierValue.C || playerMasteries[RoleIndex.MID] < TierValue.D ? ['Not Recommended'] : [],
  //     adc: metaStrength[RoleIndex.ADC] < TierValue.C || playerMasteries[RoleIndex.ADC] < TierValue.D ? ['Not Recommended'] : [],
  //     support: metaStrength[RoleIndex.SUPPORT] < TierValue.C || playerMasteries[RoleIndex.SUPPORT] < TierValue.D ? ['Not Recommended'] : [],
  //   },
  //   opp: {
  //     top: metaStrength[RoleIndex.TOP] < TierValue.C || opponentMasteries[RoleIndex.TOP] < TierValue.D ? ['Not Recommended'] : [],
  //     jungle: metaStrength[RoleIndex.JUNGLE] < TierValue.C || opponentMasteries[RoleIndex.JUNGLE] < TierValue.D ? ['Not Recommended'] : [],
  //     mid: metaStrength[RoleIndex.MID] < TierValue.C || opponentMasteries[RoleIndex.MID] < TierValue.D ? ['Not Recommended'] : [],
  //     adc: metaStrength[RoleIndex.ADC] < TierValue.C || opponentMasteries[RoleIndex.ADC] < TierValue.D ? ['Not Recommended'] : [],
  //     support:
  //       metaStrength[RoleIndex.SUPPORT] < TierValue.C || opponentMasteries[RoleIndex.SUPPORT] < TierValue.D ? ['Not Recommended'] : [],
  //   },
  // };
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
      const playerMastery = getAllMasteries(c, playerMasteries);
      const opponentMastery = getAllMasteries(c, opponentMasteries);
      return {
        ...c,
        roles: AllRoles.filter(r => {
          return metaStrength[AllRoles.indexOf(r)] > TierValue.F;
        }),
        metaStrength,
        playerMastery,
        opponentMastery,
        currentSynergy: {
          player: {
            team: 0,
            individual: 0,
          },
          opp: {
            team: 0,
            individual: 0,
          },
        },
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
 * @param {DifficultyLevel} difficulty - The difficulty level of the draft (easy, medium, hard).
 * @return {TierListRankings} The TierListRankings object with champion slices for each tier (s, a, b, c, d).
 */
function getChampionMasteryBasedOnDiff(allChamps: number[], difficulty: DifficultyLevel): TierListRankings {
  // s tier = ++
  // a/b tier = +
  // c tier = +-
  // d tier = -
  // f tier = --
  const diffModifiers = { easy: -1, medium: 0, hard: 1 };
  const champsPerTier = Math.floor(allChamps.length / 5);
  const randomChamps = shuffle(allChamps);
  const sIndex = champsPerTier + diffModifiers[difficulty];
  const aIndex = sIndex + champsPerTier + diffModifiers[difficulty];
  const bIndex = aIndex + champsPerTier;
  const cIndex = bIndex + champsPerTier - diffModifiers[difficulty];
  const dIndex = cIndex + champsPerTier - diffModifiers[difficulty];
  return {
    s: randomChamps.slice(0, sIndex),
    a: randomChamps.slice(sIndex, aIndex),
    b: randomChamps.slice(aIndex, bIndex),
    c: randomChamps.slice(bIndex, cIndex),
    d: randomChamps.slice(cIndex, dIndex),
  };
}

/**
 * Generates a list of draft players with randomly assigned champion masteries based on the provided patch tier list and difficulty level.
 *
 * @param {PatchData} patchTierList - An object containing the patch tier list for each role.
 * @param {DifficultyLevel} [difficulty='medium'] - The difficulty level for generating the champion masteries. Defaults to 'medium'.
 * @return {DraftPlayer[]} An array of draft players with their main role and randomly assigned champion masteries.
 */
export function getRandomMasteries({ patchTierList }: PatchData, difficulty: DifficultyLevel = 'medium'): DraftPlayer[] {
  const playerMasteries: DraftPlayer[] = [];

  for (const role in patchTierList) {
    if (Object.prototype.hasOwnProperty.call(patchTierList, role)) {
      // const allChamps = patchTierList[role as keyof AllRolesTierList];
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

export const sortRoles = (a?: Role, b?: Role) => {
  if (!a || !b) {
    return 0;
  }
  return AllRoles.indexOf(a) - AllRoles.indexOf(b);
};
