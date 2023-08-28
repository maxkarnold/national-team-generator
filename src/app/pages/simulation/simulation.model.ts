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

export type EventEmoji = '⚽' | '🟨' | '🟥' | '🟨🟥';

export interface Tournament32 {
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
    roundOf16: [GroupTeam, GroupTeam, Match][];
    quarterFinals: [GroupTeam, GroupTeam, Match][];
    semiFinals: [GroupTeam, GroupTeam, Match][];
    finals: [GroupTeam, GroupTeam, Match][];
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
  value: string;
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
