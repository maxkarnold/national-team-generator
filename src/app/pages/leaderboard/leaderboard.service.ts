import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface LeaderboardItem {
  time: string;
  tournament: {
    winner: string;
    winnerRank: number;
    worst: string;
    worstRank: number;
    second: string;
    third: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private snackbar: MatSnackBar) {}

  fetchLocalStorage(): LeaderboardItem[] | null {
    const item = localStorage.getItem('tournamentSubmitted24Hours');
    return item ? JSON.parse(item) : null;
  }

  saveLocalStorage(id: string, arr: LeaderboardItem[]) {
    const item = JSON.stringify(arr);
    localStorage.setItem(id, item);
  }

  fetchTournamentLeaderboards() {
    const personalLeaderboards = this.fetchPersonalLeaderboards();
    const worldLeaderboards = this.fetchWorldLeaderboards();
    return {
      worldLeaderboards,
      personalLeaderboards,
    };
  }

  fetchPersonalLeaderboards() {
    const localItems = this.fetchLocalStorage();
    return localItems?.slice(0, 10) || null;
  }

  fetchWorldLeaderboards() {
    return null;
  }
}