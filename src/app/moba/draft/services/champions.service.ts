import { Injectable } from '@angular/core';
import { DraftService } from './draft.service';

@Injectable()
export class ChampionsService {
  constructor(private service: DraftService) {}
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

  getChampionFromId(id?: number) {
    const champion = this.draftChampions().find(c => c.id === id);
    return champion;
  }

  /**
   * Initializes the player and opponent masteries and draft champions based on the provided draft metadata.
   *
   * @param {DraftMetaData} param0 - An object containing metadata for the draft, including:
   *   - useRandomTeam: A boolean indicating whether to use randomly generated teams.
   *   - patchData: The patch data containing tier lists and other relevant information.
   *   - userIsRedSide: A boolean indicating whether the user is on the red side.
   *   - difficulty: The difficulty level for generating random masteries, applicable if useRandomTeam is true.
   *
   * This function sets up the draft champions and assigns masteries and top champions for each role
   * based on the user's side and whether random teams are used.
   */
  initiateMasteries({ useRandomTeam, patchData, userIsRedSide, difficulty }: DraftMetaData) {
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

  selectRole(role: Role, champ: Partial<DraftChampion>, isBlueSide: boolean, index: number) {
    if ((isBlueSide && !this.userIsRedSide) || !this.useAiOpponent) {
      champ.selectedRole = role;
      const updatedChamps = [...this.service.blueSideChamps()];
      updatedChamps[index] = champ;
      this.service.blueSideChamps.set(updatedChamps);
      console.log(this.service.blueSideChamps().map(c => c.selectedRole));
    } else if ((!isBlueSide && this.userIsRedSide) || !this.useAiOpponent) {
      champ.selectedRole = role;
      const updatedChamps = [...this.service.redSideChamps()];
      updatedChamps[index] = champ;
      this.service.redSideChamps.set(updatedChamps);
      console.log(this.service.redSideChamps().map(c => c.selectedRole));
    }
    for (const filteredChamp of this.filteredChampions()) {
      this.setSynergyScore(filteredChamp);
      this.setCounterScore(filteredChamp);
    }
    if (isBlueSide) {
      this.blueSideDraftScores.update(arr => {
        const newArr = [...arr];
        newArr.splice(index, 1, this.getPickScore(champ as DraftChampion));
        // console.log()
        return newArr;
      });
    } else {
      this.redSideDraftScores.update(arr => {
        const newArr = [...arr];
        newArr[index] = this.getPickScore(champ as DraftChampion);
        return newArr;
      });
    }
  }
}
