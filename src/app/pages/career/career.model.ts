import { Club } from 'app/models/club.model';
import { Nation } from 'app/models/nation.model';

export type PlayingTime =
  | 'breakthrough prospect'
  | 'fringe player'
  | 'impact sub'
  | 'squad player'
  | 'regular starter'
  | 'important player'
  | 'star player';

export type LeagueDifficulty = 'easy' | 'mediumEasy' | 'medium' | 'mediumHard' | 'hard';

export type TransferType = 'loan' | 'transfer' | 'stay' | 'transfer/loan' | 're-sign' | 'sign';

export interface ClubStats extends Club {
  seasonId: number;
  clubApps: number;
  clubGoals: number;
  clubAssists: number;
  aggRating: number;
  isFirstClub: boolean;
  totalSeasons: number;
  currentClubStreak: number;
}

export interface TransferOption {
  club: Club;
  transferType: TransferType;
  transferFee: number;
  wage: number;
  playingTime: PlayingTime;
  parentClub?: TransferOption;
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
  appearances: number;
  goals: number;
  assists: number;
  avgRating: number;
  aggRating: number;
  leagueDifficulty: LeagueDifficulty;
  currentAbility: number;
  potentialAbility: number;
  currentClub?: TransferOption;
}

export interface CareerOverview {
  seasons: string;
  yearsActive: number;
  totalApps: number;
  totalGoals: number;
  totalAssists: number;
  avgRating: string;
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
