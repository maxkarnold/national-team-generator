import { Component, input } from '@angular/core';
import { DraftChampion, PatchData, TierListRankings } from '../../draft.model';
import { DraftService } from '../../services/draft.service';
import { Role } from 'app/moba/player-draft/player/player.model';

@Component({
  selector: 'app-draft-start-table',
  templateUrl: './draft-start-table.component.html',
  styleUrl: './draft-start-table.component.scss',
  host: {
    '(window:resize)': 'getScreenSize($event)',
  },
})
export class DraftStartTableComponent {
  userIsRedSide = input.required<boolean>();
  patchData = input.required<PatchData>();
  screenWidth = window.innerWidth;

  redSideMasteries;
  blueSideMasteries;

  constructor(private service: DraftService) {
    this.redSideMasteries = this.service.redSideMasteries;
    this.blueSideMasteries = this.service.blueSideMasteries;
    console.log(this.redSideMasteries, this.blueSideMasteries);
  }

  getScreenSize(_event: unknown) {
    this.screenWidth = window.innerWidth;
  }

  getChampionFromId(id?: number): DraftChampion | undefined {
    return this.service.getChampionFromId(id);
  }

  getTopChampsInMeta(masteries: TierListRankings, role: Role): DraftChampion[] {
    const patchTierList = this.patchData().patchTierList;
    const masteredChamps = [...masteries.s, ...masteries.a];
    const metaChamps = [...patchTierList[role].s, ...patchTierList[role].a, ...patchTierList[role].b];
    const mainChamps = masteredChamps.filter(id => metaChamps.includes(id)).map(id => this.getChampionFromId(id));
    const filteredChamps: DraftChampion[] = [...mainChamps].filter((champ): champ is DraftChampion => !!champ);
    return filteredChamps.slice(0, 3);
  }
}
