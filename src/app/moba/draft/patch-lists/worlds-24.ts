import { AllRolesTierList, PatchData } from '../draft/draft.model';

// Patch 14.18
export const Worlds24TierList: AllRolesTierList = {
  // top: [3, 4, 4, 11, 10] | sumTotal: 32
  top: {
    s: [4, 155, 2],
    a: [1, 7, 60, 79],
    b: [45, 58, 74, 127],
    c: [6, 8, 28, 47, 54, 66, 62, 80, 76, 123, 70],
    d: [52, 46, 129, 3, 120, 115, 136, 156, 114, 0],
  },
  // jungle: [1, 5, 6, 12, 1] | sumTotal: 25
  jungle: {
    s: [133],
    a: [8, 9, 13, 43, 61],
    b: [73, 11, 55, 49, 10, 64],
    c: [42, 48, 138, 151, 108, 142, 72, 14, 130, 143, 109, 44],
    d: [131],
  },
  // mid: [2, 5, 5, 18, 1] | sumTotal: 31
  mid: {
    s: [60, 155],
    a: [15, 77, 50, 86, 28],
    b: [21, 22, 90, 20, 119],
    c: [33, 7, 52, 16, 62, 66, 76, 27, 19, 18, 98, 51, 88, 125, 81, 78, 5, 29],
    d: [156],
  },
  // adc: [1, 6, 7, 4, 0] | sumTotal: 18
  adc: {
    s: [25],
    a: [59, 34, 24, 33, 30, 111],
    b: [94, 23, 27, 35, 32, 98, 29],
    c: [21, 96, 100, 28],
    d: [],
  },
  support: {
    // support: [2, 4, 6, 11, 0] | sumTotal: 23
    s: [12, 37],
    a: [102, 40, 63, 38],
    b: [11, 41, 101, 65, 98, 8],
    c: [25, 133, 20, 138, 26, 66, 106, 107, 117, 17, 57],
    d: [],
  },
};

export const patchWorlds24: PatchData = {
  name: 'Worlds 2024',
  version: 14.18,
  excludedChamps: [],
  patchTierList: Worlds24TierList,
  description: 'Yone/Aurora Engage Meta',
  disabled: false,
};
