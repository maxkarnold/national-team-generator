import { AllRolesTierList, DifficultyLevel } from '../draft/draft.model';
import { Role } from '../player/player.model';

export interface Champion {
  id: number;
  name: string;
  releaseYear: number;
  masteryDifficulty: DifficultyLevel;
  roles: Role[];
  gameStateAttributes: GameStateAttributes;
  img: string;
  dmgType: DamageType;
  attributes: TypeAttributes;
  // Use champion ids for synergies and counters
  synergies: AllRolesTierList;
  counters: AllRolesTierList;
}

export interface GameStateAttributes {
  early: number;
  mid: number;
  late: number;
}

export interface TypeAttributes {
  mobility: {
    engage: boolean;
    reposition: boolean;
  };
  dmg: {
    aoe: boolean;
    burst: boolean;
    singleTarget: boolean;
    skirmish: boolean;
    dps: boolean;
    poke: boolean;
    siege: boolean;
    waveClear: boolean;
    splitPush: boolean;
  };
  crowdControl: {
    impact: boolean;
    aoe: boolean;
    singleTarget: boolean;
    ranged: boolean;
  };
  defense: {
    mitigation: boolean;
    sustain: boolean;
  };
  support: {
    peel: boolean;
    utility: boolean;
    zoneControl: boolean;
  };
}

export type DamageType = 'high ad' | 'high ap' | 'high mix' | 'low ad' | 'low ap' | 'low mix' | 'utility';

export type Archetype =
  | 'bruiser'
  | 'tank'
  | 'mage'
  | 'assassin'
  | 'enchanter'
  | 'fighter'
  | 'crit-marksman'
  | 'lethality-marksman'
  | 'terrainAbuser'
  | 'split-pusher'
  | 'immobile'
  | 'mobile'
  | 'lane-bully'
  | 'aoe'
  | 'duelist';

export type CompRole = 'hard-engage' | 'engage' | 'poke' | 'isolator' | 'anti-engage' | 'team-fight-burst' | 'team-fight-sustain' | 'carry';
