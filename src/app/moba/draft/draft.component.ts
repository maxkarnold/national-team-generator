import { Component } from '@angular/core';
import * as champions from 'assets/json/moba/champions.json';
import { Champion } from '../champion/champion.model';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
})
export class DraftComponent {
  champions: Champion[];

  constructor(){
    this.champions = champions as Champion[];
  }


}
