import { Injectable } from '@angular/core';

export type MobaStorageKey = 'moba_region' | 'moba_player_options' | 'moba_selected_players';
export type MobaDraftKey = 'draft_metaData';

@Injectable({
  providedIn: 'root',
})
export class MobaService {
  constructor() {}

  setLocalStorage<T>(key: MobaStorageKey | MobaDraftKey, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage<T>(key: MobaStorageKey | MobaDraftKey): T | '' {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : '';
  }

  removeLocalStorage(key: MobaStorageKey | MobaDraftKey) {
    localStorage.removeItem(key);
  }
}
