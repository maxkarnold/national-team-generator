import { GroupTeam } from 'app/models/nation.model';

export interface Match {
  goalsFor: number;
  goalsAg: number;
  isEtWin: boolean;
  isPenaltyWin: boolean;
  winner: GroupTeam;
  loser: GroupTeam;
  score: string;
  eventTimes: {
    winner: MatchEvent[];
    loser: MatchEvent[];
  };
}

export interface MatchEvent {
  time: string;
  emoji: EventEmoji;
  type?: string;
}

export type EventEmoji = '⚽' | '🟨' | '🟥' | '🟨🟥' | '🚑';
export type KnockoutRound = [GroupTeam, GroupTeam, Match][];

export interface Tournament {
  availableRegions?: Region[];
  hostNations?: GroupTeam[];
  allTeams?: {
    rankings: GroupTeam[];
    attRankings: GroupTeam[];
    midRankings: GroupTeam[];
    defRankings: GroupTeam[];
  };
  groups?: GroupTeam[][];
  groupWinners?: GroupTeam[];
  bracket?: {
    roundOf32?: KnockoutRound;
    roundOf16: KnockoutRound;
    quarterFinals: KnockoutRound;
    semiFinals: KnockoutRound;
    finals: KnockoutRound;
  };
  awards?: [
    first: GroupTeam,
    second: GroupTeam,
    third: GroupTeam,
    underPerformer: GroupTeam,
    overPerformer: GroupTeam,
    uefa?: GroupTeam,
    afc?: GroupTeam,
    caf?: GroupTeam,
    concacaf?: GroupTeam,
    conmebol?: GroupTeam,
    ofc?: GroupTeam
  ];
}

export interface Region {
  label: string;
  value: RegionName;
  numOfTeams: number;
  qualifiers: {
    auto: number;
    extra: number;
  };
}

export interface TeamsByRegion {
  uefa?: GroupTeam[];
  afc?: GroupTeam[];
  caf?: GroupTeam[];
  concacaf?: GroupTeam[];
  conmebol?: GroupTeam[];
  ofc?: GroupTeam[];
}

// eslint-disable-next-line no-shadow
export enum RegionName {
  uefa = 'uefa',
  afc = 'afc',
  caf = 'caf',
  concacaf = 'concacaf',
  conmebol = 'conmebol',
  ofc = 'ofc',
}
