import { Component, computed, signal, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { positionFilters, Role } from 'app/moba/player-draft/player/player.model';
import { DraftSortHeader, DraftChampion, Proficiency, LetterRank } from '../draft.model';
import { DraftService } from '../services/draft.service';

@Component({
  selector: 'app-draft-selection',
  templateUrl: './draft-selection.component.html',
  styleUrl: './draft-selection.component.scss',
})
export class DraftSelectionComponent {
  searchControl = new FormControl<string>('');
  searchControlValue = toSignal(this.searchControl.valueChanges);
  roleFilter: WritableSignal<Role | 'all'> = signal('all');
  sortBy: WritableSignal<DraftSortHeader> = signal('meta');
  positionFilters = positionFilters;

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

  constructor(private service: DraftService) {}

  get selectedRoleFilter(): Role {
    const role = this.roleFilter();
    if (role === 'all') {
      return 'top';
    } else {
      return role;
    }
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
