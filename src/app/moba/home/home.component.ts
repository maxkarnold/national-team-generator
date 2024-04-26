import { Component, HostListener } from '@angular/core';
import { Player, positions, sortByMainRole } from '../player/player.model';
import { getPlayerOptions, sortMapAttributes } from '../player/player.utils';
import { MobaRegion, RegionAbbrev, regions as mobaRegions } from '../team/team.model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  screenWidth: number;
  form: FormGroup = new FormGroup({
    selectedRegion: new FormControl<RegionAbbrev>(mobaRegions[0].regionAbbrev),
  });

  getPlayerOptions = getPlayerOptions;
  playerOptions: Player[] = [];
  selectedPlayers: Player[] = [];
  positions = positions;
  regions = mobaRegions;
  previousRegion: RegionAbbrev = mobaRegions[0].regionAbbrev;

  constructor() {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();

    this.playerOptions = getPlayerOptions(mobaRegions[0]);

    this.form.get('selectedRegion')?.valueChanges.subscribe((region: RegionAbbrev) => {
      this.onRegionChange(region);
    });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  resetPlayerOptions() {
    this.selectedPlayers = [];
    const region = this.regions.find(r => r.regionAbbrev === this.form.get('selectedRegion')?.value) as MobaRegion;
    this.playerOptions = getPlayerOptions(region);
  }

  onRegionChange(abbrev: RegionAbbrev) {
    if (this.selectedPlayers.length > 0) {
      const confirmChange = window.confirm('Are you sure? Changing the region will reset your team selection.');
      if (confirmChange) {
        this.resetPlayerOptions();
      } else {
        // User canceled, revert to previous region
        this.form.patchValue({ selectedRegion: this.previousRegion }, { emitEvent: false });
      }
    } else {
      const region = this.regions.find(r => r.regionAbbrev === abbrev) as MobaRegion;
      this.playerOptions = getPlayerOptions(region);
    }
    this.previousRegion = this.form.get('selectedRegion')?.value;
  }

  choosePlayer(player: Player) {
    console.log(player);
    this.selectedPlayers.push(player);
    this.selectedPlayers = sortByMainRole(this.selectedPlayers);
    if (this.selectedPlayers.length >= 5) {
      this.playerOptions = [];
    } else {
      const region = this.regions.find(r => r.regionAbbrev === this.form.get('selectedRegion')?.value) as MobaRegion;
      this.playerOptions = getPlayerOptions(region, this.selectedPlayers);
    }
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
