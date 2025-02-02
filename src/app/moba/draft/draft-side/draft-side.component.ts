import { Component, input } from '@angular/core';
import { DraftChampion } from '../draft.model';
import { Role } from 'app/moba/player-draft/player/player.model';
import { DraftService } from '../draft.service';
import { DamageType } from 'app/moba/champion/champion.model';

@Component({
  selector: 'app-draft-side',
  templateUrl: './draft-side.component.html',
  styleUrl: './draft-side.component.scss',
})
export class DraftSideComponent {
  draftPicks = input.required<Partial<DraftChampion>[]>();
  draftBans = input.required<Partial<DraftChampion>[]>();
  draftSide = input.required<'blue' | 'red'>();
  constructor(public service: DraftService) {}

  getChampionFromId(id?: number): DraftChampion | undefined {
    return this.service.getChampionFromId(id);
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

  selectRole(role: Role, champ: Partial<DraftChampion>, isBlueSide: boolean, index: number) {
    // if ((isBlueSide && !this.userIsRedSide) || !this.useAiOpponent) {
    //   champ.selectedRole = role;
    //   const updatedChamps = [...this.service.blueSideChamps()];
    //   updatedChamps[index] = champ;
    //   this.service.blueSideChamps.set(updatedChamps);
    //   console.log(this.service.blueSideChamps().map(c => c.selectedRole));
    // } else if ((!isBlueSide && this.userIsRedSide) || !this.useAiOpponent) {
    //   champ.selectedRole = role;
    //   const updatedChamps = [...this.service.redSideChamps()];
    //   updatedChamps[index] = champ;
    //   this.service.redSideChamps.set(updatedChamps);
    //   console.log(this.service.redSideChamps().map(c => c.selectedRole));
    // }
    // for (const filteredChamp of this.filteredChampions()) {
    //   this.setSynergyScore(filteredChamp);
    //   this.setCounterScore(filteredChamp);
    // }
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
  }
}
