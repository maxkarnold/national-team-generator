import { Component, HostListener } from '@angular/core';
import { Player, sortByMainRole } from '../player/player.model';
import { getPlayerOptions, sortMapAttributes } from '../player/player.utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  screenWidth: number;

  playerOptions: Player[] = [];
  selectedPlayers: Player[] = [];
  positions = [
    {
      name: 'top',
      url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
    },
    {
      name: 'jungle',
      url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
    },
    {
      name: 'mid',
      url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
    },
    {
      name: 'adc',
      url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
    },
    {
      name: 'support',
      url: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
    },
  ];

  constructor() {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();

    this.playerOptions = getPlayerOptions();
    console.log(this.playerOptions);
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  choosePlayer(player: Player) {
    console.log(player);
    this.selectedPlayers.push(player);
    this.selectedPlayers = sortByMainRole(this.selectedPlayers);
    if (this.selectedPlayers.length >= 5) {
      this.playerOptions = [];
    } else {
      this.playerOptions = getPlayerOptions();
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
