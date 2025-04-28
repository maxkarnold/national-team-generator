import { Component, input } from '@angular/core';
import { DraftChampion } from '../draft.model';
import { Role } from 'app/moba/player-draft/player/player.model';
import { DraftService } from '../services/draft.service';
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
  constructor(private service: DraftService) {}

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
}
