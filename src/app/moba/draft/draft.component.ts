import { Component, ElementRef, Signal, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  DraftChampion,
  blueSideBanRounds,
  blueSidePickRounds,
  redSideBanRounds,
  redSidePickRounds,
  LetterRank,
  DraftPhase,
  getRoleFromFilter,
  tierValues,
  DraftSortHeader,
  TierValue,
  patches,
  Proficiency,
  DraftMetaData,
  latestPatch,
  DifficultyLevel,
} from './draft.model';
import { checkForAvailableRoles, getChampMasteries, getChampPropFromDraftPhase, sortRoles } from './draft.utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { AllRoles, Role, positionFilters } from '../player-draft/player/player.model';
import { shuffle } from 'lodash-es';
import { DraftAdviceService } from './draft-advice/draft-advice.service';
import { DraftService } from './draft.service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
  host: {
    '(window:resize)': 'getScreenSize($event)',
  },
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
  positionFilters = positionFilters;
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

  redSideAdvice: WritableSignal<string[]> = signal([]);
  blueSideAdvice: WritableSignal<string[]> = signal([]);

  blueSideDraftScores: WritableSignal<number[]> = signal([]);
  redSideDraftScores: WritableSignal<number[]> = signal([]);

  searchControl = new FormControl<string>('');
  searchControlValue = toSignal(this.searchControl.valueChanges);
  roleFilter: WritableSignal<Role | 'all'> = signal('all');
  sortBy: WritableSignal<DraftSortHeader> = signal('meta');

  filteredChampions: Signal<DraftChampion[]> = computed(() => {
    const availableChampions = this.service.availableChampions();
    const searchValue = this.searchControlValue();
    const roleFilterValue = this.roleFilter();
    const sortBy = this.sortBy();
    const redBans = this.service.redSideBans();
    const blueBans = this.service.blueSideBans();
    const redSideChamps = this.service.redSideChamps();
    const blueSideChamps = this.service.blueSideChamps();
    const selectedChampionIds = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps].map(c => c.id);
    // console.log(availableChampions);
    const champions = availableChampions
      .filter(c => {
        if (selectedChampionIds.includes(c.id)) {
          return false;
        }
        if (!searchValue && roleFilterValue === 'all') {
          return true;
        }
        if (searchValue && roleFilterValue === 'all') {
          return c.name.toLowerCase().includes(searchValue.toLowerCase());
        }

        if (roleFilterValue !== 'all' && !searchValue) {
          return c.roles.includes(roleFilterValue);
        }

        if (roleFilterValue !== 'all' && searchValue) {
          return c.roles.includes(roleFilterValue) && c.name.toLowerCase().includes(searchValue.toLowerCase());
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => this.getDisplayMasteryScore(a) - this.getDisplayMasteryScore(b))
      .sort((a, b) => this.getDisplayMetaScore(b) - this.getDisplayMetaScore(a));
    return this.chooseSortBy(champions, sortBy);
  });

  constructor(
    private service: DraftService,
    private draftAdviceService: DraftAdviceService
  ) {}

  get draftService(): DraftService {
    return this.service;
  }

  get selectedRoleFilter(): Role {
    const role = this.roleFilter();
    if (role === 'all') {
      return 'top';
    } else {
      return role;
    }
  }

  getScreenSize(_event: unknown) {
    this.screenWidth = window.innerWidth;
  }

  setDraftData({ patchData, userIsRedSide, useAiOpponent, difficulty, useRandomTeam }: DraftMetaData) {
    this.patchData = patchData;
    this.userIsRedSide = userIsRedSide;
    this.useAiOpponent = useAiOpponent;
    this.difficulty = difficulty;
    this.useRandomTeam = useRandomTeam;
  }

  changeActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getChampionFromId(id: number | undefined): DraftChampion | undefined {
    return this.service.getChampionFromId(id);
  }

  startDraft() {
    this.draftStarted = true;
    this.checkAndStartAiTimer();
  }

  resetDraft() {
    this.redChampResults = [];
    this.blueChampResults = [];
    this.isBlueSideChoosing.set(true);
    this.isBanPhase.set(true);
    this.draftStarted = false;
    this.draftPhase = 'Blue Ban 1';
    this.currentDraftRound = 1;
    this.aiTimer = -1;

    this.isAiChoosing = false;

    this.blueSideDraftScores.set([]);
    this.redSideDraftScores.set([]);

    this.service.resetDraft();
    this.service.initiateMasteries({
      useRandomTeam: this.useRandomTeam,
      patchData: this.patchData,
      userIsRedSide: this.userIsRedSide,
      useAiOpponent: this.useAiOpponent,
      difficulty: this.difficulty,
    });
  }

  restartDraft() {
    this.resetDraft();
    this.startDraft();
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

  getTableDisplayScore(rating: number, isProficiency = false): LetterRank | Proficiency {
    if (rating > 18) {
      return isProficiency ? '++' : 'S';
    } else if (rating > 14) {
      return isProficiency ? '+' : 'A';
    } else if (rating > 10) {
      return isProficiency ? '+' : 'B';
    } else if (rating > 6) {
      return isProficiency ? '+-' : 'C';
    } else if (rating > 2) {
      return isProficiency ? '-' : 'D';
    } else {
      return isProficiency ? '--' : 'F';
    }
  }

  getDisplayMetaScore(champ: DraftChampion, specificRole?: Role) {
    if (this.roleFilter() === 'all') {
      return this.isOneRoleAvailable(champ) ? this.getMetaScore(champ, specificRole) : TierValue.F;
    }
    return this.getMetaScore(champ, this.roleFilter() as Role);
  }

  getDisplayMasteryScore(champ: DraftChampion, specificRole?: Role, playerSide?: 'player' | 'opponent') {
    if (this.roleFilter() === 'all') {
      return this.isOneRoleAvailable(champ) ? this.getMasteryScore(champ, specificRole) : TierValue.F;
    }
    return this.getMasteryScore(champ, this.roleFilter() as Role, playerSide);
  }

  getMasteryScore(champ: DraftChampion, specificRole?: Role, playerSide?: string) {
    // this will always return the masteries from the 1st player's chosen side
    // this is at least for the filteredRoles, changes when all roles are shown
    // e.g. player/opponent will still be player/opponent when opponent picks
    // this should be changed when roles are filtered
    const ratings = getChampMasteries(champ, this.draftPhase, this.currentDraftRound, this.userIsRedSide, playerSide);
    if (!specificRole) {
      return Math.max(...ratings);
    }
    const roles = [...AllRoles];
    const index = roles.indexOf(specificRole);
    return ratings[index];
  }

  getMetaScore({ metaStrength }: DraftChampion, specificRole?: Role) {
    if (specificRole) {
      const roles = [...AllRoles];
      const index = roles.indexOf(specificRole);
      return metaStrength[index];
    }
    // this should accurately give multiRole champs in edge in metaScore
    const weightedStrength = metaStrength.filter(r => r >= 2).sort((a, b) => b - a);
    return weightedStrength.length < 2
      ? Math.max(...weightedStrength)
      : weightedStrength.length === 2
        ? Math.max(...weightedStrength) + weightedStrength[1] / 12
        : Math.max(...weightedStrength) + weightedStrength[1] / 12 + weightedStrength[2] / 12;
  }

  setSynergyScore(evaluatedChamp: DraftChampion, playerSide?: 'player' | 'opponent') {
    const side = playerSide ?? getChampPropFromDraftPhase(this.draftPhase, this.currentDraftRound, this.userIsRedSide);
    let currentSelectedChamps: Partial<DraftChampion>[];
    if (blueSideBanRounds.includes(this.currentDraftRound) || redSidePickRounds.includes(this.currentDraftRound)) {
      currentSelectedChamps = this.service.redSideChamps();
    } else {
      currentSelectedChamps = this.service.blueSideChamps();
    }

    currentSelectedChamps = currentSelectedChamps.filter(c => !c.isPlaceholder);
    if (currentSelectedChamps.length < 1) {
      return TierValue.F;
    }
    const compStats = this.draftAdviceService.getTeamCompStyleScoring(currentSelectedChamps as DraftChampion[]);

    const teamSynergy = this.draftAdviceService.compareCompStyle(compStats, evaluatedChamp, currentSelectedChamps.length);
    // console.log(teamSynergy);
    if (side === 'player') {
      evaluatedChamp.currentSynergy.player.team = teamSynergy;
    } else {
      evaluatedChamp.currentSynergy.opp.team = teamSynergy;
    }
    for (const champ of currentSelectedChamps as DraftChampion[]) {
      const tierList = champ.synergies[champ.selectedRole];
      for (const [letter, championIds] of Object.entries(tierList)) {
        if (championIds.includes(evaluatedChamp.id)) {
          if (side === 'player') {
            evaluatedChamp.currentSynergy.player.individual = tierValues[letter];
            return (tierValues[letter] * 3 + teamSynergy) / 4;
          } else {
            evaluatedChamp.currentSynergy.opp.individual = tierValues[letter];
            return (tierValues[letter] * 3 + teamSynergy) / 4;
          }
        }
      }
    }
    if (side === 'player') {
      evaluatedChamp.currentSynergy.player.individual = TierValue.F;
      return (TierValue.F + teamSynergy) / 2;
    } else {
      evaluatedChamp.currentSynergy.opp.individual = TierValue.F;
      return (TierValue.F + teamSynergy) / 2;
    }
  }

  getSynergyScore(evaluatedChamp: DraftChampion, playerSide?: 'player' | 'opponent'): number {
    // if champ hasn't been evaluated for synergy or the selectedRole has changed for a selectedChamp then get the synergy score otherwise use the existing score

    const side = playerSide ?? getChampPropFromDraftPhase(this.draftPhase, this.currentDraftRound, this.userIsRedSide);
    // if (evaluatedChamp.currentSynergy.player && side === 'player') {
    //   return evaluatedChamp.currentSynergy.player;
    // }
    // if (evaluatedChamp.currentSynergy.opp && side === 'opponent') {
    //   return evaluatedChamp.currentSynergy.opp;
    // }
    const score = this.setSynergyScore(evaluatedChamp, playerSide);
    if (side === 'player') {
      evaluatedChamp.currentSynergy.player.individual = score;
      return score;
    } else {
      evaluatedChamp.currentSynergy.opp.individual = score;
      return score;
    }
  }

  setCounterScore(evaluatedChamp: DraftChampion, playerSide?: 'opponent' | 'player'): number {
    const side = playerSide ?? getChampPropFromDraftPhase(this.draftPhase, this.currentDraftRound, this.userIsRedSide);
    let currentSelectedChamps: Partial<DraftChampion>[];
    if (blueSideBanRounds.includes(this.currentDraftRound) || redSidePickRounds.includes(this.currentDraftRound)) {
      currentSelectedChamps = this.service.blueSideChamps();
    } else {
      currentSelectedChamps = this.service.redSideChamps();
    }

    currentSelectedChamps = currentSelectedChamps.filter(c => !c.isPlaceholder);
    if (currentSelectedChamps.length < 1) {
      if (side === 'player') {
        evaluatedChamp.currentCounter.player[evaluatedChamp.selectedRole] = TierValue.F;
        return TierValue.F;
      } else {
        evaluatedChamp.currentCounter.opp[evaluatedChamp.selectedRole] = TierValue.F;
        return TierValue.F;
      }
    }
    for (const champ of currentSelectedChamps as DraftChampion[]) {
      const tierList = champ.counters[champ.selectedRole];
      for (const [letter, championIds] of Object.entries(tierList)) {
        if (championIds.includes(evaluatedChamp.id)) {
          if (side === 'player') {
            const score = tierValues[letter];
            evaluatedChamp.currentCounter.player[champ.selectedRole] = score;
            const adviceTags = evaluatedChamp.adviceTags.player[evaluatedChamp.selectedRole];
            if (score >= 12 && !adviceTags.includes('Counter Pick')) {
              console.log('counter pick for player');
              adviceTags.push('Counter Pick');
            }
            return score;
          } else {
            const score = tierValues[letter];
            evaluatedChamp.currentCounter.opp[champ.selectedRole] = score;
            const adviceTags = evaluatedChamp.adviceTags.opp[evaluatedChamp.selectedRole];
            if (score >= 12 && !adviceTags.includes('Counter Pick')) {
              console.log('counter pick for opp');
              adviceTags.push('Counter Pick');
            }
            return score;
          }
        }
      }
    }
    if (side === 'player') {
      evaluatedChamp.currentCounter.player[evaluatedChamp.selectedRole] = TierValue.F;
      return TierValue.F;
    } else {
      evaluatedChamp.currentCounter.opp[evaluatedChamp.selectedRole] = TierValue.F;
      return TierValue.F;
    }
  }

  getCounterScore(evaluatedChamp: DraftChampion, playerSide?: 'player' | 'opponent'): number {
    const side = playerSide ?? getChampPropFromDraftPhase(this.draftPhase, this.currentDraftRound, this.userIsRedSide);

    // if (evaluatedChamp.currentCounter.player && side === 'player') {
    //   return evaluatedChamp.currentCounter.player;
    // }
    // if (evaluatedChamp.currentCounter.opp && side === 'opponent') {
    //   return evaluatedChamp.currentCounter.opp;
    // }
    const score = this.setCounterScore(evaluatedChamp, side);
    if (side === 'player') {
      evaluatedChamp.currentCounter.player[evaluatedChamp.selectedRole] = score;
      return score;
    } else {
      evaluatedChamp.currentCounter.opp[evaluatedChamp.selectedRole] = score;
      return score;
    }
  }

  getPickScore(champ: DraftChampion) {
    const mastery = this.getMasteryScore(champ);
    const metaStrength = this.getMetaScore(champ);
    const synergy = this.getSynergyScore(champ);
    if (mastery === TierValue.F) {
      return TierValue.F;
    }
    if (!this.isOneRoleAvailable(champ)) {
      return TierValue.F;
    }
    const avg = (mastery * 0.75 + metaStrength * 1.25 + synergy * 0.5) / 2;
    return avg;
  }

  chooseSortBy(champs: DraftChampion[], sortBy: DraftSortHeader) {
    const playerSide =
      (this.isUserChoosing() && this.isBanPhase()) || (!this.isUserChoosing() && !this.isBanPhase()) ? 'opponent' : 'player';
    if (sortBy === 'name') {
      return champs.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'synergy') {
      return champs.sort((a, b) => this.getSynergyScore(b) - this.getSynergyScore(a));
    }
    if (sortBy === 'mastery') {
      return champs.sort(
        (a, b) =>
          this.getDisplayMasteryScore(b, this.roleFilter() === 'all' ? undefined : (this.roleFilter() as Role), playerSide) -
          this.getDisplayMasteryScore(a, this.roleFilter() === 'all' ? undefined : (this.roleFilter() as Role), playerSide)
      );
    }
    if (sortBy === 'meta') {
      return champs.sort((a, b) => this.getDisplayMetaScore(b) - this.getDisplayMetaScore(a));
    }
    if (sortBy === 'counter') {
      return champs.sort((a, b) => this.getCounterScore(b) - this.getCounterScore(a));
    }
    return champs;
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

  checkAndStartAiTimer() {
    if (!this.useAiOpponent || this.isAiChoosing) {
      return;
    }
    if (
      (this.userIsRedSide && this.blueRounds.includes(this.currentDraftRound)) ||
      (!this.userIsRedSide && this.redRounds.includes(this.currentDraftRound))
    ) {
      this.isAiChoosing = true;
      const intervalId = setInterval(() => {
        this.incrementAiTimer();
        if (this.aiTimer >= 100) {
          clearInterval(intervalId);
          this.chooseAiChampion();
          this.aiTimer = -1;
          this.isAiChoosing = false;
          this.checkAndStartAiTimer();
        }
      }, 25);
    }
  }

  incrementAiTimer() {
    this.aiTimer += 1;
  }

  chooseAiChampion() {
    let champOptions = [];
    // if AI is Blue Side and is currently picking a champ
    if (this.userIsRedSide && blueSidePickRounds.includes(this.currentDraftRound)) {
      const selectedRoles = this.service
        .blueSideChamps()
        .filter(c => c.selectedRole)
        .map(c => c.selectedRole as Role);
      champOptions = [...this.service.availableChampions().filter(c => !selectedRoles.includes(c.selectedRole))];
    } else if (!this.userIsRedSide && redSidePickRounds.includes(this.currentDraftRound)) {
      // if AI is Red Side and is currently picking a champ
      const selectedRoles = this.service
        .redSideChamps()
        .filter(c => c.selectedRole)
        .map(c => c.selectedRole as Role);
      champOptions = [...this.service.availableChampions().filter(c => !selectedRoles.includes(c.selectedRole))];
    } else {
      champOptions = [...this.service.availableChampions()]; // this will return all champions
    }
    const sortedChamps = champOptions.sort((a, b) => this.getPickScore(b) - this.getPickScore(a));
    const draftChampion = shuffle(sortedChamps.slice(0, 3))[0];
    this.chooseChampion(draftChampion, true);
  }

  chooseChampion(champ: DraftChampion, isAiChoice = false) {
    if (!isAiChoice) {
      this.isAiChoosing = false;
    }
    if (this.currentDraftRound > 20 || (this.aiTimer > -1 && !isAiChoice)) {
      return;
    }

    const draftPickScore = this.getPickScore(champ);
    // BANS
    // red bans on 2, 4, 6, 13, 15
    // blue bans on 1, 3, 5, 14, 16
    const firstBanPhase = this.currentDraftRound < 7;
    const secondBanPhase = this.currentDraftRound > 12 && this.currentDraftRound < 17;
    const firstPickPhase = this.currentDraftRound > 6 && this.currentDraftRound < 13;
    const secondPickPhase = this.currentDraftRound > 16;
    if (firstBanPhase || secondBanPhase) {
      const isRed = redSideBanRounds.includes(this.currentDraftRound);
      if (isRed) {
        const arr = [...this.service.redSideBans()];
        const index = redSideBanRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.service.redSideBans.set(arr);
        this.callNotification(`Red side has banned ${champ.name}.`, 'red');
      } else {
        const arr = [...this.service.blueSideBans()];
        const index = blueSideBanRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.service.blueSideBans.set(arr);
        this.callNotification(`Blue side has banned ${champ.name}.`, 'blue');
      }
    } else if (firstPickPhase || secondPickPhase) {
      // PICKS
      // red chooses on 8, 9, 12, 17, 20
      // blue chooses on 7, 10, 11, 18, 19

      const isRed = redSidePickRounds.includes(this.currentDraftRound);
      if (isRed) {
        const arr = [...this.service.redSideChamps()];
        const index = redSidePickRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.redSideDraftScores.set([...this.redSideDraftScores(), draftPickScore]);
        this.service.redSideChamps.set(arr);
        this.callNotification(`Red side has chosen ${champ.name}.`, `'red'`);
        console.log(`Red side has chosen ${champ.name}.`, `With a score of ${draftPickScore}/20`);
      } else {
        const arr = [...this.service.blueSideChamps()];
        const index = blueSidePickRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideDraftScores.set([...this.blueSideDraftScores(), draftPickScore]);
        this.service.blueSideChamps.set(arr);
        this.callNotification(`Blue side has chosen ${champ.name}.`, 'blue');
        console.log(`Blue side has chosen ${champ.name}.`, `With a score of ${draftPickScore}/20`);
      }
    }
    // console.log(this.blueSideDraftScores(), this.redSideDraftScores());
    this.currentDraftRound++;
    this.checkPickPhase();
    this.checkAndStartAiTimer();
  }

  checkPickPhase() {
    if (this.currentDraftRound > 20) {
      this.draftPhase = 'Draft Complete';
      this.showChampResults();

      return;
    }

    const firstBanPhase = this.currentDraftRound < 7;
    const secondBanPhase = this.currentDraftRound > 12 && this.currentDraftRound < 17;
    const firstPickPhase = this.currentDraftRound > 6 && this.currentDraftRound < 13;
    const secondPickPhase = this.currentDraftRound > 16;
    let index = 0;
    let firstPhrase = '';
    if (firstBanPhase || secondBanPhase) {
      const isRed = redSideBanRounds.includes(this.currentDraftRound);
      if (isRed) {
        index = redSideBanRounds.indexOf(this.currentDraftRound);
        firstPhrase = 'Red Ban ';
      } else {
        index = blueSideBanRounds.indexOf(this.currentDraftRound);
        firstPhrase = 'Blue Ban ';
      }
    } else if (firstPickPhase || secondPickPhase) {
      // PICKS
      // red chooses on 8, 9, 12, 17, 20
      // blue chooses on 7, 10, 11, 18, 19
      const isRed = redSidePickRounds.includes(this.currentDraftRound);
      if (isRed) {
        index = redSidePickRounds.indexOf(this.currentDraftRound);
        firstPhrase = 'Red Pick ';
      } else {
        index = blueSidePickRounds.indexOf(this.currentDraftRound);
        firstPhrase = 'Blue Pick ';
      }
    }
    this.draftPhase = (firstPhrase + (index + 1).toString()) as DraftPhase;
  }

  displaySynergyAndCounter() {
    if (this.currentDraftRound < 7) {
      return 'n/a';
    } else if (this.screenWidth > 640 && this.roleFilter() !== 'all') {
      return 'roleSpecific';
    } else {
      return;
    }
  }

  showChampResults() {
    // need to select based on player chosen side not based on default sides
    // this will only work if the player chose blue side, need to account for red side as a choice
    console.log(this.draftService.blueSideChamps(), this.draftService.redSideChamps());
    const blueScores = this.blueSideDraftScores();
    const redScores = this.redSideDraftScores();
    const blueChamps = this.draftService.blueSideChamps().map((c, i) => {
      return {
        ...c,
        currentScore: {
          player: blueScores[i],
          opp: 0,
        },
      };
    });
    const redChamps = this.draftService.redSideChamps().map((c, i) => {
      return {
        ...c,
        currentScore: {
          player: 0,
          opp: redScores[i],
        },
      };
    });
    this.blueChampResults = [...blueChamps].sort((a, b) => sortRoles(a.selectedRole, b.selectedRole));
    this.redChampResults = [...redChamps].sort((a, b) => sortRoles(a.selectedRole, b.selectedRole));
    this.draftResultsDialog.nativeElement.showModal();
  }
}
