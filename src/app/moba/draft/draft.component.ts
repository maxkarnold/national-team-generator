import { Component, ElementRef, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import {
  DraftChampion,
  blueSideBanRounds,
  blueSidePickRounds,
  redSideBanRounds,
  redSidePickRounds,
  DraftPhase,
  getRoleFromFilter,
  TierValue,
  patches,
  DraftMetaData,
  latestPatch,
  DifficultyLevel,
} from './draft.model';
import { checkForAvailableRoles, getChampPropFromDraftPhase } from './draft.utils';
import { DraftAdviceService } from './services/draft-advice.service';
import { DraftService } from './services/draft.service';
import { StateService } from './services/state.service';
import { ChampionsService } from './services/champions.service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
  host: {
    '(window:resize)': 'getScreenSize($event)',
  },
  providers: [StateService, ChampionsService, DraftAdviceService],
})
export class DraftComponent {
  @ViewChild('draftResultsDialog') draftResultsDialog!: ElementRef<HTMLDialogElement>;
  screenWidth = window.innerWidth;
  activeTab = 'blue';
  userIsRedSide = false;
  patchData = latestPatch;
  useAiOpponent = false;
  difficulty: DifficultyLevel = 'medium';
  useRandomTeam = true;

  draftStarted = false;
  draftPhase: DraftPhase = 'Blue Ban 1';
  currentDraftRound = 1;
  aiTimer = -1;
  getRoleFromFilter = getRoleFromFilter;
  getChampPropFromDraftPhase = getChampPropFromDraftPhase;
  patches = patches;
  notification = {
    isActive: false,
    message: '',
    type: 'success',
  };
  isAiChoosing = false;
  blueSideBanRounds = blueSideBanRounds;
  redSideBanRounds = redSideBanRounds;
  blueRounds = [...blueSideBanRounds, ...blueSidePickRounds];
  redRounds = [...redSideBanRounds, ...redSidePickRounds];
  blueChampResults: Partial<DraftChampion>[] = [];
  redChampResults: Partial<DraftChampion>[] = [];

  isBlueSideChoosing = signal(true);
  isBanPhase = signal(true);
  isUserChoosing = computed(() => {
    const blueSideChoosing = this.isBlueSideChoosing();
    return this.userIsRedSide ? !blueSideChoosing : blueSideChoosing;
  });

  blueSideAdvice = this.adviceService.blueSideAdvice;
  redSideAdvice = this.adviceService.redSideAdvice;

  blueSideDraftScores: WritableSignal<number[]> = signal([]);
  redSideDraftScores: WritableSignal<number[]> = signal([]);

  constructor(private adviceService: DraftAdviceService) {}

  get draftService(): DraftService {
    return this.service;
  }

  getScreenSize(_event: unknown) {
    this.screenWidth = window.innerWidth;
  }

  changeActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getChampionFromId(id: number | undefined): DraftChampion | undefined {
    return this.service.getChampionFromId(id);
  }

  callNotification(message: string, color = 'green') {
    if (color === 'blue') {
      this.notification.type = 'info';
    } else if (color === 'red') {
      this.notification.type = 'error';
    } else {
      this.notification.type = 'success';
    }

    this.notification.message = message;
    this.notification.isActive = true;
    setTimeout(() => {
      this.notification.isActive = false;
      this.notification.message = '';
    }, 4000);
  }

  isOneRoleAvailable(champ: DraftChampion) {
    if (this.draftPhase.includes('Red Ban') || this.draftPhase.includes('Blue Pick')) {
      // When red team is banning or blue team is picking
      // if champ has only one role and the same role as one of the selected blueSideChamps return 0
      const pickedChampRoles = this.service.blueSideChamps().map(c => c.selectedRole);
      const availableRoles = checkForAvailableRoles(pickedChampRoles);
      // console.log(availableRoles);
      // if any of the availableRoles is in the currentChamp's roles then it can be returned as normal
      if (!availableRoles.some(r => champ.roles.includes(r))) {
        return TierValue.F;
      }
    } else if (this.draftPhase.includes('Blue Ban') || this.draftPhase.includes('Red Pick')) {
      // When blue team is banning or red team is picking
      // if champ has only one role and the same role as one of the selected redSideChamps return 0
      const pickedChampRoles = this.service.redSideChamps().map(c => c.selectedRole);
      const availableRoles = checkForAvailableRoles(pickedChampRoles);
      // console.log(availableRoles);
      // if any of the availableRoles is in the currentChamp's roles then it can be returned as normal
      if (!availableRoles.some(r => champ.roles.includes(r))) {
        return 0;
      }
    }
    return true;
  }
}
