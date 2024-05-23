import { Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import * as championsJson from 'assets/json/moba/champions.json';
import { Champion } from '../champion/champion.model';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DraftChampion,
  draftHeaders,
  emptyDraftBans,
  emptyDraftPicks,
  blueSideBans,
  blueSidePicks,
  redSideBans,
  redSidePicks,
  LetterRank,
  defaultOpponentMasteries,
  defaultPlayerMasteries,
  DraftPlayer,
  DraftPhase,
} from './draft.model';
import { checkForAvailableRoles, getChampScoreRating, getDraftChampions, getMasterySort } from './draft.utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { AllRoles, Role } from '../player/player.model';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
})
export class DraftComponent {
  draftStarted = false;
  draftPhase: DraftPhase = 'Blue Ban 1';
  currentDraftRound = 1;
  champions: DraftChampion[];
  headers = draftHeaders;

  draftForm: FormGroup = new FormGroup({
    patchVersion: new FormControl<string>('MSI 24'),
    isRedSide: new FormControl<boolean>(false),
    useAiOpponent: new FormControl<boolean>(false),
  });

  blueSideMasteries: Partial<DraftPlayer>[] = [];
  redSideMasteries: Partial<DraftPlayer>[] = [];
  blueSidePlayers: {
    [key: string]: DraftChampion[];
  } = {
    top: [],
    jungle: [],
    mid: [],
    adc: [],
    support: [],
  };
  redSidePlayers: {
    [key: string]: DraftChampion[];
  } = {
    top: [],
    jungle: [],
    mid: [],
    adc: [],
    support: [],
  };
  searchControl = new FormControl<string>('');
  searchControlValue = toSignal(this.searchControl.valueChanges);

  sortMasteryProp: WritableSignal<'opponentMastery' | 'playerMastery'> = signal('opponentMastery');

