import { calcWeightedSumRating, getRandomInt, getRandomIntBC, getRandomInts, isTopNumOfMap, mapRange, median } from '@shared/utils';
import {
  AllGameStates,
  AllUniquePlayStyles,
  AllRoles,
  GameState,
  GamerTag,
  MechanicAttributes,
  MobaAttributes,
  PlayStyle,
  Player,
  Role,
  IntangibleAttributes,
  MacroAttributes,
} from './player.model';
import * as gamerTags from 'assets/json/moba/gamerTags.json';
import * as champions from 'assets/json/moba/champions.json';
import { round, shuffle } from 'lodash-es';
import { Nation, allNations } from 'app/football/models/nation.model';
import { Champion } from '../champion/champion.model';
import { MobaRegion } from '../region/region.model';
import { getNameNationality, getRegionSkew } from '../region/region.utils';

function isCompatPlayStyle(map: Map<string, number>, playStyle: PlayStyle): boolean {
  // should probably be reworked so that the attributes need to be in the top # of attributes and also have a minimum number
  switch (playStyle) {
    case 'scaler':
      return isTopNumOfMap(map, 'farming', 1) || (map.get('farming') || 0) > 16;
    case 'mechanical god':
      return (map.get('apm') || 0) > 16;
    case 'split-pusher':
      return (
        (isTopNumOfMap(map, 'dueling', 4) && isTopNumOfMap(map, 'map_positioning', 4) && isTopNumOfMap(map, 'pathing', 4)) ||
        ((map.get('dueling') || 0) > 15 && (map.get('map_positioning') || 0) > 15 && (map.get('pathing') || 0) > 15)
      );
    case 'baron stealer':
      return (map.get('team_fighting') || 0) > 14 && (map.get('neutral_control') || 0) > 15 && (map.get('composure') || 0) > 15;
    case 'team-fighter':
      return (
        (isTopNumOfMap(map, 'team_fighting', 4) && isTopNumOfMap(map, 'map_positioning', 4) && isTopNumOfMap(map, 'composure', 4)) ||
        ((map.get('team_fighting') || 0) > 15 && (map.get('composure') || 0) > 14 && (map.get('map_positioning') || 0) > 14)
      );
    case 'closer':
      return (
        (isTopNumOfMap(map, 'winning', 3) && isTopNumOfMap(map, 'composure', 3)) ||
        ((map.get('winning') || 0) > 15 && (map.get('composure') || 0) > 15)
      );
    case 'flex god':
      return (map.get('flexibility') || 0) > 16 && (map.get('game_knowledge') || 0) > 15 && (map.get('consistency') || 0) > 15;
    case 'macro-player':
      return (
        (isTopNumOfMap(map, 'pathing', 6) &&
          isTopNumOfMap(map, 'map_positioning', 6) &&
          isTopNumOfMap(map, 'vision_control', 6) &&
          isTopNumOfMap(map, 'neutral_control', 6)) ||
        ((map.get('pathing') || 0) > 14 &&
          (map.get('map_positioning') || 0) > 14 &&
          (map.get('vision_control') || 0) > 14 &&
          (map.get('neutral_control') || 0) > 14)
      );
    case 'leader':
      return (
        (isTopNumOfMap(map, 'in_game_leader', 4) && isTopNumOfMap(map, 'composure', 4) && isTopNumOfMap(map, 'game_knowledge', 4)) ||
        ((map.get('in_game_leader') || 0) > 15 && (map.get('composure') || 0) > 15 && (map.get('game_knowledge') || 0) > 15)
      );

    default:
      return false;
  }
}

export function getChampMains(role: Role, gameStateStrength: GameState): Champion[] {
  const champs = Array.from(champions) as Champion[];
  const filteredChamps = [...shuffle(champs.filter(c => c.roles.includes(role)))];
  const gameStateChamps = [
    ...filteredChamps.filter(c => {
      const { early, mid, late } = c.gameStateAttributes;

      const maxValue = Math.max(early, mid, late);

      if (maxValue === early) {
        return gameStateStrength === 'early-game';
      } else if (maxValue === mid) {
        return gameStateStrength === 'mid-game';
      } else {
        return gameStateStrength === 'late-game';
      }
    }),
  ];
  return [...new Set([...gameStateChamps, ...filteredChamps])].slice(0, 3);
}

