import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import {
  defaultOpponentMasteries,
  defaultPlayerMasteries,
  defaultPlayers,
  DifficultyLevel,
  DraftChampion,
  DraftPlayer,
  emptyDraftBans,
  emptyDraftPicks,
  PatchData,
} from './draft.model';
import * as championsJson from 'assets/json/moba/champions.json';
import { Champion } from '../../champion/champion.model';
import { getRandomMasteries, getDraftChampions } from './draft.utils';
import { Role } from '../../player-draft/player/player.model';

@Injectable({
  providedIn: 'root',
})
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

  availableChampions: Signal<DraftChampion[]> = computed(() => {
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampionsIds = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps].map(c => c.id);
    return this.draftChampions().filter(c => !selectedChampionsIds.includes(c.id));
  });
  constructor() {}

  initiateMasteries(patchData: PatchData, useRandomTeam: boolean, difficulty: DifficultyLevel, userIsRedSide: boolean) {
    const playerMasteries: DraftPlayer[] = useRandomTeam ? getRandomMasteries(patchData) : [...defaultPlayerMasteries];
    const opponentMasteries: DraftPlayer[] = useRandomTeam ? getRandomMasteries(patchData, difficulty) : [...defaultOpponentMasteries];

    this.draftChampions.set(getDraftChampions(this.champions, patchData, playerMasteries, opponentMasteries));

    this.blueSideMasteries = userIsRedSide ? opponentMasteries : playerMasteries;
    this.redSideMasteries = userIsRedSide ? playerMasteries : opponentMasteries;
    const filteredChampions = this.draftChampions();

    for (const player of this.blueSideMasteries) {
      this.getTopChampsForEachRole(filteredChampions, player, true);
    }

    for (const player of this.redSideMasteries) {
      this.getTopChampsForEachRole(filteredChampions, player, false);
    }
  }

  resetDraft() {
    this.draftChampions.set([]);
    this.blueSidePlayers = {
      top: [],
      jungle: [],
      mid: [],
      adc: [],
      support: [],
    };
    this.redSidePlayers = {
      top: [],
      jungle: [],
      mid: [],
      adc: [],
      support: [],
    };
    this.redSideBans.set([...emptyDraftBans]);
    this.blueSideBans.set([...emptyDraftBans]);
    this.redSideChamps.set([...emptyDraftPicks]);
    this.blueSideChamps.set([...emptyDraftPicks]);
  }

  getTopChampsForEachRole(filteredChampions: DraftChampion[], player: DraftPlayer, isBlueSide: boolean) {
    const role = player.mainRole;
    if (!role) {
      return;
    }
    const champs = Array.from(
      filteredChampions
        .filter(c => c.roles.includes(role as Role) && player.championMastery?.s.includes(c.id))
        .concat(...filteredChampions.filter(c => c.roles.includes(role as Role) && player.championMastery?.a.includes(c.id)))
    );
    if (isBlueSide) {
      this.blueSidePlayers[role] = champs;
    } else {
      this.redSidePlayers[role] = champs;
    }
  }

  getChampionFromId(id: number | undefined) {
    const champion = this.draftChampions().find(c => c.id === id);
    return champion;
  }
}