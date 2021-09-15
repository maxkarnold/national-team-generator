import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Player } from '../../models/player';
import { LastName } from 'src/app/models/last-name';
import { FirstName } from 'src/app/models/first-name';
import * as nationsModule from '../../data/nations.json';
import * as positionsModule from '../../data/positions.json';
import * as pitchPositionsModule from '../../data/pitchPositions.json';

import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import{ CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  playerCount = 0;
  players: Player[] = [];
  sortedData: Player[];
  pitchPlayers: Player[];

  shirtIcon = '../../../assets/img/shirt-icon.jpg';

  lastName$!: Observable<LastName[]>;
  firstName$!: Observable<FirstName[]>;
  
  positions: any = (positionsModule as any).default;
  pitchPositions: any = (pitchPositionsModule as any).default;

  nations: any = (nationsModule as any).default;

  playersLoaded = false;


  constructor(private afs: FirestoreService) {
    this.sortedData = this.players;
    this.pitchPlayers = [];
   }

  ngOnInit(): void {
  }

  sortData(sort: Sort) {
    const data = this.players;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.lastName, b.lastName, isAsc);
        case 'pos': return compare(a.position, b.position, isAsc);
        case 'alt_pos': return compare(a.altPositions[0], b.altPositions[0], isAsc);
        case 'foot': return compare(a.foot, b.foot, isAsc);
        case 'rating': return compare(a.rating, b.rating, isAsc);
        default: return 0;
      }
    });
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // let oldTarget = this.players[event.previousIndex];
      // this.players[event.previousIndex] = this.players[event.currentIndex];
      // this.players[event.currentIndex] = oldTarget;
    } 
    else if (event.previousContainer.id === "cdk-drop-list-24") {
      let starterCount = 0;
      // Check for 11 players in starting lineup
      for (const player of this.pitchPlayers) {
        if (player !== undefined) {
          if (starterCount > 11) {
            return new Error("Only allowed to have 11 players in starting lineup")
          }
        } 
      }
      let playerIndex = event.previousIndex;
      let playerObj = event.previousContainer.data[playerIndex];

      let positionIndex = Number(event.container.element.nativeElement.classList[2]);

      switch (positionIndex) {
        case 0:
          playerObj.pitchPosition = "GK";
          break;
        case 1:
          playerObj.pitchPosition = "DR";
          break;
        case 2:
          playerObj.pitchPosition = "DCR";
          break;
        case 3:
          playerObj.pitchPosition = "DC";
          break;
        case 4:
          playerObj.pitchPosition = "DCL";
        break;
        case 5:
          playerObj.pitchPosition = "DL";
          break;
        case 6:
          playerObj.pitchPosition = "WBR";
          break;
        case 7:
          playerObj.pitchPosition = "DMR";
          break;
        case 8:
          playerObj.pitchPosition = "DMC";
          break;
        case 9:
          playerObj.pitchPosition = "DML";
          break;
        case 10:
          playerObj.pitchPosition = "WBL";
          break;
        case 11:
          playerObj.pitchPosition = "MR";
          break;
        case 12:
          playerObj.pitchPosition = "MCR";
          break;
        case 13:
          playerObj.pitchPosition = "MC";
          break;
        case 14:
          playerObj.pitchPosition = "MCL";
          break;
        case 15:
          playerObj.pitchPosition = "ML";
          break;
        case 16:
          playerObj.pitchPosition = "AMR";
          break;
        case 17:
          playerObj.pitchPosition = "AMCR";
          break;
        case 18:
          playerObj.pitchPosition = "AMC";
          break;
        case 19:
          playerObj.pitchPosition = "AMCL";
          break;
        case 20:
          playerObj.pitchPosition = "AML";
          break;
        case 21:
          playerObj.pitchPosition = "FR";
          break;
        case 22:
          playerObj.pitchPosition = "FC";
          break;
        case 23:
          playerObj.pitchPosition = "FL";
          break;
        default:
          console.log("Error: Check line 165 in home.component.ts");
          break;
      }
      let firstInitial = playerObj.firstName.slice(0, 1);
      playerObj.firstInitial = firstInitial;
      this.pitchPlayers.push(playerObj);
      this.players.splice(playerIndex, 1);
      event.container.element.nativeElement.innerHTML = `<div>${playerObj.firstInitial}. ${playerObj.lastName} ${playerObj.rating} <span>${playerObj.pitchPosition}</span></div>`;
      event.container.element.nativeElement.classList.remove("pos-box");
      event.container.element.nativeElement.children[0].className += "player-box";
      event.container.element.nativeElement.children[0].children[0].className += "pitch-card-pos";
      starterCount++;
      console.log(event.container);
      console.log("pitch players:\n", this.pitchPlayers);
    }
    
  }


  

  getPlayers() {
    // RESETS
    console.log("New set of players!")
    this.playerCount = 0;
    this.players = [];
    this.sortedData = [];
    this.pitchPlayers = [];
    for (let index in this.positions) {
      this.positions[index].amount = 0;
    }
    let nation = "any";

    // S Tier
    let numArray = [4, 8, 8, 14, 10, 20, 15, 30, 25, 35];

    let first = this.afs.getRandomInt(numArray[0], numArray[1]);
    let second = this.afs.getRandomInt(numArray[2], numArray[3]);
    let third = this.afs.getRandomInt(numArray[4], numArray[5]);
    let fourth = this.afs.getRandomInt(numArray[6], numArray[7]);
    let fifth = this.afs.getRandomInt(numArray[8], numArray[9]);

    
    // Loops 60 times for 60 players
    while (this.playerCount < 60) {
      let player: Player = {
        firstName: '',
        lastName: '',
        position: '',
        altPositions: [],
        rating: 0,
        foot: ''
      };
      player.position = this.getPosition();
      player.foot = this.getFoot(player.position);
      player.altPositions = this.getAltPositions(player.position, player.foot);
      for (let i = 0; i < player.altPositions.length - 1; i++) {
        player.altPositions[i] += ", ";
      }
      if (player.altPositions.length < 1) {
        // player.altPositions = "";
      }
      player.rating = this.getRating(this.playerCount, first, second, third, fourth, fifth);
      
      this.afs.getFirstName(nation)?.subscribe((firstNameArr) => { 
        let firstNameObj: any = firstNameArr[0];
        player.firstName = firstNameObj.name;
      });

      this.afs.getLastName(nation)?.subscribe((lastNameArr) => { 
        let lastNameObj: any = lastNameArr[0];
        player.lastName = lastNameObj.name;
      });
      

      this.players.push(player);
      this.sortedData.push(player);
      this.playerCount++;

      // let playerPlus = {
      //   ...player,

      // }
    }
    console.log(this.players);
  }

  getPosition() {
    let randomPos = this.afs.getRandomInt(0, 13);
    if (this.playerCount === 59 && this.positions[0].amount < 3) {
      randomPos = 0;
    }
    // If there are 7 players in a certain position, choose a different position that doesn't have 7
    else if (this.positions[randomPos].amount > 6 || this.positions[0].amount > 3) {
        let oldPos = randomPos;
        // Prioritize 4 GKs
        if (this.positions[0].amount < 4) {
            randomPos = 0;
        }
        // Then prioritize 3 CBs
        else if (this.positions[3].amount < 3) {
            randomPos = 3;
        }
        // Then prioritize 2 STs
        else if (this.positions[13].amount < 2) {
            randomPos = 13;
        }
        // Then priortize 3 CMs
        else if (this.positions[7].amount < 3) {
            randomPos = 7;
        }
        // Otherwise add to any position
        else { 
            for (let j = 0; j < this.positions.length; j++) {
                if (this.positions[randomPos].amount > 5) {
                    randomPos = this.afs.getRandomInt(0, 13);
                }
            }
        }
        
    }
    this.positions[randomPos].amount++
    return this.positions[randomPos].position;
  }

  getFoot(mainPos: string) {
    let num = this.afs.getRandomInt(1, 100);
    switch (mainPos) {
      case 'GK':
      case 'CB':
      case 'DM':
      case 'MC':
      case 'AMC':
      case 'ST':
          if (num < 76.5) { return 'right' } 
          else if (num < 96) { return 'left' }
          else { return 'either' }
      case 'AML':
      case 'ML':
          if (num < 50) { return 'left' }
          else if (num < 96) { return 'right' }
          else {return 'either' }
      case 'LB':
      case 'LWB':
          if (num < 75) {return 'left'}
          else if (num < 96) {return 'right'}
          else {return 'either'}
      case 'AMR':
      case 'MR':
          if (num < 70) {return 'right'}
          else if (num < 96) {return 'left'}
          else {return 'either'}
      case 'RB':
      case 'RWB':
          if (num < 96) {return 'right'}
          else {return 'either'}
      
      default:
          console.log('Error in the function getPlayerFoot()');
          return 'Error with getFoot(), check console';
    }
  }

  getAltPositions(mainPos: string, mainFoot: string) {
    let altPosCount = this.afs.getRandomInt(1, 3);
    let altPos: string[] = [];
    let arr: string[];
    let num: number;
    let max: number;

    switch (mainPos) {
      case 'GK':
        altPos = ['N/A'];
        break;
      case 'CB':
        arr = ['DM', 'RB', 'LB'];
        num = this.afs.getRandomInt(0, 2);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'LB':
        arr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'RB':
        arr = ['CB', 'MR', 'RWB', 'LB', 'DM', 'MC'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'LWB':
        arr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'RWB':
        arr = ['RB', 'MR', 'LWB', 'AMR', 'MC', 'DM'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'MR':
        arr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'ML':
        arr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'AMR':
        arr = ['AML', 'AMC', 'ST'];
        
        if (mainFoot === 'right') {
          arr.push('MR', 'RWB');
          max = 4;
        } else if (mainFoot === 'left') {
          arr.push('ML' , 'LWB');
          max = 4;
        } else {
          arr.push('MR', 'ML', 'RWB', 'LWB');
          max = 6;
        }
        num = this.afs.getRandomInt(0, max);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'AML':
        arr = ['AMR', 'AMC', 'ST'];
        
        if (mainFoot === 'right') {
          arr.push('MR', 'RWB');
          max = 4;
        } else if (mainFoot === 'left') {
          arr.push('ML' , 'LWB');
          max = 4;
        } else {
          arr.push('MR', 'ML', 'RWB', 'LWB');
          max = 6;
        }
        num = this.afs.getRandomInt(0, max);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'DM':
        arr = ['CB', 'MC', 'AMC'];
        
        if (mainFoot === 'right') {
          arr.push('RB');
          max = 3;
        } else if (mainFoot === 'left') {
          arr.push('LB');
          max = 3;
        } else {
          arr.push('RB', 'LB');
          max = 4;
        }
        num = this.afs.getRandomInt(0, max);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'MC':
        arr = ['DM', 'AMC'];
        
        if (mainFoot === 'right') {
          arr.push('MR');
          max = 2;
        } else if (mainFoot === 'left') {
          arr.push('ML');
          max = 2;
        } else {
          arr.push('MR', 'ML');
          max = 3;
        }
        num = this.afs.getRandomInt(0, max);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'AMC':
        arr = ['DM', 'MC', 'AMR', 'AML', 'ST'];
        
        if (mainFoot === 'right') {
          arr.push('MR');
          max = 5;
        } else if (mainFoot === 'left') {
          arr.push('ML');
          max = 5;
        } else {
          arr.push('MR', 'ML');
          max = 6;
        }
        num = this.afs.getRandomInt(0, max);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      case 'ST':
        arr = ['AMC', 'AMR', 'AML', 'MC']; 
        num = this.afs.getRandomInt(0, 3);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          altPos.push(arr[num - i]);
        }
        break;
      default:
          console.log('Error in the function getAltPositions()');
          break;
    }
    return altPos;

  }

  getRating(i: number, first: number, second: number, third: number, fourth: number, fifth: number) {
    let rating: number = 0;
    if (i < first) {
            rating = Math.min(this.afs.getRandomInt(85,99), this.afs.getRandomInt(85, 99), this.afs.getRandomInt(85, 99));
        }
    else if(i < first + second) {rating = this.afs.getRandomInt(77, 84)}
    else if (i < first + second + third) {rating = this.afs.getRandomInt(70, 76)}
    else if (i < first + second + third + fourth) {rating = this.afs.getRandomInt(62, 69)}
    else if (i < first + second + third + fourth + fifth) {rating = this.afs.getRandomInt(55, 61)}

    return rating;
  }

  savePlayers() {
    this.afs.saveRoster(this.players, this.pitchPlayers);
  }

  loadPlayers() {
    this.playersLoaded = true;
    console.log(this.players);
    console.log(localStorage);  
    if (localStorage.length > 0) {
      this.players = [];
      this.sortedData = [];
      this.pitchPlayers = [];
      for (let index in this.positions) {
        this.positions[index].amount = 0;
      }

      for (let i = 0; i < 60; i++) {
        let playerString = localStorage.getItem(`TEAMGEN - Player #${i}`);
        let player = JSON.parse(playerString || 'Null Error') as Player;
        this.players.push(player);
        this.sortedData.push(player);
      }

      for (const pos of this.pitchPositions) {
        let playerString = localStorage.getItem(`TEAMGEN - Starting ${pos.position}`);
        let playerObj = JSON.parse(playerString || '{}') as Player;
        if (playerString !== null) {
          this.pitchPlayers.push(playerObj);
        }
      }

      for (const player of this.players) {      
        for (const pos of this.positions) {
          if (player.position === pos.position) {
            pos.amount++;
            break;
          }
        }
      }
    }
    
    else if (this.players.length < 1 || this.players === undefined){
      this.afs.getRoster().subscribe((obj) => { 
        let playersArr: any = obj[0];
        this.players = playersArr.bench_reserves;
        this.sortedData = playersArr.bench_reserves;
        this.pitchPlayers = playersArr.starters;

        for (const player of this.players) {      
          for (const pos of this.positions) {
            if (player.position === pos.position) {
              pos.amount++;
              break;
            }
          }
        }

        for (let i = 0; i < 60; i++) {
          localStorage.setItem(`TEAMGEN - Player #${i}`, JSON.stringify(this.players[i]));
        }
        for (const player of this.pitchPlayers) {
          localStorage.setItem(`TEAMGEN - Starting ${player.pitchPosition}`, JSON.stringify(player));
        }

      });
    }
    console.log(this.players);
  }
  

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
