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
} from './draft.model';
import { getChampScoreRating, getDraftChampions } from './draft.utils';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
})
export class DraftComponent {
  draftStarted = false;
  draftPhase = 'First Ban Phase';
  currentDraftRound = 1;
  champions: DraftChampion[];
  headers = draftHeaders;

  draftForm: FormGroup = new FormGroup({
    patchVersion: new FormControl<string>('MSI24'),
    isRedSide: new FormControl<boolean>(false),
  });

  filteredChampions: Signal<DraftChampion[]> = computed(() => {
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampions = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps];
    return this.champions.filter(c => {
      return !selectedChampions.includes(c);
    });
  });
  redSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  blueSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  redSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  blueSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);

  constructor() {
    const champions = Array.from(championsJson) as Champion[];
    this.champions = getDraftChampions(champions, this.patchVersion);
    console.log(this.champions);
  }

  get isRedSide(): boolean {
    return this.draftForm.get('isRedSide')?.value;
  }

  get patchVersion(): string {
    return this.draftForm.get('patchVersion')?.value;
  }

  getLetterRank(rating: number): LetterRank {
    switch (rating) {
      case 20:
        return 'S';
      case 16:
        return 'A';
      case 16:
        return 'B';
      case 16:
        return 'C';
      case 16:
        return 'D';
      default:
        return 'N/A';
    }
  }

  getPickScore(champ: DraftChampion): LetterRank {
    const rating = getChampScoreRating(champ, this.draftPhase, this.currentDraftRound, this.isRedSide);
    return this.getLetterRank(rating);
  }

  startDraft() {
    console.log('start draft');
    this.draftStarted = true;
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
        arr[redSideBans.indexOf(this.currentDraftRound)] = champ;
        this.redSideBans.set(arr);
      } else {
        const arr = [...this.blueSideBans()];
        arr[blueSideBans.indexOf(this.currentDraftRound)] = champ;
        this.blueSideBans.set(arr);
      }
    } else if (firstPickPhase || secondPickPhase) {
      // PICKS
      // red chooses on 8, 9, 12
      // blue chooses on 7, 10, 11

      const isRed = redSidePicks.includes(this.currentDraftRound);
      if (isRed) {
        const arr = [...this.redSideChamps()];
        arr[redSidePicks.indexOf(this.currentDraftRound)] = champ;
        this.redSideChamps.set(arr);
      } else {
        const arr = [...this.blueSideChamps()];
        arr[blueSidePicks.indexOf(this.currentDraftRound)] = champ;
        this.blueSideChamps.set(arr);
      }
    }
    this.currentDraftRound++;
    this.checkPickPhase();
  }

  checkPickPhase() {
    const firstBanPhase = this.currentDraftRound < 7;
    const secondBanPhase = this.currentDraftRound > 12 && this.currentDraftRound < 17;
    const firstPickPhase = this.currentDraftRound > 6 && this.currentDraftRound < 13;
    const secondPickPhase = this.currentDraftRound > 16;
    switch (true) {
      case firstBanPhase:
        this.draftPhase = 'First Ban Phase';
        break;
      case secondBanPhase:
        this.draftPhase = 'Second Ban Phase';
        break;
      case firstPickPhase:
        this.draftPhase = 'First Pick Phase';
        break;
      case secondPickPhase:
        this.draftPhase = 'Second Pick Phase';
        break;
      default:
        this.draftPhase = 'N/A';
    }
    if (this.currentDraftRound > 20) {
      this.draftPhase = 'Draft Complete';
    }
  }
}
