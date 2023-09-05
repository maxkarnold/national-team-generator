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

export interface TransferOption {
  club: Club;
  transferType: 'loan' | 'transfer';
  transferFee: number;
  wage: number;
  playingTime: PlayingTime;
}

export interface Season {
  year: string;
  age: number;
  team: Club;
  info: string;
  appearances: number;
  goals: number;
  assists: number;
  avgRating: number;
  wage: number;
  playTime: PlayingTime;
}

export interface CareerStats {
  currentSeason: string;
  currentSeasonIndex: number;
  seasonApps: number;
  seasonGoals: number;
  seasonAssists: number;
  seasonRating: number;
  leagueDifficulty: LeagueDifficulty;
  age: number;
  currentAbility: number;
  potentialAbility: number;
  currentClub?: Club;
  currentPlayTime: PlayingTime;
  currentWage: number;
}