export function getAge() {
  // not fully accurate, but more interesting to get more varied ages, still ends up more as a bell curve because its choosing the median of 5 random ints
  return median(Array.from(getRandomInts(16, 30, 5)));
}

export function getName(newPlayerOptions: Player[], region: MobaRegion, selectedPlayers?: Player[]): GamerTag {
  const allNames = Array.from(gamerTags) as GamerTag[];

  const notSelectedNames = allNames.filter(tag => {
    const selectedNames = newPlayerOptions.concat(selectedPlayers || []);
    return !selectedNames.map(p => p.gamerTag).includes(tag);
  });

  const nationality = getNameNationality(region);
  const shuffledNames = shuffle(notSelectedNames);
  return shuffledNames.filter(n => n.nationality === nationality)[0] || shuffledNames[0];
}

function getRoleBasedAttributes<AttributeGroup>(
  role: Role,
  attributeGroup: 'mechanics' | 'intangible' | 'macro',
  age: number,
  regionSkew: number
): AttributeGroup {
  // maybe should make some attributes partially mutually exclusive,
  // for example: dueling and teamFighting are opposites and one should be high and one low
  // younger age is better for Mechanics
  const mechanicsSkew = mapRange(age, 29, 16, 1.5, 0.8);
  // older age is better for Mental
  const mentalSkew = mapRange(age, 16, 29, 1.5, 0.8);
  if (attributeGroup === 'intangible') {
    return {
      flexibility: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
      winning: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
      composure: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
      consistency: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
      in_game_leader: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
      game_knowledge: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
    } as AttributeGroup;
  }

  switch (role) {
    case 'top':
      if (attributeGroup === 'mechanics') {
        return {
          farming: getRandomIntBC(1, 20, 0.8 * mechanicsSkew * regionSkew),
          apm: getRandomIntBC(1, 20, 1 * mechanicsSkew * regionSkew),
          dueling: getRandomIntBC(1, 20, 0.7 * mechanicsSkew * regionSkew),
          team_fighting: getRandomIntBC(1, 20, 0.75 * mechanicsSkew * regionSkew),
        } as AttributeGroup;
      } else {
        return {
          pathing: getRandomIntBC(1, 20, 0.8 * mentalSkew * regionSkew),
          vision_control: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
          map_positioning: getRandomIntBC(1, 20, 0.7 * mentalSkew * regionSkew),
          neutral_control: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
        } as AttributeGroup;
      }
    case 'jungle':
      if (attributeGroup === 'mechanics') {
        return {
          farming: getRandomIntBC(1, 20, 0.75 * mechanicsSkew * regionSkew),
          apm: getRandomIntBC(1, 20, 1 * mechanicsSkew * regionSkew),
          dueling: getRandomIntBC(1, 20, 0.9 * mechanicsSkew * regionSkew),
          team_fighting: getRandomIntBC(1, 20, 1 * mechanicsSkew * regionSkew),
        } as AttributeGroup;
      } else {
        return {
          pathing: getRandomIntBC(1, 20, 0.8 * mentalSkew * regionSkew),
          vision_control: getRandomIntBC(1, 20, 0.8 * mentalSkew * regionSkew),
          map_positioning: getRandomIntBC(1, 20, 0.7 * mentalSkew * regionSkew),
          neutral_control: getRandomIntBC(1, 20, 0.65 * mentalSkew * regionSkew),
        } as AttributeGroup;
      }

    case 'mid':
      if (attributeGroup === 'mechanics') {
        return {
          farming: getRandomIntBC(1, 20, 0.7 * mechanicsSkew * regionSkew),
          apm: getRandomIntBC(1, 20, 0.7 * mechanicsSkew * regionSkew),
          dueling: getRandomIntBC(1, 20, 0.8 * mechanicsSkew * regionSkew),
          team_fighting: getRandomIntBC(1, 20, 0.75 * mechanicsSkew * regionSkew),
        } as AttributeGroup;
      } else {
        return {
          pathing: getRandomIntBC(1, 20, 0.75 * mentalSkew * regionSkew),
          vision_control: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
          map_positioning: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
          neutral_control: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
        } as AttributeGroup;
      }
    case 'adc':
      if (attributeGroup === 'mechanics') {
        return {
          farming: getRandomIntBC(1, 20, 0.7 * mechanicsSkew * regionSkew),
          apm: getRandomIntBC(1, 20, 0.7 * mechanicsSkew * regionSkew),
          dueling: getRandomIntBC(1, 20, 1 * mechanicsSkew * regionSkew),
          team_fighting: getRandomIntBC(1, 20, 0.8 * mechanicsSkew * regionSkew),
        } as AttributeGroup;
      } else {
        return {
          pathing: getRandomIntBC(1, 20, 0.85 * mentalSkew * regionSkew),
          vision_control: getRandomIntBC(1, 20, 1.2 * mentalSkew * regionSkew),
          map_positioning: getRandomIntBC(1, 20, 0.85 * mentalSkew * regionSkew),
          neutral_control: getRandomIntBC(1, 20, 1 * mentalSkew * regionSkew),
        } as AttributeGroup;
      }
    case 'support':
      if (attributeGroup === 'mechanics') {
        return {
          farming: getRandomIntBC(1, 20, 1.2 * mechanicsSkew * regionSkew),
          apm: getRandomIntBC(1, 20, 1 * mechanicsSkew * regionSkew),
          dueling: getRandomIntBC(1, 20, 0.9 * mechanicsSkew * regionSkew),
          team_fighting: getRandomIntBC(1, 20, 0.8 * mechanicsSkew * regionSkew),
        } as AttributeGroup;
      } else {
        return {
          pathing: getRandomIntBC(1, 20, 0.75 * mentalSkew * regionSkew),
          vision_control: getRandomIntBC(1, 20, 0.65 * mentalSkew * regionSkew),
          map_positioning: getRandomIntBC(1, 20, 0.65 * mentalSkew * regionSkew),
          neutral_control: getRandomIntBC(1, 20, 0.75 * mentalSkew * regionSkew),
        } as AttributeGroup;
      }
    default:
      throw new Error('Invalid Role');
  }
}

