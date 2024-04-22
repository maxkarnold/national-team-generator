import { Club } from 'app/models/club.model';
import { Nation } from 'app/models/nation.model';
import { ClubStats, LeagueDifficulty, TransferOption } from '../club/club.model';

export interface PlayerCareer {
  // current
  age: number;
  currentAbility: number;
  potentialAbility: number;
  playingTime: PlayingTime;
  wage: number;
  recentTransferFee: number;
  seasonStats: {
    league: CompetitionStats;
    cup: CompetitionStats;
    continental: CompetitionStats;
  };
  currentClub?: Club;
  position?: string;
  // career/total
  careerOverview: CareerOverview;
}

export type PlayingTime =
  | 'breakthrough prospect'
  | 'fringe player'
  | 'impact sub'
  | 'squad player'
  | 'regular starter'
  | 'important player'
  | 'star player';

export interface CareerOverview {
  seasons: string;
  yearsActive: number;
  totalStats: CompetitionStats;
  totalEarnings: number;
  score: CareerScore;
  peakAbility: number;
  peakClubAbility: number;
  avgLeagueAbility: number;
  totalPossibleApps: number;
  clubStats: ClubStats[];
  nationality: Nation | Partial<Nation>;
  longestServedClub?: ClubStats;
}

export interface CareerScore {
  totalScore: number;
  abilityScore: number;
  peakClubScore: number;
  avgLeagueScore: number;
  availabilityScore: number;
  goalScore: number;
}

export interface Season {
  id: number;
  year: string;
  age: number;
  stats: SeasonStats;
  leagueDifficulty: LeagueDifficulty;
  currentAbility: number;
  potentialAbility: number;
  currentClub?: TransferOption;
}

export interface SeasonStats {
  allComps: CompetitionStats;
  league: CompetitionStats;
  cup: CompetitionStats;
  continental: CompetitionStats;
}

export const defaultCompStats: CompetitionStats = {
  appearances: {
    starts: 0,
    sub: 0,
  },
  goals: 0,
  assists: 0,
  avgRating: 6.0,
  aggRating: 0,
};

export interface AppearanceStats {
  appearances: {
    starts: number;
    sub: number;
  };
}

export interface CompetitionStats extends AppearanceStats {
  goals: number;
  assists: number;
  avgRating: number;
  aggRating: number;
}
