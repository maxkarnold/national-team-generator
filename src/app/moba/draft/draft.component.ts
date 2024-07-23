import { Component, HostListener, Signal, WritableSignal, computed, signal } from '@angular/core';
import * as championsJson from 'assets/json/moba/champions.json';
import { Champion, DamageType } from '../champion/champion.model';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DraftChampion,
  emptyDraftBans,
  emptyDraftPicks,
  blueSideBanRounds,
  blueSidePickRounds,
  redSideBanRounds,
  redSidePickRounds,
  LetterRank,
  defaultOpponentMasteries,
  defaultPlayerMasteries,
  DraftPlayer,
  DraftPhase,
  TierListRankings,
  getRoleFromFilter,
  tierValues,
  DraftSortHeader,
  PatchName,
  TierValue,
  DraftMetaData,
  hasAllPropsDraftMetaData,
  patchNames,
} from './draft.model';
import {
  checkForAvailableRoles,
  getDraftChampions,
  getRandomMasteries,
  getChampMasteries,
  getChampPropFromDraftPhase,
  getPatchData,
} from './draft.utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { AllRoles, Role, positionFilters } from '../player/player.model';
import { shuffle } from 'lodash-es';
import { MobaService } from '../moba.service';
import { compareCompStyle, getCompositionAdviceAndGrade, getTeamCompStyleScoring } from './draft-grader';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
})
export class DraftComponent {
  screenWidth: number;
  draftStarted = false;
  draftPhase: DraftPhase = 'Blue Ban 1';
  currentDraftRound = 1;
  aiTimer = -1;
  champions: DraftChampion[] = [];
  getRoleFromFilter = getRoleFromFilter;
  getChampPropFromDraftPhase = getChampPropFromDraftPhase;
  patchNames = patchNames;
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

  draftForm: FormGroup = new FormGroup({
    patchName: new FormControl<PatchName>('Summer 2024'),
    userIsRedSide: new FormControl<boolean>(false),
    useAiOpponent: new FormControl<boolean>(false),
    difficulty: new FormControl<'easy' | 'medium' | 'hard'>('medium'),
    useRandomTeam: new FormControl<boolean>({ value: true, disabled: true }),
  });

  isBlueSideChoosing = signal(true);
  isBanPhase = signal(true);
  isUserChoosing = computed(() => {
    const blueSideChoosing = this.isBlueSideChoosing();
    return this.userIsRedSide ? !blueSideChoosing : blueSideChoosing;
  });

  blueSideDraftScores: WritableSignal<number[]> = signal([]);
  redSideDraftScores: WritableSignal<number[]> = signal([]);
  blueSideMasteries: DraftPlayer[] = [];
  redSideMasteries: DraftPlayer[] = [];
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
  roleFilter: WritableSignal<Role | 'all'> = signal('all');
  sortBy: WritableSignal<DraftSortHeader> = signal('meta');

