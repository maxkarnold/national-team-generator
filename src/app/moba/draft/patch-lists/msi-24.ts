import { AllRolesTierList, PatchData } from '../draft.model';

// JUDGING META STRENGTH
// Z/S+ Tier: champs that are so strong they deserve their own tier, not every role will have champs in this tier
// S Tier: champs commonly banned in first phase, probably a 75%+ presence in games, strong first pick
// usually in first phase of bans and a good B1/R1/R2 pick
// A Tier: champs commonly banned in second phase, typically a stable champ, can be a champ that has emerged as a strong counter to s/a tier picks or has good synergy with meta picks
// can be banned in first phase if someone is very proficient on the champion. might not always be the best blind pick, but can be blind picked
// B Tier: these champs are playable, can be good siutational picks and could be just in this tier because they can counter a top meta pick
// typically only banned to protect a bad matchup for a top pick, fairly often picked because other champs are banned, can be a good R3 blind pick
// C Tier: champs that are very situational, will have obvious weakpoints, not usually banned but could be in certain situations.
// this champ is not going to be banned unless, its been used for a specific strategy for the opposing team. Niche pick that can be chosen in the right counter or situation.
// These are a lot of surprise picks in the draft, or could be flexes from other roles.
// D Tier: champs that can technically play the role, but are either too easily countered or just too weak in their current state to be playable.
// These champs have been played in the meta, but are not strong enough to blind pick and will only work in the perfect scenario.

// Patch 14.8
export const MSI24TierList: AllRolesTierList = {
  // top: [3, 5, 16, 14, 5] | sumTotal: 43
  top: {
    s: [1, 133, 5], // 3
    a: [2, 4, 44, 45, 8], // 5
    b: [3, 122, 79, 80, 76, 127, 129, 46, 0, 7, 70, 6, 47, 54, 56, 62], // 16
    c: [22, 74, 124, 89, 17, 126, 128, 58, 132, 81, 43, 28, 136, 60], // 14
    d: [120, 123, 114, 115, 23], // 5
  },
  // jungle: [2, 4, 15, 13, 1] | sumTotal: 35
  jungle: {
    s: [9, 133], // 2
    a: [10, 8, 11, 43], // 4
    b: [48, 42, 14, 0, 55, 64, 56, 68, 4, 49, 61, 72, 83, 67, 13], // 15
    c: [82, 73, 75, 18, 6, 131, 74, 2, 130, 44, 84, 85, 58], // 13
    d: [12], // 1
  },
  // mid: [2, 6, 9, 23, 2] | sumTotal: 42
  mid: {
    s: [16, 18],
    a: [15, 19, 21, 50, 51, 52],
    b: [20, 22, 86, 60, 77, 76, 17, 5, 90],
    c: [87, 88, 71, 59, 93, 118, 73, 78, 74, 66, 119, 125, 121, 135, 92, 91, 137, 89, 70, 81, 27, 28, 34],
    d: [134, 44],
  },
  // adc: [3, 1, 9, 15, 0] | sumTotal: 28
  adc: {
    s: [24, 26, 23],
    a: [27, 32],
    b: [31, 33, 94, 35, 34, 28, 30, 29],
    c: [25, 96, 19, 69, 111, 97, 95, 98, 99, 21, 5, 100, 54, 62, 59],
    d: [],
  },
  support: {
    // support: [2, 2, 16, 17, 3] | sumTotal: 40
    s: [25, 36],
    a: [38, 37],
    b: [40, 101, 65, 63, 45, 17, 102, 57, 11, 39, 41, 20, 46, 12, 26, 53],
    c: [66, 104, 19, 105, 24, 107, 8, 106, 2, 43, 98, 110, 116, 117, 103, 112, 108],
    d: [109, 113, 71],
  },
};

export const patchMSI24: PatchData = {
  name: 'MSI 2024',
  version: 14.8,
  excludedChamps: [133],
  patchTierList: MSI24TierList,
  description: 'Lane Swap Meta',
  disabled: true,
};
