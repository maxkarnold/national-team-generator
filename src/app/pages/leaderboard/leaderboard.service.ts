import { Injectable } from '@angular/core';
import { Person } from 'app/football/models/player.model';

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
  constructor() {}

  fetchLocalStorage(): LeaderboardItem[] | null {
    const item = localStorage.getItem('tournamentSubmitted24Hours');
    return item ? JSON.parse(item) : null;
  }

  saveLocalStorage(id: string, arr: (LeaderboardItem | Person)[]) {
    const item = JSON.stringify(arr);
    localStorage.setItem(id, item);
  }

  fetchLocalNames(): Person[] | null {
    const item = localStorage.getItem('names');
    return item ? JSON.parse(item) : null;
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
