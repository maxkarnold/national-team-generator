import { Injectable } from '@angular/core';
import { DraftService } from './draft.service';

@Injectable()
export class StateService {
  constructor(private service: DraftService) {}

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
