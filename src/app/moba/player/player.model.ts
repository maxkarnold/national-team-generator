import { Nation } from 'app/models/nation.model';
import { Champion } from '../champion/champion.model';

export interface Player {
  id: number;
  age: number;
  gamerTag: GamerTag;
  mainRole: Role;
  offRoles: Role[];
  gameStateStrength: GameState;
  playStyle: PlayStyle;
  nationality: Nation;
  currentRoleRating: number;
  attributes: MobaAttributes;
  champMains: Champion[];
  currentRole?: Role;
}

export interface MobaAttributes {
  mechanics: MechanicAttributes;
  intangible: IntangibleAttributes;
  macro: MacroAttributes;
}

export interface MechanicAttributes {
  farming: number;
  apm: number;
  dueling: number;
  team_fighting: number;
}

export interface IntangibleAttributes {
  flexibility: number;
  winning: number;
  composure: number;
  consistency: number;
  in_game_leader: number;
  game_knowledge: number;
}

export interface MacroAttributes {
  pathing: number;
  vision_control: number;
  map_positioning: number;
  neutral_control: number;
}

export interface GamerTag {
  id: number;
  name: string;
  nationality: string;
}

export const rolePriority: { [key: string]: number } = {
  top: 1,
  jungle: 2,
  mid: 3,
  adc: 4,
  support: 5,
};

export const sortByMainRole = (players: Player[]): Player[] => {
  return players.sort((a, b) => {
    const aRolePriority = rolePriority[a.mainRole] || Infinity;
    const bRolePriority = rolePriority[b.mainRole] || Infinity;

    return aRolePriority - bRolePriority;
  });
};

export type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support';
export type GameState = 'early-game' | 'mid-game' | 'late-game';
export type PlayStyle =
  | 'scaler'
  | 'mechanical god'
  | 'split-pusher'
  | 'team-fighter'
  | 'closer'
  | 'flex god'
  | 'macro-player'
  | 'leader'
  | 'baron stealer'
  | 'prodigy'
  | 'journeyman'
  | 'specialist';

export const AllUniquePlayStyles: PlayStyle[] = [
  'scaler',
  'mechanical god',
  'split-pusher',
  'team-fighter',
  'flex god',
  'macro-player',
  'leader',
  'closer',
  'baron stealer',
];
export const AllRoles: Role[] = ['top', 'jungle', 'mid', 'adc', 'support'];
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && AllRoles.includes(value as Role);
}
export const AllGameStates: GameState[] = ['early-game', 'mid-game', 'late-game'];

export const positions: { name: Role; url: string }[] = [
  {
    name: 'top',
    url: 'assets/images/role_icons/top.webp',
  },
  {
    name: 'jungle',
    url: 'assets/images/role_icons/jungle.webp',
  },
  {
    name: 'mid',
    url: 'assets/images/role_icons/mid.webp',
  },
  {
    name: 'adc',
    url: 'assets/images/role_icons/adc.webp',
  },
  {
    name: 'support',
    url: 'assets/images/role_icons/support.webp',
  },
];

export const positionFilters: { name: Role | 'all'; url: string }[] = Array.from([
  {
    name: 'all',
    url: 'assets/images/role_icons/all.webp',
  },
  ...positions,
]);
