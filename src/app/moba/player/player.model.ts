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
  mainRoleRating: number;
  attributes: MobaAttributes;
  champMains: Champion[];
}

export interface MobaAttributes {
  mechanics: {
    farming: number;
    apm: number;
    dueling: number;
    team_fighting: number;
    jungling: number;
  };
  selfMental: {
    flexibility: number;
    winning: number;
    composure: number;
    consistency: number;
  };
  teamMental: {
    map_control: number;
    in_game_leader: number;
    team_composition: number;
  };
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
export type PlayStyle = 'scaler' | 'genius' | 'duelist' | 'team-fighter' | 'closer' | 'innovator' | 'macro-player' | 'leader' | 'prodigy';
export type GameState = 'early-game' | 'mid-game' | 'late-game';

export const AllPlayStyles: PlayStyle[] = ['scaler', 'genius', 'duelist', 'team-fighter', 'innovator', 'macro-player', 'leader', 'closer'];
export const AllGameStates: GameState[] = ['early-game', 'mid-game', 'late-game'];
export const AllRoles: Role[] = ['top', 'jungle', 'mid', 'adc', 'support'];

export const positions = [
  {
    name: 'top',
    url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  },
  {
    name: 'jungle',
    url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  },
  {
    name: 'mid',
    url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  },
  {
    name: 'adc',
    url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  },
  {
    name: 'support',
    url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
  },
];
