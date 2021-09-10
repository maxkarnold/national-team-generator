import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Player } from '../../models/player';
import * as nationsModule from '../../data/nations.json';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  playerCount = 0;
  players: Player[] = [];

  sortedData: Player[];
  
  positions = [
    {
      position: 'GK',
      amount: 0,
    },
    {
      position: 'RB',
      amount: 0,
    },
    {
      position: 'LB',
      amount: 0,
    },
    {
      position: 'CB',
      amount: 0,
    },
    {
      position: 'LWB',
      amount: 0,
    },
    {
      position: 'RWB',
      amount: 0,
    },
    {
      position: 'DM',
      amount: 0,
    },
    {
      position: 'MC',
      amount: 0,
    },
    {
      position: 'ML',
      amount: 0,
    },
    {
      position: 'MR',
      amount: 0,
    },
    {
      position: 'AMR',
      amount: 0,
    },
    {
      position: 'AML',
      amount: 0,
    },
    {
      position: 'AMC',
      amount: 0,
    },
    {
      position: 'ST',
      amount: 0,
    },
  ];

  nations: any = (nationsModule as any).default;

  constructor(private afs: FirestoreService) {
    // this.players = [];
    this.sortedData = this.players;
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

  

  getPlayers() {
    // RESETS
    console.log("New set of players!")
    this.playerCount = 0;
    this.players = [];
    this.sortedData = [];
    for (let index in this.positions) {
      this.positions[index].amount = 0;
    }
    let nationality = "any";

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
      
      // this.afs.getFirstName(nationality).pipe(take(1)).subscribe(firstNameObj => {
      //   console.log(firstNameObj);
      //   player.firstName = firstNameObj[0].name;
      // });

      this.afs.getLastnames().pipe(take(1)).subscribe(lastNameObj => {
        // console.log(lastNameObj, lastNameObj[0].id);
        player.lastName = lastNameObj[0].name;
      });

      this.players.push(player);
      this.sortedData.push(player);
      this.playerCount++;
    }
    console.log(this.players, this.sortedData);
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
            // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
        }
        // Then prioritize 3 CBs
        else if (this.positions[3].amount < 3) {
            randomPos = 3;
            // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
        }
        // Then prioritize 2 STs
        else if (this.positions[13].amount < 2) {
            randomPos = 13;
            // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
        }
        // Then priortize 3 CMs
        else if (this.positions[7].amount < 3) {
            randomPos = 7;
            // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
        }
        // Otherwise add to any position
        else { 
            for (let j = 0; j < this.positions.length; j++) {
                if (this.positions[randomPos].amount > 5) {
                    randomPos = this.afs.getRandomInt(0, 13);
                    // console.log(`player index: ${j}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
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


}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
