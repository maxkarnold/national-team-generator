import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { defaultPlayers, DraftChampion, DraftPlayer, emptyDraftBans, emptyDraftPicks } from '../draft.model';
import * as championsJson from 'assets/json/moba/champions.json';
import { Champion } from '../../champion/champion.model';

@Injectable()
export class DraftService {
  champions: Champion[] = Array.from(championsJson) as Champion[];
  blueSideMasteries: DraftPlayer[] = [];
  redSideMasteries: DraftPlayer[] = [];
  blueSidePlayers: {
    [key: string]: DraftChampion[];
  } = { ...defaultPlayers };
  redSidePlayers: {
    [key: string]: DraftChampion[];
  } = { ...defaultPlayers };

  redSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  blueSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  redSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  blueSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  draftChampions: WritableSignal<DraftChampion[]> = signal([]);
  currentSideChoosing: WritableSignal<'blue' | 'red'> = signal('blue');

  availableChampions: Signal<DraftChampion[]> = computed(() => {
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampionsIds = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps].map(c => c.id);
    return this.draftChampions().filter(c => !selectedChampionsIds.includes(c.id));
  });
  constructor() {}

  setDraftData({ patchData, userIsRedSide, useAiOpponent, difficulty, useRandomTeam }: DraftMetaData) {
    this.patchData = patchData;
    this.userIsRedSide = userIsRedSide;
    this.useAiOpponent = useAiOpponent;
    this.difficulty = difficulty;
    this.useRandomTeam = useRandomTeam;
  }

  getChampionFromId(id?: number) {
    const champion = this.draftChampions().find(c => c.id === id);
    return champion;
  }
}