  filteredChampions: Signal<DraftChampion[]> = computed(() => {
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampions = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps];
    const searchValue = this.searchControlValue();
    return this.champions
      .filter(c => {
        if (!searchValue) {
          return !selectedChampions.includes(c);
        }
        return !selectedChampions.includes(c) && c.name.toLowerCase().includes(searchValue.toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort(this.sortByMastery)
      .sort((a, b) => this.getMetaScore(b) - this.getMetaScore(a))
      .sort(this.sortChampions);
  });
  redSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  blueSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  redSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  blueSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);

  constructor() {
    const champions = Array.from(championsJson) as Champion[];
    this.champions = getDraftChampions(champions, this.patchVersion);
  }

  get isRedSide(): boolean {
    return this.draftForm.get('isRedSide')?.value;
  }

  get patchVersion(): string {
    return this.draftForm.get('patchVersion')?.value;
  }

  get useAiOpponent(): boolean {
    return this.draftForm.get('useAiOpponent')?.value;
  }

  getLetterRank(rating: number): LetterRank {
    if (rating > 18) {
      return 'S';
    } else if (rating > 14) {
      return 'A';
    } else if (rating > 10) {
      return 'B';
    } else if (rating > 6) {
      return 'C';
    } else if (rating > 2) {
      return 'D';
    } else {
      return 'F';
    }
  }

  sortChampions = (a: DraftChampion, b: DraftChampion) => {
    const aValue: number = this.getPickScore(a);
    const bValue: number = this.getPickScore(b);

    // Sort in descending order
    return bValue - aValue;
  };

  sortByMastery = (a: DraftChampion, b: DraftChampion) => {
    const aValue: number = a[this.sortMasteryProp()] as number;
    const bValue: number = b[this.sortMasteryProp()] as number;

    // Sort in descending order
    return bValue - aValue;
  };

  getMasteryScore(champ: DraftChampion) {
    const rating = getChampScoreRating(champ, this.draftPhase, this.currentDraftRound, this.isRedSide);
    return rating;
  }

  getMetaScore({ metaStrength }: DraftChampion, specificRole?: Role) {
    if (specificRole) {
      const roles = [...AllRoles];
      const index = roles.indexOf(specificRole);
      return metaStrength[index];
    }
    return Math.max(...metaStrength);
    // const arr = metaStrength.filter(rating => rating !== 0);
    // const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    // return avg;
  }

  getPickScore(champ: DraftChampion) {
    const mastery = this.getMasteryScore(champ);
    const metaStrength = this.getMetaScore(champ);
    if (mastery === 0) {
      return 0;
    }
    if (this.draftPhase.includes('Red Ban') || this.draftPhase.includes('Blue Pick')) {
      // When red team is banning or blue team is picking
      // if champ has only one role and the same role as one of the selected blueSideChamps return 0
      const pickedChampRoles = this.blueSideChamps().map(c => c.roles as Role[]);
      const availableRoles = checkForAvailableRoles(pickedChampRoles);
      // console.log(availableRoles);
      // if any of the availableRoles is in the currentChamp's roles then it can be returned as normal
      if (!availableRoles.some(r => champ.roles.includes(r))) {
        return 0;
      }
    } else if (this.draftPhase.includes('Blue Ban') || this.draftPhase.includes('Red Pick')) {
      // When blue team is banning or red team is picking
      // if champ has only one role and the same role as one of the selected redSideChamps return 0
      const pickedChampRoles = this.redSideChamps().map(c => c.roles as Role[]);
      const availableRoles = checkForAvailableRoles(pickedChampRoles);
      // console.log(availableRoles);
      // if any of the availableRoles is in the currentChamp's roles then it can be returned as normal
      if (!availableRoles.some(r => champ.roles.includes(r))) {
        return 0;
      }
    }
    const avg = (mastery * 0.75 + metaStrength * 1.25) / 2;
    // console.log(avg);
    return avg;
  }

  getTopChamps(role: string, isBlueSide: boolean): DraftChampion[] {
    const key = role.toLowerCase();
    if (isBlueSide) {
      return this.blueSidePlayers[key].slice(0, 4);
    } else {
      return this.redSidePlayers[key].slice(0, 4);
    }
  }

  getTopChampsForEachRole(player: Partial<DraftPlayer>, isBlueSide: boolean) {
    const role = player.mainRole;
    if (!role) {
      return;
    }
    const champs = Array.from(
      this.filteredChampions()
        .filter(c => c.roles.includes(role as Role) && player.championMastery?.s.includes(c.id))
        .concat(...this.filteredChampions().filter(c => c.roles.includes(role as Role) && player.championMastery?.a.includes(c.id)))
    );
    if (isBlueSide) {
      this.blueSidePlayers[role] = champs;
    } else {
      this.redSidePlayers[role] = champs;
    }
  }

  startDraft() {
    console.log('start draft');
    this.draftStarted = true;
    const prop = this.isRedSide ? 'opponentMastery' : 'playerMastery';
    this.sortMasteryProp.set(prop);
    this.blueSideMasteries = this.isRedSide ? [...defaultOpponentMasteries] : [...defaultPlayerMasteries];
    this.redSideMasteries = this.isRedSide ? [...defaultPlayerMasteries] : [...defaultOpponentMasteries];
    for (const player of this.blueSideMasteries) {
      this.getTopChampsForEachRole(player, true);
    }

    for (const player of this.redSideMasteries) {
      this.getTopChampsForEachRole(player, false);
    }
    console.log('blueSide', this.blueSideMasteries, '\nredSide', this.redSideMasteries);
    console.log('blueSide', this.blueSidePlayers, '\nredSide', this.redSidePlayers);
  }

  chooseChampion(champ: DraftChampion) {
    if (this.currentDraftRound > 20) {
      return;
    }

    console.log('choose champion', this.currentDraftRound, champ.name);
    // BANS
    // red bans on 2, 4, 6, 13, 15
    // blue bans on 1, 3, 5, 14, 16
    const firstBanPhase = this.currentDraftRound < 7;
    const secondBanPhase = this.currentDraftRound > 12 && this.currentDraftRound < 17;
    const firstPickPhase = this.currentDraftRound > 6 && this.currentDraftRound < 13;
    const secondPickPhase = this.currentDraftRound > 16;
    if (firstBanPhase || secondBanPhase) {
      const isRed = redSideBans.includes(this.currentDraftRound);
      if (isRed) {
        const arr = [...this.redSideBans()];
        const index = redSideBans.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.redSideBans.set(arr);
      } else {
        const arr = [...this.blueSideBans()];
        const index = blueSideBans.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideBans.set(arr);
      }
    } else if (firstPickPhase || secondPickPhase) {
      // PICKS
      // red chooses on 8, 9, 12, 17, 20
      // blue chooses on 7, 10, 11, 18, 19

      const isRed = redSidePicks.includes(this.currentDraftRound);
      if (isRed) {
        const arr = [...this.redSideChamps()];
        const index = redSidePicks.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.redSideChamps.set(arr);
      } else {
        const arr = [...this.blueSideChamps()];
        const index = blueSidePicks.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideChamps.set(arr);
      }
    }
    this.currentDraftRound++;
    this.checkPickPhase();
  }

  checkPickPhase() {
    if (this.currentDraftRound > 20) {
      this.draftPhase = 'Draft Complete';
      return;
    }

    const firstBanPhase = this.currentDraftRound < 7;
    const secondBanPhase = this.currentDraftRound > 12 && this.currentDraftRound < 17;
    const firstPickPhase = this.currentDraftRound > 6 && this.currentDraftRound < 13;
    const secondPickPhase = this.currentDraftRound > 16;
    let index = 0;
    let firstPhrase = '';
    if (firstBanPhase || secondBanPhase) {
      const isRed = redSideBans.includes(this.currentDraftRound);
      if (isRed) {
        index = redSideBans.indexOf(this.currentDraftRound);
        firstPhrase = 'Red Ban ';
      } else {
        index = blueSideBans.indexOf(this.currentDraftRound);
        firstPhrase = 'Blue Ban ';
      }
    } else if (firstPickPhase || secondPickPhase) {
      // PICKS
      // red chooses on 8, 9, 12, 17, 20
      // blue chooses on 7, 10, 11, 18, 19
      const isRed = redSidePicks.includes(this.currentDraftRound);
      if (isRed) {
        index = redSidePicks.indexOf(this.currentDraftRound);
        firstPhrase = 'Red Pick ';
      } else {
        index = blueSidePicks.indexOf(this.currentDraftRound);
        firstPhrase = 'Blue Pick ';
      }
    }
    this.draftPhase = (firstPhrase + (index + 1).toString()) as DraftPhase;

    this.sortMasteryProp.set(getMasterySort(this.draftPhase, this.currentDraftRound, this.isRedSide));
  }

  getCompositionAdvice(redOrBlue: 'red' | 'blue'): string[] {
    if (redOrBlue === 'blue') {
      return [''];
    }
    return [''];
  }
}
