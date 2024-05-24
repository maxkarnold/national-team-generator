import { Component, HostListener, Signal, WritableSignal, computed, signal } from '@angular/core';
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
  CompStyleStats,
  RankedChampions,
  PatchVersion,
  patchMSI24,
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
import { AllRoles, Role } from '../player/player.model';
import { startsWithVowel } from '@shared/utils';
import { capitalize, round, sum } from 'lodash-es';

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
  champions: DraftChampion[] = [];
  headers = draftHeaders;

  draftForm: FormGroup = new FormGroup({
    patchVersion: new FormControl<PatchVersion>('MSI 24'),
    isRedSide: new FormControl<boolean>(false),
    useAiOpponent: new FormControl<boolean>({ value: false, disabled: true }),
    isRandomTeam: new FormControl<boolean>({ value: true, disabled: true }),
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
      .sort((a, b) => this.getMasteryScore(b) - this.getMasteryScore(a))
      .sort((a, b) => this.getMetaScore(b) - this.getMetaScore(a))
      .sort(this.sortChampions);
  });
  redSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  blueSideBans: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftBans]);
  redSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);
  blueSideChamps: WritableSignal<Partial<DraftChampion>[]> = signal([...emptyDraftPicks]);

  constructor() {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    const champions = Array.from(championsJson) as Champion[];
    const playerMasteries: DraftPlayer[] = this.isRandomTeam ? getRandomMasteries() : [...defaultPlayerMasteries];
    const opponentMasteries: DraftPlayer[] = this.isRandomTeam ? getRandomMasteries() : [...defaultOpponentMasteries];
    this.champions = getDraftChampions(champions, this.patchVersion, playerMasteries, opponentMasteries);

    this.blueSideMasteries = this.isRedSide ? opponentMasteries : playerMasteries;
    this.redSideMasteries = this.isRedSide ? playerMasteries : opponentMasteries;
    console.log(this.blueSideMasteries);
    console.log(this.redSideMasteries);

    for (const player of this.blueSideMasteries) {
      this.getTopChampsForEachRole(player, true);
    }

    for (const player of this.redSideMasteries) {
      this.getTopChampsForEachRole(player, false);
    }
  }

  get isRedSide(): boolean {
    return this.draftForm.get('isRedSide')?.value;
  }

  get patchVersion(): PatchVersion {
    return this.draftForm.get('patchVersion')?.value;
  }

  get useAiOpponent(): boolean {
    return this.draftForm.get('useAiOpponent')?.value;
  }

  get isRandomTeam(): boolean {
    return this.draftForm.get('isRandomTeam')?.value;
  }

  get masteriesForSide(): DraftPlayer[] {
    return this.isRedSide ? this.redSideMasteries : this.blueSideMasteries;
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  getChampionFromId(id: number | undefined) {
    const champion = this.champions.find(c => c.id === id);
    return champion;
  }

  selectRole(role: Role, champ: Partial<DraftChampion>, isBlueSide: boolean, index: number) {
    champ.selectedRole = role;
    if (isBlueSide) {
      const updatedChamps = [...this.blueSideChamps()];
      updatedChamps[index] = champ;
      this.blueSideChamps.set(updatedChamps);
    } else {
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

  getMasteryScore(champ: DraftChampion, specificRole?: Role) {
    const ratings = getChampMasteries(champ, this.draftPhase, this.currentDraftRound, this.isRedSide);
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
    return Math.max(...metaStrength);
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
    const avg = (mastery * 0.6 + metaStrength * 1.4) / 2;
    return avg;
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

  startDraft() {
    console.log('start draft');
    this.draftStarted = true;

    console.log('blueSide', this.blueSideMasteries, '\nredSide', this.redSideMasteries);
    console.log('blueSide', this.blueSidePlayers, '\nredSide', this.redSidePlayers);
  }

  chooseChampion(champ: DraftChampion) {
    if (this.currentDraftRound > 20) {
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
        this.redSideDraftScores.push(draftPickScore);
        this.redSideChamps.set(arr);
      } else {
        const arr = [...this.blueSideChamps()];
        const index = blueSidePicks.indexOf(this.currentDraftRound);
        arr[index] = champ;
        this.blueSideDraftScores.push(draftPickScore);
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
      // advice.push(`This draft scores ${startsWithVowel(finalGrade) || finalGrade[0] === 'S' ? 'an' : 'a'} ${finalGrade} grade.`);
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
