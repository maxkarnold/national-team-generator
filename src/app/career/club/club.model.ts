import { Club } from 'app/models/club.model';
import { CompetitionStats } from '../career.model';
import { PlayingTime } from '../player/player.model';

export interface ClubStats extends Club {
  seasonId: number;
  clubStats: CompetitionStats;
  isFirstClub: boolean;
  totalSeasons: number;
  currentClubStreak: number;
  previousStandings: {
    league: number;
    cup: number;
    continental: number;
  };
}

export interface TransferOption {
  club: ClubStats;
  transferType: TransferType;
  transferFee: number;
  wage: number;
  playingTime: PlayingTime;
  parentClub?: TransferOption;
}

export type LeagueDifficulty = 'easy' | 'mediumEasy' | 'medium' | 'mediumHard' | 'hard';

export type TransferType = 'loan' | 'transfer' | 'stay' | 'transfer/loan' | 're-sign' | 'sign';