  availableChampions: Signal<DraftChampion[]> = computed(() => {
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampionsIds = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps].map(c => c.id);
    return this.champions.filter(c => !selectedChampionsIds.includes(c.id));
  });

  filteredChampions: Signal<DraftChampion[]> = computed(() => {
    const availableChampions = this.availableChampions();
    const searchValue = this.searchControlValue();
    const roleFilterValue = this.roleFilter();
    const sortBy = this.sortBy();
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampionIds = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps].map(c => c.id);
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
  redSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  blueSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  redSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  blueSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);

  constructor(private service: MobaService) {
    const draftMetaData = this.service.getLocalStorage<DraftMetaData>('draft_metaData');
    if (draftMetaData && hasAllPropsDraftMetaData(draftMetaData)) {
      this.draftForm.setValue(draftMetaData);
    }
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    this.initiateMasteries();
  }

  get userIsRedSide(): boolean {
    return this.draftForm.get('userIsRedSide')?.value;
  }

  get patchName(): PatchName {
    return this.draftForm.get('patchName')?.value;
  }

  get useAiOpponent(): boolean {
    return this.draftForm.get('useAiOpponent')?.value;
  }

  get useRandomTeam(): boolean {
    return this.draftForm.get('useRandomTeam')?.value;
  }

  get difficulty(): 'easy' | 'medium' | 'hard' {
    return this.draftForm.get('difficulty')?.value;
  }

  get masteriesForSide(): DraftPlayer[] {
    return this.userIsRedSide ? this.redSideMasteries : this.blueSideMasteries;
  }

  get selectedRoleFilter(): Role {
    const role = this.roleFilter();
    if (role === 'all') {
      return 'top';
    } else {
      return role;
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }
  getBadgeClass(dmgType: DamageType): string {
    if (dmgType.includes('ad')) {
      return 'badge-error';
    } else if (dmgType.includes('ap')) {
      return 'badge-info';
    } else if (dmgType.includes('mix')) {
      return 'badge-primary';
    } else {
      return 'badge-accent';
    }
  }

  startDraft() {
    this.draftStarted = true;
    this.service.setLocalStorage<DraftMetaData>('draft_metaData', {
      userIsRedSide: this.userIsRedSide,
      useAiOpponent: this.useAiOpponent,
      difficulty: this.difficulty,
      patchName: this.patchName,
      useRandomTeam: this.useRandomTeam,
    });
    this.initiateMasteries();
    console.log(this.difficulty);
    console.log('blueSide', this.blueSideMasteries, '\nredSide', this.redSideMasteries);
    console.log('blueSide', this.blueSidePlayers, '\nredSide', this.redSidePlayers);
    this.checkAndStartAiTimer();
  }

  initiateMasteries() {
    const champions = Array.from(championsJson) as Champion[];
    const patchData = getPatchData(this.patchName);
    const playerMasteries: DraftPlayer[] = this.useRandomTeam ? getRandomMasteries(patchData) : [...defaultPlayerMasteries];
    const opponentMasteries: DraftPlayer[] = this.useRandomTeam
      ? getRandomMasteries(patchData, this.difficulty)
      : [...defaultOpponentMasteries];

    this.champions = getDraftChampions(champions, patchData, playerMasteries, opponentMasteries);

    this.blueSideMasteries = this.userIsRedSide ? opponentMasteries : playerMasteries;
    this.redSideMasteries = this.userIsRedSide ? playerMasteries : opponentMasteries;

    for (const player of this.blueSideMasteries) {
      this.getTopChampsForEachRole(player, true);
    }

    for (const player of this.redSideMasteries) {
      this.getTopChampsForEachRole(player, false);
    }
  }

  resetDraft() {
    this.isBlueSideChoosing.set(true);
    this.isBanPhase.set(true);
    this.draftStarted = false;
    this.draftPhase = 'Blue Ban 1';
    this.currentDraftRound = 1;
    this.aiTimer = -1;
    this.champions = [];
    this.initiateMasteries();

    this.isAiChoosing = false;

    this.blueSideDraftScores.set([]);
    this.redSideDraftScores.set([]);
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

  getChampionFromId(id: number | undefined) {
    const champion = this.champions.find(c => c.id === id);
    return champion;
  }

  selectRole(role: Role, champ: Partial<DraftChampion>, isBlueSide: boolean, index: number) {
    if ((isBlueSide && !this.userIsRedSide) || !this.useAiOpponent) {
      champ.selectedRole = role;
      const updatedChamps = [...this.blueSideChamps()];
      updatedChamps[index] = champ;
      this.blueSideChamps.set(updatedChamps);
      console.log(this.blueSideChamps().map(c => c.selectedRole));
    } else if ((!isBlueSide && this.userIsRedSide) || !this.useAiOpponent) {
      champ.selectedRole = role;
      const updatedChamps = [...this.redSideChamps()];
      updatedChamps[index] = champ;
      this.redSideChamps.set(updatedChamps);
      console.log(this.redSideChamps().map(c => c.selectedRole));
    }
    for (const filteredChamp of this.filteredChampions()) {
      this.setSynergyScore(filteredChamp);
      this.setCounterScore(filteredChamp);
    }

    // this should
    // if (isBlueSide) {
    //   this.blueSideDraftScores.update(arr => {
    //     const newArr = [...arr];
    //     newArr.splice(index, 1, this.getPickScore(champ as DraftChampion));
    //     // console.log()
    //     return newArr;
    //   });
    // } else {
    //   this.redSideDraftScores.update(arr => {
    //     const newArr = [...arr];
    //     newArr[index] = this.getPickScore(champ as DraftChampion);
    //     return newArr;
    //   });
    // }
    console.log('blueside scores', this.blueSideDraftScores(), 'redside scores', this.redSideDraftScores());
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
      currentSelectedChamps = this.redSideChamps();
    } else {
      currentSelectedChamps = this.blueSideChamps();
    }

    currentSelectedChamps = currentSelectedChamps.filter(c => !c.isPlaceholder);
    if (currentSelectedChamps.length < 1) {
      return TierValue.F;
    }
    const compStats = getTeamCompStyleScoring(currentSelectedChamps as DraftChampion[]);

    const teamSynergy = compareCompStyle(compStats, evaluatedChamp, currentSelectedChamps.length);
    console.log(teamSynergy);
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
      currentSelectedChamps = this.blueSideChamps();
    } else {
      currentSelectedChamps = this.redSideChamps();
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
      const pickedChampRoles = this.blueSideChamps().map(c => c.selectedRole);
      const availableRoles = checkForAvailableRoles(pickedChampRoles);
      // console.log(availableRoles);
      // if any of the availableRoles is in the currentChamp's roles then it can be returned as normal
      if (!availableRoles.some(r => champ.roles.includes(r))) {
        return TierValue.F;
      }
    } else if (this.draftPhase.includes('Blue Ban') || this.draftPhase.includes('Red Pick')) {
      // When blue team is banning or red team is picking
      // if champ has only one role and the same role as one of the selected redSideChamps return 0
      const pickedChampRoles = this.redSideChamps().map(c => c.selectedRole);
      const availableRoles = checkForAvailableRoles(pickedChampRoles);
      // console.log(availableRoles);
      // if any of the availableRoles is in the currentChamp's roles then it can be returned as normal
      if (!availableRoles.some(r => champ.roles.includes(r))) {
        return 0;
      }
    }
    return true;
  }

  getTopChampsInMeta(masteries: TierListRankings, role: Role): DraftChampion[] {
    const patchTierList = getPatchData(this.patchName).patchTierList;
    const masteredChamps = [...masteries.s, ...masteries.a, ...masteries.b, ...masteries.c];
    const metaChamps = [...patchTierList[role].s, ...patchTierList[role].a, ...patchTierList[role].b];
    const mainChamps = masteredChamps.filter(id => metaChamps.includes(id)).map(id => this.getChampionFromId(id));
    const filteredChamps: DraftChampion[] = [...mainChamps].filter((champ): champ is DraftChampion => !!champ);
    return filteredChamps.slice(0, 3);
  }

  getTopChampsForEachRole(player: DraftPlayer, isBlueSide: boolean) {
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
      const selectedRoles = this.blueSideChamps()
        .filter(c => c.selectedRole)
        .map(c => c.selectedRole as Role);
      champOptions = [...this.availableChampions().filter(c => !selectedRoles.includes(c.selectedRole))];
    } else if (!this.userIsRedSide && redSidePickRounds.includes(this.currentDraftRound)) {
      // if AI is Red Side and is currently picking a champ
      const selectedRoles = this.redSideChamps()
        .filter(c => c.selectedRole)
        .map(c => c.selectedRole as Role);
      champOptions = [...this.availableChampions().filter(c => !selectedRoles.includes(c.selectedRole))];
    } else {
      champOptions = [...this.availableChampions()]; // this will return all champions
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
        const arr = [...this.redSideBans()];
        const index = redSideBanRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.redSideBans.set(arr);
        this.callNotification(`Red side has banned ${champ.name}.`, 'red');
      } else {
        const arr = [...this.blueSideBans()];
        const index = blueSideBanRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideBans.set(arr);
        this.callNotification(`Blue side has banned ${champ.name}.`, 'blue');
      }
    } else if (firstPickPhase || secondPickPhase) {
      // PICKS
      // red chooses on 8, 9, 12, 17, 20
      // blue chooses on 7, 10, 11, 18, 19

      const isRed = redSidePickRounds.includes(this.currentDraftRound);
      if (isRed) {
        const arr = [...this.redSideChamps()];
        const index = redSidePickRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.redSideDraftScores.set([...this.redSideDraftScores(), draftPickScore]);
        this.redSideChamps.set(arr);
        this.callNotification(`Red side has chosen ${champ.name}.`, `'red'`);
        console.log(`Red side has chosen ${champ.name}.`, `With a score of ${draftPickScore}/20`);
      } else {
        const arr = [...this.blueSideChamps()];
        const index = blueSidePickRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideDraftScores.set([...this.blueSideDraftScores(), draftPickScore]);
        this.blueSideChamps.set(arr);
        this.callNotification(`Blue side has chosen ${champ.name}.`, 'blue');
        console.log(`Blue side has chosen ${champ.name}.`, `With a score of ${draftPickScore}/20`);
      }
    }
    console.log(this.blueSideDraftScores(), this.redSideDraftScores());
    this.currentDraftRound++;
    this.checkPickPhase();
    this.checkAndStartAiTimer();
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

  getCompositionAdvice(isBlueSide: boolean): string[] {
    return getCompositionAdviceAndGrade(
      isBlueSide,
      this.blueSideChamps,
      this.redSideChamps,
      this.blueSideDraftScores,
      this.redSideDraftScores
    );
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
}
