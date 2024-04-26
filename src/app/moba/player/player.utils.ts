import { calcWeightedSumRating, getRandomInt, getRandomIntBC, isTopNumOfMap } from '@shared/utils';
import { AllGameStates, AllPlayStyles, AllRoles, GameState, GamerTag, MobaAttributes, PlayStyle, Player, Role } from './player.model';
import * as gamerTags from 'assets/json/moba/gamerTags.json';
import * as champions from 'assets/json/moba/champions.json';
import { round, shuffle } from 'lodash-es';
import { Nation, allNations } from 'app/models/nation.model';
import { Champion } from '../champion/champion.model';
import { MobaRegion } from '../team/team.model';

function isCompatPlayStyle(map: Map<string, number>, playStyle: PlayStyle): boolean {
  switch (playStyle) {
    case 'scaler':
      return isTopNumOfMap(map, 'farming', 3) || (map.get('farming') || 0) > 15;
    case 'genius':
      return isTopNumOfMap(map, 'apm', 3) || (map.get('apm') || 0) > 15;
    case 'duelist':
      return isTopNumOfMap(map, 'dueling', 3) || (map.get('dueling') || 0) > 15;
    case 'closer':
      return (
        isTopNumOfMap(map, 'winning', 3) ||
        isTopNumOfMap(map, 'composure', 3) ||
        ((map.get('winning') || 0) > 15 && (map.get('composure') || 0) > 15)
      );
    case 'innovator':
      return (
        isTopNumOfMap(map, 'flexibility', 3) ||
        isTopNumOfMap(map, 'team_composition', 3) ||
        ((map.get('flexibility') || 0) > 16 && (map.get('team_composition') || 0) > 15)
      );
    case 'macro-player':
      return isTopNumOfMap(map, 'map_control', 3) || (map.get('map_control') || 0) > 15;
    case 'leader':
      return isTopNumOfMap(map, 'in_game_leader', 3) || (map.get('in_game_leader') || 0) > 15;
    case 'team-fighter':
      return isTopNumOfMap(map, 'team_fighting', 3) || (map.get('team_fighting') || 0) > 15;
    default:
      return false;
  }
}

export function getChampMains(role: Role, gameStateStrength: GameState): Champion[] {
  const champs = Array.from(champions) as Champion[];
  const filteredChamps = [...shuffle(champs.filter(c => c.roles.includes(role)))];
  const gameStateChamps = [...filteredChamps.filter(c => c.gameStateStrength === gameStateStrength)];
  return [...new Set([...gameStateChamps, ...filteredChamps])].slice(0, 3);
}

export function getAge() {
  return getRandomIntBC(16, 29, 1.25);
}

export function getNameNationality(region: MobaRegion, shuffledNames: GamerTag[]): string {
  // not an exact science, can be improved in the future
  const allNationalities = shuffledNames.map(n => n.nationality);
  switch (region.regionAbbrev) {
    case 'NA':
      if (getRandomInt(1, 10) < 5) {
        return 'usa';
      } else if (getRandomInt(1, 10) < 5) {
        return 'kor';
      } else if (getRandomInt(1, 10) < 3) {
        return shuffle(['can', 'aus'])[0];
      } else {
        return allNationalities[0];
      }
    case 'EU':
      if (getRandomInt(1, 10) < 4) {
        return shuffle(['fra', 'esp'])[0];
      } else if (getRandomInt(1, 10) < 4) {
        return shuffle(['kor', 'pol', 'cze', 'den', 'ger', 'swe'])[0];
      } else {
        return allNationalities.filter(n => !['usa'].includes(n))[0];
      }
    case 'CHN':
      if (getRandomInt(1, 10) < 9) {
        return 'chn';
      } else if (getRandomInt(1, 10) < 2) {
        return 'kor';
      } else {
        return shuffle(['tpe', 'hkg', 'sin'])[0];
      }
    // KOREAN IS DEFAULT NATIONALITY, this is for LCK as well
    default:
      return 'kor';
  }
}

export function getName(players: Player[], region: MobaRegion, selectedPlayers?: Player[]): GamerTag {
  const allNames = Array.from(gamerTags) as GamerTag[];
  const notSelectedNames = allNames.filter(
    n => !selectedPlayers?.map(p => p.gamerTag.id).includes(n.id) || !players.map(p => p.gamerTag.id).includes(n.id)
  );

  const nationality = getNameNationality(region, notSelectedNames);
  const shuffledNames = shuffle(notSelectedNames);

  return shuffledNames.filter(n => n.nationality === nationality)[0] || shuffledNames[0];
}

export function getAttributes(role: Role): MobaAttributes {
  return {
    mechanics: {
      farming: role === 'jungle' || role === 'support' ? getRandomIntBC(1, 20, 1) : getRandomIntBC(1, 20, 0.75),
      apm: getRandomIntBC(1, 20, 1),
      dueling: getRandomIntBC(1, 20, 1),
      team_fighting: role === 'jungle' || role === 'top' ? getRandomIntBC(1, 20, 1) : getRandomIntBC(1, 20, 0.75),
      jungling: role === 'jungle' ? getRandomIntBC(10, 20, 1.5) : getRandomIntBC(1, 10, 1),
    },
    selfMental: {
      flexibility: getRandomIntBC(1, 20, 1),
      winning: getRandomIntBC(1, 20, 1),
      composure: getRandomIntBC(1, 20, 1),
      consistency: getRandomIntBC(1, 20, 1),
    },
    teamMental: {
      map_control: role !== 'adc' ? getRandomIntBC(1, 20, 0.75) : getRandomIntBC(1, 20, 1),
      in_game_leader: getRandomIntBC(1, 20, 1),
      team_composition: getRandomIntBC(1, 20, 1),
    },
  };
}

