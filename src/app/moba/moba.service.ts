import { Injectable } from '@angular/core';

export type MobaStorageKey = 'moba_region' | 'moba_player_options' | 'moba_selected_players';

@Injectable({
  providedIn: 'root',
})
export class MobaService {
  constructor() {}

  setLocalStorage<T>(key: MobaStorageKey, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage<T>(key: MobaStorageKey): T | '' {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : '';
  }

  removeLocalStorage(key: MobaStorageKey) {
    localStorage.removeItem(key);
  }
}
