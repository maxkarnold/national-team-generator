import { Champion } from '../champion/champion.model';
import { DraftChampion, PatchChampions, blueSideBans, blueSidePicks, redSideBans, redSidePicks } from './draft.model';

const patchMSI24: PatchChampions = {
  s: [],
  a: [],
  b: [],
  c: [],
  d: [],
};

function getMetaStrength(champion: Champion, patchVersion: string): number {
  if (patchVersion === 'MSI24') {
    const { id } = champion;
    const tierValues: { [key: string]: number } = { s: 20, a: 16, b: 12, c: 8, d: 4 };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tierFound = Object.entries(patchMSI24).find(([_, championIds]: [string, number[]]) => championIds.includes(id));

    if (tierFound) {
      const [tier] = tierFound;
      return tierValues[tier];
    }

    // If the champion's ID is not found in the patchMSI24 object, return a default value
    return 0;
  } else {
    return 0;
  }
}

export function getDraftChampions(champions: Champion[], patchVersion: string): DraftChampion[] {
  return champions.map(c => {
    return {
      ...c,
      metaStrength: getMetaStrength(c, patchVersion),
      playerMastery: 0,
      opponentMastery: 0,
      currentSynergy: 0,
      currentCounter: 0,
      currentScore: 0,
    };
  });
}

export function getChampScoreRating(champ: DraftChampion, draftPhase: string, currentDraftRound: number, isRedSide: boolean): number {
  if (draftPhase === 'First Ban Phase' || draftPhase === 'Second Ban Phase') {
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