// OUT OF 100
export function getOverallRating({ mechanics, selfMental, teamMental }: MobaAttributes, role: Role): number {
  switch (role) {
    case 'top':
      return (
        ((calcWeightedSumRating(
          [
            mechanics.farming,
            mechanics.dueling,
            teamMental.map_control,
            teamMental.in_game_leader,
            selfMental.flexibility,
            selfMental.consistency,
          ],
          1
        ) +
          calcWeightedSumRating(
            [mechanics.apm, mechanics.team_fighting, selfMental.composure, selfMental.winning, teamMental.team_composition],
            0.75
          ) +
          calcWeightedSumRating([mechanics.jungling], 0.25)) /
          12) *
        6
      );
    case 'jungle':
      return (
        ((calcWeightedSumRating(
          [
            mechanics.team_fighting,
            mechanics.dueling,
            teamMental.map_control,
            teamMental.in_game_leader,
            selfMental.flexibility,
            selfMental.consistency,
          ],
          0.9
        ) +
          calcWeightedSumRating(
            [mechanics.apm, mechanics.team_fighting, selfMental.composure, selfMental.winning, teamMental.team_composition],
            0.75
          ) +
          calcWeightedSumRating([mechanics.jungling], 1.25)) /
          12) *
        6
      );
    case 'mid':
      return (
        ((calcWeightedSumRating(
          [
            mechanics.team_fighting,
            mechanics.apm,
            teamMental.map_control,
            teamMental.in_game_leader,
            selfMental.flexibility,
            mechanics.dueling,
            mechanics.team_fighting,
            selfMental.consistency,
          ],
          0.9
        ) +
          calcWeightedSumRating([selfMental.composure, selfMental.winning, teamMental.team_composition], 0.75) +
          calcWeightedSumRating([mechanics.jungling], 0.25)) /
          12) *
        6
      );
    case 'adc':
      return (
        ((calcWeightedSumRating(
          [
            mechanics.team_fighting,
            mechanics.apm,
            teamMental.in_game_leader,
            mechanics.dueling,
            mechanics.team_fighting,
            selfMental.composure,
            selfMental.consistency,
          ],
          0.95
        ) +
          calcWeightedSumRating([selfMental.flexibility, teamMental.map_control, selfMental.winning, teamMental.team_composition], 0.75) +
          calcWeightedSumRating([mechanics.jungling], 0.25)) /
          12) *
        6
      );
    case 'support':
      return (
        ((calcWeightedSumRating(
          [
            selfMental.flexibility,
            mechanics.team_fighting,
            teamMental.map_control,
            teamMental.in_game_leader,
            selfMental.composure,
            selfMental.consistency,
          ],
          1.1
        ) +
          calcWeightedSumRating([mechanics.dueling, selfMental.winning, teamMental.team_composition, mechanics.apm], 0.7) +
          calcWeightedSumRating([mechanics.jungling, mechanics.farming], 0.25)) /
          12) *
        6
      );
    default:
      return 50;
  }
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
    ...Object.entries(attributes.selfMental),
    ...Object.entries(attributes.teamMental),
  ]);

  return new Map([...map].sort((a, b) => a[1] - b[1]));
}

export function getPlayStyle(attributes: MobaAttributes): PlayStyle {
  const sortedMap = sortMapAttributes(attributes);
  const availablePlayStyles: PlayStyle[] = [];

  for (const playStyle of AllPlayStyles) {
    if (isCompatPlayStyle(sortedMap, playStyle)) {
      availablePlayStyles.push(playStyle);
    }
  }
  if (availablePlayStyles.length < 1) {
    availablePlayStyles.push('prodigy');
  }
  return availablePlayStyles[getRandomInt(0, availablePlayStyles.length - 1)];
}

export function getPlayerOptions(region: MobaRegion, selectedPlayers?: Player[]): Player[] {
  const players = [];
  const roles = [...AllRoles];

  for (let i = 0; i < 5; i++) {
    const gamerTag = getName(players, region, selectedPlayers);
    const mainRole = roles[i];
    const attributes = getAttributes(mainRole);
    const playStyle = getPlayStyle(attributes);
    const gameStateStrength = getGameStateStrength(playStyle);
    const player: Player = {
      id: getRandomInt(0, 1000),
      age: getAge(),
      gamerTag,
      mainRole,
      offRoles: [],
      gameStateStrength,
      playStyle,
      nationality: getNationality(gamerTag),
      mainRoleRating: round(getOverallRating(attributes, mainRole), 2),
      attributes,
      champMains: getChampMains(mainRole, gameStateStrength),
    };

    players.push(player);
  }

  return players;
}
