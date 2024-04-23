import { Role, GameState } from '../player/player.model';

export interface Champion {
  id: number;
  name: string;
  roles: Role[];
  gameStateStrength: GameState;
  img: string;
  dmgType: 'ad' | 'ap' | 'mix';
  archetypes: Archetype[];
}

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
