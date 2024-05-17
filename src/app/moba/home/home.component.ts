import { Component, HostListener } from '@angular/core';
import { Player, positions, sortByMainRole } from '../player/player.model';
import { getCurrentRoles, getPlayerOptions, sortMapAttributes } from '../player/player.utils';
import { LeagueName, MobaRegion, regions as mobaRegions } from '../region/region.model';
import { FormControl, FormGroup } from '@angular/forms';
import { MobaService } from '../moba.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  screenWidth: number;
  form: FormGroup = new FormGroup({
    selectedRegion: new FormControl<LeagueName>(mobaRegions[0].leagueName),
  });

  getPlayerOptions = getPlayerOptions;
  playerOptions: Player[] = [];
  selectedPlayers: Player[] = [];
  positions = positions;
  regions = mobaRegions;
  previousRegion: LeagueName = mobaRegions[0].leagueName;

  constructor(private service: MobaService) {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();

    const selectedRegion = service.getLocalStorage<MobaRegion>('moba_region');
    const playerOptions = service.getLocalStorage<Player[]>('moba_player_options');
    const selectedPlayers = service.getLocalStorage<Player[]>('moba_selected_players');
    if (selectedRegion) {
      this.form.patchValue({ selectedRegion: selectedRegion.leagueName }, { emitEvent: false });
    }
    if (playerOptions) {
      this.playerOptions = playerOptions;
    } else {
      this.playerOptions = getPlayerOptions(selectedRegion || mobaRegions[0]);
    }

    if (selectedPlayers) {
      this.selectedPlayers = selectedPlayers;
    }
    console.log(this.positions);

    this.service.setLocalStorage('moba_region', selectedRegion || mobaRegions[0]);
    this.form.get('selectedRegion')?.valueChanges.subscribe((region: LeagueName) => {
      this.onRegionChange(region);
    });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  resetPlayerOptions() {
    this.selectedPlayers = [];
    const region = this.regions.find(r => r.leagueName === this.form.get('selectedRegion')?.value) as MobaRegion;
    this.playerOptions = getPlayerOptions(region);
    this.service.setLocalStorage('moba_region', region);
    this.service.setLocalStorage('moba_player_options', this.playerOptions);
    this.service.removeLocalStorage('moba_selected_players');
  }

  onRegionChange(abbrev: LeagueName) {
    if (this.selectedPlayers.length > 0) {
      const confirmChange = window.confirm('Are you sure? Changing the region will reset your team selection.');
      if (confirmChange) {
        this.resetPlayerOptions();
      } else {
        // User canceled, revert to previous region
        this.form.patchValue({ selectedRegion: this.previousRegion }, { emitEvent: false });
      }
    } else {
      const region = this.regions.find(r => r.leagueName === abbrev) as MobaRegion;
      this.playerOptions = getPlayerOptions(region);
      this.service.setLocalStorage('moba_region', region);
      this.service.setLocalStorage('moba_player_options', this.playerOptions);
    }
    this.previousRegion = this.form.get('selectedRegion')?.value;
  }

  choosePlayer(player: Player) {
    console.log(player);
    this.selectedPlayers.push(player);
    this.selectedPlayers = sortByMainRole(this.selectedPlayers);
    this.selectedPlayers = getCurrentRoles(this.selectedPlayers);
    if (this.selectedPlayers.length >= 5) {
      this.playerOptions = [];
    } else {
      const region = this.regions.find(r => r.leagueName === this.form.get('selectedRegion')?.value) as MobaRegion;
      this.playerOptions = getPlayerOptions(region, this.selectedPlayers);
    }
    this.service.setLocalStorage('moba_selected_players', this.selectedPlayers);
  }

  getTopThreeAttributes(player: Player): string[] {
    const topAttributes: string[] = [];
    const map = sortMapAttributes(player.attributes);
    for (let i = 0; i < 3; i++) {
      const attr = Array.from(map.keys())[i].replaceAll('_', ' ');
      topAttributes.push(attr);
    }
    return topAttributes;
  }
}
