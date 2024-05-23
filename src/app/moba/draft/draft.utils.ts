import { Champion } from '../champion/champion.model';
import { AllRoles, Role } from '../player/player.model';
import {
  DraftChampion,
  DraftPhase,
  DraftPlayer,
  PatchStrength,
  RankedChampions,
  blueSideBans,
  blueSidePicks,
  defaultOpponentMasteries,
  defaultPlayerMasteries,
  redSideBans,
  redSidePicks,
} from './draft.model';

// JUDGING META STRENGTH
// S Tier: champs commonly banned in first phase, probably a 75%+ presence in games, strong first pick
// A Tier: champs commonly banned in second phase, typically a stable champ, can be a champ that has emerged as a strong counter to s/a tier picks or has good synergy with meta picks
// B Tier: champ is not strong, but still able to be picked. Can only be played by masters of the champ in a good counter situation
// C Tier: champs hardly picked, chosen by players with high mastery but with a small champ pool or as a last resort
// D Tier: do not pick these champs, are so weak that will be easily countered or not counter meta champs

// TODO: need to add Vayne, Nidalee, Volibear, Lulu, Olaf, Ziggs, Yone, Ivern, Yasuo, Braum, Lillia, Blitzcrank,
// Galio, Karthus, Khazix, Kog'maw, Sion, Veigar, Kindred, Brand, Gragas, Graves, Jayce, Sylas, Swain
const patchMSI24: PatchStrength = {
  top: {
    s: [1],
    a: [2, 5, 44, 45, 46, 47, 8],
    b: [7, 4, 6],
    c: [0, 3],
    d: [17],
  },
  jungle: {
    s: [9],
    a: [10, 43, 11, 14, 42, 48, 8],
    b: [0, 4, 49],
    c: [13],
    d: [18, 12, 44, 2],
  },
  mid: {
    s: [16, 18],
    a: [15, 19, 21, 50, 51, 52],
    b: [2, 20, 22],
    c: [17, 28, 44],
    d: [],
  },
  adc: {
    s: [24, 26],
    a: [23, 27, 32],
    b: [25, 29, 30, 31, 34],
    c: [21, 28, 33, 35],
    d: [],
  },
  support: {
    s: [25, 36],
    a: [38],
    b: [37, 8, 12, 20, 11, 41, 53, 46, 40, 39, 24],
    c: [17],
    d: [19, 26],
  },
};

function getRoleMetaStrength(id: number, role: RankedChampions, tierValues: { [key: string]: number }): number {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tierFound = Object.entries(role).find(([_, championIds]: [string, number[]]) => {
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

export function getPlayerMastery(champ: Champion, playerMasteries: Partial<DraftPlayer>[]): number {
  const { id, roles } = champ;
  const tierValues: { [key: string]: number } = { s: 20, a: 16, b: 12, c: 8, d: 4 };

  const relevantPlayerMasteries = playerMasteries.filter(player => roles.includes(player.mainRole as Role));

  let maxMastery = 0;

  relevantPlayerMasteries.forEach(player => {
    const { championMastery } = player;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const championTiers = Object.entries(championMastery as RankedChampions).filter(([_, ids]: [string, number[]]) => ids.includes(id));

    championTiers.forEach(([tier]) => {
      const mastery = tierValues[tier] || 0;
      maxMastery = Math.max(maxMastery, mastery);
    });
  });

  return maxMastery;
}

export function getDraftChampions(champions: Champion[], patchVersion: string): DraftChampion[] {
  return champions.map(c => {
    return {
      ...c,
      metaStrength: getMetaStrength(c, patchVersion),
      playerMastery: getPlayerMastery(c, defaultPlayerMasteries),
      opponentMastery: getPlayerMastery(c, defaultOpponentMasteries),
      currentSynergy: 0,
      currentCounter: 0,
      currentScore: 0,
    };
  });
}

export function getChampScoreRating(champ: DraftChampion, draftPhase: DraftPhase, currentDraftRound: number, isRedSide: boolean): number {
  if (draftPhase.includes('Ban')) {
    let currentBans: number[];
    if (isRedSide) {
      currentBans = [...redSideBans];
    } else {
      currentBans = [...blueSideBans];
    }
    const isBanning = currentBans.includes(currentDraftRound);
    return isBanning ? champ.opponentMastery : champ.playerMastery;
  } else {
    let currentPicks: number[];
    if (isRedSide) {
      currentPicks = [...redSidePicks];
    } else {
      currentPicks = [...blueSidePicks];
    }
    const isPicking = currentPicks.includes(currentDraftRound);
    return isPicking ? champ.playerMastery : champ.opponentMastery;
  }
}

export function getMasterySort(draftPhase: DraftPhase, currentDraftRound: number, isRedSide: boolean): 'playerMastery' | 'opponentMastery' {
  if (draftPhase.includes('Ban')) {
    let currentBans: number[];
    if (isRedSide) {
      currentBans = [...redSideBans];
    } else {
      currentBans = [...blueSideBans];
    }
    const isBanning = currentBans.includes(currentDraftRound);
    return isBanning ? 'opponentMastery' : 'playerMastery';
  } else {
    let currentPicks: number[];
    if (isRedSide) {
      currentPicks = [...redSidePicks];
    } else {
      currentPicks = [...blueSidePicks];
    }
    const isPicking = currentPicks.includes(currentDraftRound);
    return isPicking ? 'playerMastery' : 'opponentMastery';
  }
}

function backtrack(index: number, chosen: (string | undefined)[], solutions: Set<string>, arrays: (string[] | undefined)[]): void {
  if (index === arrays.length) {
    solutions.add(chosen.filter(val => val !== undefined).join(''));
    return;
  }

  if (arrays[index] === undefined) {
    chosen.push(undefined);
    backtrack(index + 1, chosen, solutions, arrays);
    chosen.pop();
  } else {
    for (const value of arrays[index]!) {
      chosen.push(value);
      backtrack(index + 1, chosen, solutions, arrays);
      chosen.pop();
    }
  }
}

function getPossibleStrings<T>(arrays: (string[] | undefined)[]): T[] {
  const definedArrays = arrays.filter((arr): arr is string[] => arr !== undefined);
  const uniqueStrings = [...new Set(definedArrays.flat())];
  const possibleStrings: string[] = [];

  for (const str of uniqueStrings) {
    const newArrays = arrays.map(arr => (arr && arr.includes(str) ? arr : arr ? [...arr, str] : [str]));
    const solutions = new Set<string>();
    backtrack(0, [], solutions, newArrays);
    if (solutions.size > definedArrays.length) {
      possibleStrings.push(str);
    }
  }

  return possibleStrings as T[];
}

export function checkForAvailableRoles(roleMap: (Role[] | undefined)[]): Role[] {
  const undefinedCount = roleMap.filter(roleArr => !roleArr).length;
  if (undefinedCount === 5) {
    return [...AllRoles];
  }
  if (undefinedCount === 0) {
    return [];
  }
  const roles = getPossibleStrings<Role>(roleMap);
  console.log(roleMap, roles);
  return roles;
}
