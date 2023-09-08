import { Club } from 'app/models/club.model';

export type PlayingTime =
  | 'breakthrough prospect'
  | 'fringe player'
  | 'impact sub'
  | 'squad player'
  | 'regular starter'
  | 'important player'
  | 'star player';

export type LeagueDifficulty = 'easy' | 'mediumEasy' | 'medium' | 'mediumHard' | 'hard';

export type TransferType = 'loan' | 'transfer' | 'n/a';

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
  currentTeam?: TransferOption;
}

export interface CareerOverview {
  seasons: string;
  yearsActive: number;
  longestServedClub?: ClubStats;
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
}
