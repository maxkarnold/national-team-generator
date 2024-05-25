import { Component, HostListener, Signal, WritableSignal, computed, signal } from '@angular/core';
import * as championsJson from 'assets/json/moba/champions.json';
import { Champion } from '../champion/champion.model';
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
  CompStyleStats,
  RankedChampions,
  PatchVersion,
  patchMSI24,
  getRoleFromFilter,
} from './draft.model';
import {
  checkForAvailableRoles,
  getDraftChampions,
  getRandomMasteries,
  getTeamCompStyleScoring,
  needsMoreDmgAdvice,
  needsMoreScalingAdvice,
  getChampMasteries,
} from './draft.utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { AllRoles, Role, positionFilters } from '../player/player.model';
import { startsWithVowel } from '@shared/utils';
import { capitalize, round, shuffle, sum } from 'lodash-es';
import { MobaService } from '../moba.service';

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
  positionFilters = positionFilters;
  notification = {
    isActive: false,
    message: '',
    type: 'success',
  };
  isAiChoosing = false;
  // maybe should clean this up
  blueSideBanRounds = blueSideBanRounds;
  redSideBanRounds = redSideBanRounds;
  blueRounds = [...blueSideBanRounds, ...blueSidePickRounds];
  redRounds = [...redSideBanRounds, ...redSidePickRounds];

  draftForm: FormGroup = new FormGroup({
    patchVersion: new FormControl<PatchVersion>('MSI 24'),
    userIsRedSide: new FormControl<boolean>(false),
    useAiOpponent: new FormControl<boolean>(false),
    useRandomTeam: new FormControl<boolean>({ value: true, disabled: true }),
  });

  blueSideDraftScores: number[] = [];
  redSideDraftScores: number[] = [];
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

  filteredChampions: Signal<DraftChampion[]> = computed(() => {
    const redBans = this.redSideBans();
    const blueBans = this.blueSideBans();
    const redSideChamps = this.redSideChamps();
    const blueSideChamps = this.blueSideChamps();
    const selectedChampions = [...redBans, ...blueBans, ...redSideChamps, ...blueSideChamps];
    const searchValue = this.searchControlValue();
    const roleFilterValue = this.roleFilter();
    return this.champions
      .filter(c => {
        const defaultChamps = !selectedChampions.includes(c);
        if (!searchValue && roleFilterValue === 'all') {
          return defaultChamps;
        }
        if (searchValue && roleFilterValue === 'all') {
          return defaultChamps && c.name.toLowerCase().includes(searchValue.toLowerCase());
        }

        if (roleFilterValue !== 'all' && !searchValue) {
          return defaultChamps && c.roles.includes(roleFilterValue);
        }

        if (roleFilterValue !== 'all' && searchValue) {
          return defaultChamps && c.roles.includes(roleFilterValue) && c.name.toLowerCase().includes(searchValue.toLowerCase());
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => this.getDisplayMasteryScore(b) - this.getDisplayMasteryScore(a))
      .sort((a, b) => this.getDisplayMetaScore(b) - this.getDisplayMetaScore(a));
  });
  redSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  blueSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  redSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  blueSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);

  constructor(private service: MobaService) {
    const draftMetaData = this.service.getLocalStorage<{
      userIsRedSide: boolean;
      patchVersion: PatchVersion;
      useAiOpponent: boolean;
      useRandomTeam: boolean;
    }>('draft_metaData');
    if (draftMetaData) {
      this.draftForm.setValue(draftMetaData);
    }
    this.screenWidth = window.innerWidth;
    this.getScreenSize();

    const champions = Array.from(championsJson) as Champion[];
    const playerMasteries: DraftPlayer[] = this.useRandomTeam ? getRandomMasteries() : [...defaultPlayerMasteries];
    const opponentMasteries: DraftPlayer[] = this.useRandomTeam ? getRandomMasteries() : [...defaultOpponentMasteries];
    this.champions = getDraftChampions(champions, this.patchVersion, playerMasteries, opponentMasteries);

    this.blueSideMasteries = this.userIsRedSide ? opponentMasteries : playerMasteries;
    this.redSideMasteries = this.userIsRedSide ? playerMasteries : opponentMasteries;
    console.log(this.blueSideMasteries);
    console.log(this.redSideMasteries);

    for (const player of this.blueSideMasteries) {
      this.getTopChampsForEachRole(player, true);
    }

    for (const player of this.redSideMasteries) {
      this.getTopChampsForEachRole(player, false);
    }
  }

  get userIsRedSide(): boolean {
    return this.draftForm.get('userIsRedSide')?.value;
  }

  get patchVersion(): PatchVersion {
    return this.draftForm.get('patchVersion')?.value;
  }

  get useAiOpponent(): boolean {
    return this.draftForm.get('useAiOpponent')?.value;
  }

  get useRandomTeam(): boolean {
    return this.draftForm.get('useRandomTeam')?.value;
  }

  get masteriesForSide(): DraftPlayer[] {
    return this.userIsRedSide ? this.redSideMasteries : this.blueSideMasteries;
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  startDraft() {
    this.draftStarted = true;
    this.service.setLocalStorage('draft_metaData', {
      userIsRedSide: this.userIsRedSide,
      useAiOpponent: this.useAiOpponent,
      patchVersion: this.patchVersion,
      useRandomTeam: this.useRandomTeam,
    });

    console.log('blueSide', this.blueSideMasteries, '\nredSide', this.redSideMasteries);
    console.log('blueSide', this.blueSidePlayers, '\nredSide', this.redSidePlayers);
    this.checkAndStartAiTimer();
  }

  resetDraft() {
    this.draftStarted = false;
    this.draftPhase = 'Blue Ban 1';
    this.currentDraftRound = 1;
    this.aiTimer = -1;
    this.champions = [];
    const champions = Array.from(championsJson) as Champion[];
    const playerMasteries: DraftPlayer[] = this.useRandomTeam ? getRandomMasteries() : [...defaultPlayerMasteries];
    const opponentMasteries: DraftPlayer[] = this.useRandomTeam ? getRandomMasteries() : [...defaultOpponentMasteries];
    this.champions = getDraftChampions(champions, this.patchVersion, playerMasteries, opponentMasteries);

    this.blueSideMasteries = this.userIsRedSide ? opponentMasteries : playerMasteries;
    this.redSideMasteries = this.userIsRedSide ? playerMasteries : opponentMasteries;

    this.isAiChoosing = false;

    this.blueSideDraftScores = [];
    this.redSideDraftScores = [];
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
    } else if ((!isBlueSide && this.userIsRedSide) || !this.useAiOpponent) {
      champ.selectedRole = role;
      const updatedChamps = [...this.redSideChamps()];
      updatedChamps[index] = champ;
      this.redSideChamps.set(updatedChamps);
    }
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

  getPreciseLetterRank(rating: number): LetterRank {
    if (rating > 19) {
      return 'S+';
    }
    if (rating > 18) {
      return 'S';
    }
    if (rating > 17) {
      return 'S-';
    }
    if (rating >= 16) {
      return 'A+';
    }
    if (rating >= 15) {
      return 'A';
    }
    if (rating >= 14) {
      return 'A-';
    }
    if (rating >= 12) {
      return 'B+';
    }
    if (rating >= 11) {
      return 'B';
    }
    if (rating >= 10) {
      return 'B-';
    }
    if (rating >= 8) {
      return 'C+';
    }
    if (rating >= 7) {
      return 'C';
    }
    if (rating >= 6) {
      return 'C-';
    }
    if (rating >= 4) {
      return 'D+';
    }
    if (rating >= 3) {
      return 'D';
    }
    if (rating >= 2) {
      return 'D-';
    }
    return 'F';
  }

  sortChampions = (a: DraftChampion, b: DraftChampion) => {
    const aValue: number = this.getPickScore(a);
    const bValue: number = this.getPickScore(b);

    // Sort in descending order
    return bValue - aValue;
  };

  getDisplayMetaScore(champ: DraftChampion, specificRole?: Role) {
    if (this.roleFilter() === 'all') {
      return this.isOneRoleAvailable(champ) ? this.getMetaScore(champ, specificRole) : 0;
    }
    return this.getMetaScore(champ, this.roleFilter() as Role);
  }

  getDisplayMasteryScore(champ: DraftChampion, specificRole?: Role) {
    if (this.roleFilter() === 'all') {
      return this.isOneRoleAvailable(champ) ? this.getMasteryScore(champ, specificRole) : 0;
    }
    return this.getMasteryScore(champ, this.roleFilter() as Role);
  }

  getMasteryScore(champ: DraftChampion, specificRole?: Role) {
    const ratings = getChampMasteries(champ, this.draftPhase, this.currentDraftRound, this.userIsRedSide);
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

  getPickScore(champ: DraftChampion) {
    const mastery = this.getMasteryScore(champ);
    const metaStrength = this.getMetaScore(champ);
    if (mastery === 0) {
      return 0;
    }
    if (!this.isOneRoleAvailable(champ)) {
      return 0;
    }
    const avg = (mastery * 0.6 + metaStrength * 1.4) / 2;
    return avg;
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
        return 0;
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

  getTopChampsInMeta(masteries: RankedChampions, role: Role): DraftChampion[] {
    if (this.patchVersion !== 'MSI 24') {
      return [];
    }
    const masteredChamps = [...masteries.s, ...masteries.a];
    const metaChamps = [...patchMSI24[role].s, ...patchMSI24[role].a, ...patchMSI24[role].b];
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
    console.log(this.currentDraftRound, blueSidePickRounds, redSidePickRounds);
    console.log('isAiChoosing', this.isAiChoosing);
    if (!this.useAiOpponent || this.isAiChoosing) {
      return;
    }
    console.log('test1');
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
    // commented out for dev purposes
    // this.aiTimer += 0.5;
    this.aiTimer += 1;
  }

  chooseAiChampion() {
    let champOptions = [];
    // if AI is Blue Side and is currently picking a champ
    if (this.userIsRedSide && blueSidePickRounds.includes(this.currentDraftRound)) {
      const selectedRoles = this.blueSideChamps()
        .filter(c => c.selectedRole)
        .map(c => c.selectedRole as Role);
      champOptions = [...this.filteredChampions().filter(c => !selectedRoles.includes(c.selectedRole))];
    } else if (!this.userIsRedSide && redSidePickRounds.includes(this.currentDraftRound)) {
      // if AI is Red Side and is currently picking a champ
      const selectedRoles = this.redSideChamps()
        .filter(c => c.selectedRole)
        .map(c => c.selectedRole as Role);
      champOptions = [...this.filteredChampions().filter(c => !selectedRoles.includes(c.selectedRole))];
    } else {
      champOptions = [...this.filteredChampions()]; // this will return all champions
    }
    const draftChampion = shuffle(champOptions.slice(0, 3))[0];
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
    console.log('choose champion', this.getPickScore(champ), `Champ ID: ${champ.id}`);
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
        this.redSideDraftScores.push(draftPickScore);
        this.redSideChamps.set(arr);
        this.callNotification(`Red side has chosen ${champ.name}.`, 'red');
      } else {
        const arr = [...this.blueSideChamps()];
        const index = blueSidePickRounds.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideDraftScores.push(draftPickScore);
        this.blueSideChamps.set(arr);
        this.callNotification(`Blue side has chosen ${champ.name}.`, 'blue');
      }
    }
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
    const blueSideChamps = this.blueSideChamps().filter(c => c?.id);
    const redSideChamps = this.redSideChamps().filter(c => c?.id);
    if ((isBlueSide && blueSideChamps.length < 1) || (!isBlueSide && redSideChamps.length < 1)) {
      return ['Choose champions before receiving advice.'];
    }
    const advice: string[] = [];
    // composition advice
    // team comp should have balanced damage sources (2 low dmg of each or 1 high dmg of each type, mix would count as half, so low mix is 1/2 a low dmg and high mix is equal to low dmg)
    // team comp should have some early, mid and late game champs to be more balanced, it can be skewed but not too much
    // team comp should have attributes that fill one comp style

    const selectedTeamChamps = isBlueSide ? [...(blueSideChamps as DraftChampion[])] : [...(redSideChamps as DraftChampion[])];
    const { needsMoreEarlyChamps, needsMoreMidChamps, needsMoreLateChamps } = needsMoreScalingAdvice(selectedTeamChamps);
    const { needsMoreAdDmg, needsMoreApDmg } = needsMoreDmgAdvice(selectedTeamChamps);

    const compStyles: CompStyleStats = getTeamCompStyleScoring(selectedTeamChamps);
    const sortedComps = Object.entries(compStyles)
      .map(([a, b]) => [capitalize(a), b])
      .sort((a, b) => b[1] - a[1]);

    if (selectedTeamChamps.length === 5) {
      const scores = isBlueSide ? [...this.blueSideDraftScores] : [...this.redSideDraftScores];
      let grade = sum(scores) / 5;
      const allNegativeAdvice = [needsMoreEarlyChamps, needsMoreMidChamps, needsMoreLateChamps, needsMoreAdDmg, needsMoreApDmg];
      for (let i = 0; i < allNegativeAdvice.length; i++) {
        grade -= allNegativeAdvice[i] ? 1.5 : 0;
      }
      if (sortedComps[0][1] > 25) {
        grade += 1.5;
      } else if (sortedComps[0][1] > 30) {
        grade += 3;
      }
      advice.push(`This draft scores ${round(grade, 1)} of 20.`);
    }

    if (needsMoreAdDmg) {
      advice.push('You need more AD damage sources.');
    }
    if (needsMoreApDmg) {
      advice.push('You need more AP damage sources.');
    }

    if (selectedTeamChamps.length < 3) {
      advice.push(`Your team is most suited to ${startsWithVowel(sortedComps[0][0]) ? 'an' : 'a'} ${sortedComps[0][0]} composition.`);
      return advice;
    }

    if (needsMoreEarlyChamps) {
      advice.push('Your team lacks Early game capability.');
    }
    if (needsMoreMidChamps) {
      advice.push('Your team lacks Mid game capability.');
    }
    if (needsMoreLateChamps) {
      advice.push('Your team lacks Late game capability.');
    }
    advice.push(`Your team is most suited to ${startsWithVowel(sortedComps[0][0]) ? 'an' : 'a'} ${sortedComps[0][0]} composition. `);
    advice.push(`A secondary option would be ${startsWithVowel(sortedComps[1][0]) ? 'an' : 'a'} ${sortedComps[1][0]} composition.`);
    return advice;
  }
}