export function getAttributes(role: Role, age: number, regionSkew: number): MobaAttributes {
  const mechanics = getRoleBasedAttributes<MechanicAttributes>(role, 'mechanics', age, regionSkew);
  const intangible = getRoleBasedAttributes<IntangibleAttributes>(role, 'intangible', age, regionSkew);
  const macro = getRoleBasedAttributes<MacroAttributes>(role, 'macro', age, regionSkew);
  return {
    mechanics,
    intangible,
    macro,
  };
}

// OUT OF 100
export function getOverallRating({ mechanics, intangible, macro }: MobaAttributes, role: Role): number {
  // intangibles: 0.8 weight
  // 1.5+ skew: 2 weight
  // 1.2+ skew: 1.5 weight
  // 0.9+ skew: 0.8 weight
  // 0.8- skew: 0.75 weight
  // support's farming attribute measure the ability for the support to control the early game and help their adc farm
  const primaryAttributes = [];
  const secondaryAttributes = [];
  const tertiaryAttributes = [];
  switch (role) {
    case 'top':
      tertiaryAttributes.push(
        intangible.composure,
        intangible.consistency,
        intangible.flexibility,
        intangible.in_game_leader,
        intangible.game_knowledge,
        intangible.winning,
        macro.neutral_control,
        macro.vision_control,
        mechanics.apm
      );
      primaryAttributes.push(mechanics.dueling, macro.map_positioning);
      secondaryAttributes.push(mechanics.farming, mechanics.team_fighting, macro.pathing);
      break;
    case 'jungle':
      tertiaryAttributes.push(
        intangible.composure,
        intangible.consistency,
        intangible.flexibility,
        intangible.in_game_leader,
        intangible.game_knowledge,
        intangible.winning,
        mechanics.apm,
        mechanics.dueling,
        mechanics.team_fighting
      );
      primaryAttributes.push(macro.map_positioning, macro.neutral_control);
      secondaryAttributes.push(macro.pathing, macro.vision_control, mechanics.farming);
      break;
    case 'mid':
      tertiaryAttributes.push(
        intangible.composure,
        intangible.consistency,
        intangible.flexibility,
        intangible.in_game_leader,
        intangible.game_knowledge,
        intangible.winning,
        macro.vision_control,
        macro.map_positioning,
        macro.neutral_control
      );
      primaryAttributes.push(mechanics.apm, mechanics.farming);
      secondaryAttributes.push(mechanics.dueling, mechanics.team_fighting, macro.pathing);
      break;
    case 'adc':
      tertiaryAttributes.push(
        intangible.composure,
        intangible.consistency,
        intangible.flexibility,
        intangible.in_game_leader,
        intangible.game_knowledge,
        intangible.winning,
        macro.vision_control,
        mechanics.dueling,
        macro.neutral_control
      );
      primaryAttributes.push(mechanics.apm, mechanics.farming);
      secondaryAttributes.push(mechanics.team_fighting, macro.pathing, macro.map_positioning);
      break;
    case 'support':
      tertiaryAttributes.push(
        intangible.composure,
        intangible.consistency,
        intangible.flexibility,
        intangible.in_game_leader,
        intangible.game_knowledge,
        intangible.winning,
        mechanics.dueling,
        mechanics.apm,
        mechanics.farming
      );
      primaryAttributes.push(macro.vision_control, macro.map_positioning);
      secondaryAttributes.push(mechanics.team_fighting, macro.pathing, macro.neutral_control);
      break;
    default:
      break;
  }
  return round(
    ((calcWeightedSumRating(primaryAttributes, 2) +
      calcWeightedSumRating(secondaryAttributes, 1.5) +
      calcWeightedSumRating(tertiaryAttributes, 0.8)) /
      14) *
      5,
    2
  );
}

export function getNationality(gamerTag: GamerTag): Nation {
  return allNations().filter(n => n.abbreviation === gamerTag.nationality)[0];
}

export function getGameStateStrength(playStyle: PlayStyle): GameState {
  if (playStyle === 'scaler') {
    return ['mid-game', 'late-game'][getRandomInt(0, 1)] as GameState;
  }

  return AllGameStates[getRandomInt(0, 2)];
}

export function sortMapAttributes(attributes: MobaAttributes) {
  const map: Map<string, number> = new Map([
    ...Object.entries(attributes.mechanics),
    ...Object.entries(attributes.intangible),
    ...Object.entries(attributes.macro),
  ]);

  return new Map([...map].sort((a, b) => b[1] - a[1]));
}

export function getPlayStyle(attributes: MobaAttributes, age: number): PlayStyle {
  const sortedMap = sortMapAttributes(attributes);
  const availablePlayStyles: PlayStyle[] = [];

  for (const playStyle of AllUniquePlayStyles) {
    if (isCompatPlayStyle(sortedMap, playStyle)) {
      availablePlayStyles.push(playStyle);
    }
  }
  if (availablePlayStyles.length < 1) {
    if (age < 19) {
      return 'prodigy';
    } else if (age > 24) {
      return 'journeyman';
    } else {
      return 'specialist';
    }
  }
  return shuffle(availablePlayStyles)[0];
}

export function getPlayerOptions(region: MobaRegion, selectedPlayers?: Player[]): Player[] {
  const players = [];
  const roles = [...AllRoles];

  for (let i = 0; i < 5; i++) {
    const gamerTag = getName(players, region, selectedPlayers);
    const regionSkew = getRegionSkew(region);
    const mainRole = roles[i];
    const age = getAge();
    const attributes = getAttributes(mainRole, age, regionSkew);
    const playStyle = getPlayStyle(attributes, age);
    const gameStateStrength = getGameStateStrength(playStyle);
    const player: Player = {
      id: getRandomInt(0, 1000),
      age,
      gamerTag,
      mainRole,
      offRoles: [],
      gameStateStrength,
      playStyle,
      nationality: getNationality(gamerTag),
      currentRoleRating: getOverallRating(attributes, mainRole),
      attributes,
      champMains: getChampMains(mainRole, gameStateStrength),
    };
    console.log(player);
    players.push(player);
  }

  return players;
}

export function getCurrentRoles(players: Player[]): Player[] {
  const updatedPlayers: Player[] = [];

  for (let i = 0; i < players.length; i++) {
    const player = { ...players[i] };
    const currentRoleRating = getOverallRating(player.attributes, AllRoles[i]);
    console.log(currentRoleRating);
    updatedPlayers.push({
      ...players[i],
      currentRole: AllRoles[i],
      currentRoleRating: AllRoles[i] === player.mainRole ? currentRoleRating : currentRoleRating - 10,
    });
  }
  return updatedPlayers;
}
