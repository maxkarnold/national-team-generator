import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Player } from '../../models/player';
import { LastName } from 'src/app/models/last-name';
import { FirstName } from 'src/app/models/first-name';
import * as nationsModule from '../../data/nations.json';
import * as clubsModule from '../../data/clubs.json';
import * as positionsModule from '../../data/positions.json';
import * as pitchPositionsModule from '../../data/pitchPositions.json';

import { Observable } from 'rxjs';
import { Sort } from '@angular/material/sort';
import{ CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Overlay } from '@angular/cdk/overlay';

export interface PositionBox {
  pitchPlayer?: Player;
  class: string;
  dragDisabled: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  playerCount = 0;
  players: Player[];
  sortedData: Player[];
  pitchPlayers: Player[];
  savedData: any[];

  shirtIcon = '../../../assets/img/shirt-icon.jpg';
  blankCrest = '../../../assets/img/blank-crest.jpg';

  lastName$!: Observable<LastName[]>;
  firstName$!: Observable<FirstName[]>;
  
  positions: any = (positionsModule as any).default;
  pitchPositions: any = (pitchPositionsModule as any).default;

  nations: any = (nationsModule as any).default;
  nationsList: string[];
  clubs: any = (clubsModule as any).default;

  overlayOpen = false;
  navToggle = false;
  nation = "";
  
  positionBoxes: PositionBox[] = [
    {
      class: 'pox-box empty',
      dragDisabled: true
    },
    {
      class: 'pox-box empty',
      dragDisabled: true
    },
    {
      class: 'pox-box 23',
      dragDisabled: true
    },
    {
      class: 'pox-box 22',
      dragDisabled: true
    },
    {
      class: 'pox-box 21',
      dragDisabled: true
    },
    {
      class: 'pox-box empty',
      dragDisabled: true
    },
    {
      class: 'pox-box empty',
      dragDisabled: true
    },
  ]


  constructor(private afs: FirestoreService) {
    this.players = [];
    this.sortedData = this.players;
    this.pitchPlayers = [];
    this.savedData = [];
    this.nationsList = [];
  }

  ngOnInit(): void {
    for (const tierObj of this.nations) {
      for (let i = 0; i < tierObj.nations.length; i++) {
        this.nationsList.push(tierObj.nations[i]);
      }
    }
  }

  consoleLog() {
    console.log(this.nation);
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
        case 'club': return compare(a.club, b.club, isAsc);
        case 'pos': return compare(a.position, b.position, isAsc);
        case 'altPositions': return compare(a.altPositions[0], b.altPositions[0], isAsc);
        case 'foot': return compare(a.foot, b.foot, isAsc);
        case 'rating': return compare(a.rating, b.rating, isAsc);
        case 'age': return compare(a.age, b.age, isAsc);
        case 'nationality': return compare(a.nationality, b.nationality, isAsc);
        default: return 0;
      }
    });
  }

  drop(event: CdkDragDrop<Player[]>) {
    let starterCount = 0;
    let playerIndex = event.previousIndex;
    let playerObj = event.previousContainer.data[playerIndex];
    console.log(event.container.element.nativeElement.classList[2]);
    let positionIndex = parseInt(event.container.element.nativeElement.classList[2]);
    console.log(positionIndex);
    // THINGS TO ADD
    // If you hover over a position, the border should be either green, yellow, or red based on position
    // The rating should be changed depending on the match
    // A player should have a new rating/property for secondary positions about 2-3 ratings lower.
    // Property will be called altRating
    // Player should also have a badRating property. This will be 10-15 ratings lower. Not sure how to calculate as of yet.
    // We might need a goalkeeper rating for outfield players and a outfield rating for goalkeepers.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      console.log(event.container.data);
    } 
    else if (event.previousContainer.id === "cdk-drop-list-24") {
      // Check for 11 players in starting lineup
      for (const player of this.pitchPlayers) {
        if (player !== undefined) {
          if (starterCount > 11) {
            return new Error("Only allowed to have 11 players in starting lineup")
          }
        } 
      }
      console.log(positionIndex);
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
      
      this.pitchPlayers.push(playerObj);
      this.players.splice(playerIndex, 1);
      let el = event.container.element.nativeElement;
      el.innerHTML = `${playerObj.firstInitial}. ${playerObj.lastName} ${playerObj.rating} <span>${playerObj.pitchPosition}</span>`;
      el.classList.remove("pos-box");
      el.classList.add("player-box");
      el.children[0].className += "pitch-card-pos";
      starterCount++;
      console.log(event.container.data, this.pitchPlayers);
    }
    // Else if the player is moved to the bench
    else if (event.container.id === "cdk-drop-list-24"){
      starterCount--;
      playerObj.pitchPosition = "";
      let el = event.previousContainer.element.nativeElement;
      el.innerHTML = `<div>${playerObj.firstInitial}. ${playerObj.lastName} ${playerObj.rating} <span>${playerObj.pitchPosition}</span></div>`;
      el.classList.remove("player-box");
      el.children[0].className += "pox-box";
      el.children[0].children[0].className += "pitch-card-pos";
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      console.log(event.container.data);
    } 
    // Else if the player is moved to another pitch position
    
  }

  hoverPlayer(event: any) {
    // console.log("Hover On Event:\n", event);
  }

  hoverOffPlayer(event: any) {
    // console.log("Hover Off Event:\n", event);
  }

  

  getPlayers() {
    if (this.nation === "") {
      alert("You must select a nation or random nationalities before generating a team");
      return false
    }
    // RESETS
    console.log("New set of players!")
    this.playerCount = 0;
    this.players = [];
    this.sortedData = [];
    this.pitchPlayers = [];
    for (let index in this.positions) {
      this.positions[index].amount = 0;
    }

    let tier = this.getNation("tier");
    let numArray = this.getRatingBreakdown(tier);

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
        foot: '',
        nationality: '',
        age: 0,
        club: ''
      };
      
      player.position = this.getPosition();
      player.foot = this.getFoot(player.position);
      player.altPositions = this.getAltPositions(player.position, player.foot);
      for (let i = 0; i < player.altPositions.length - 1; i++) {
        player.altPositions[i] += ", ";
      }
      player.nationality = this.getNation("nationality");
      let ratingObj = this.getRatingAndClubRep(this.playerCount, first, second, third, fourth, fifth);
      player.rating = ratingObj.rating;
      let clubObj = this.getClub(ratingObj.clubRep);
      player.club = clubObj.clubName;
      player.clubLogo = clubObj.clubLogoUrl;
      if (player.clubLogo = "") {
        player.clubLogo = this.blankCrest;
      }
      player.age = this.getAge(player.rating);

      this.afs.getFirstName(player.nationality)?.subscribe((firstNameArr) => { 
        let firstNameObj: any = firstNameArr[0];
        player.firstName = firstNameObj.name;
        player.firstInitial = player.firstName.slice(0, 1);
      });

      this.afs.getLastName(player.nationality)?.subscribe((lastNameArr) => { 
        let lastNameObj: any = lastNameArr[0];
        player.lastName = lastNameObj.name;
      });

      this.players.push(player);
      this.sortedData.push(player);
      this.playerCount++;

    }
    console.log(this.players);
  }

  getNation(property: string) {
    
    if (property === "tier") {
      let nationality: string = this.nation;
      let tier: string = "";
      if (nationality.includes("tier")) {
        tier = nationality.slice(0, 1);
      } else {
        for (const tierLevel of this.nations) {
          if (tierLevel.nations.includes(nationality)) {
            tier = tierLevel;
            break;
          }
        }
      }
      console.log("Tier:\n", tier)
      return tier
    } else {
      let nationality: string = this.nation;
      if (nationality.includes("tier")) {
        let num = this.afs.getRandomInt(0, this.nationsList.length - 1);
        nationality = this.nationsList[num];
      }
      console.log("Nationality:\n", nationality)
      return nationality
    }
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

  getRatingBreakdown(tier: string): number[] {
    console.log(tier);
    switch (tier) {
      case "s":
        return [1, 5, 8, 14, 10, 20, 15, 30, 25, 35]
      case "a":
        return [1, 3]
      case "b":
        return [0, 2]
      case "c":
        return [0, 1]
      case "d":
        return [0, 1]
      case "e":
        return [0, 1]
      case "f":
        return [0, 0]
      default:
        throw new Error("getRatingBreakdown() had an error");
    }
  }

  getRatingAndClubRep(i: number, first: number, second: number, third: number, fourth: number, fifth: number) {

    let rating: number = 0;
    let clubRep = "";

    if (i < first) {
      rating = Math.min(this.afs.getRandomInt(85,99), this.afs.getRandomInt(85, 99), this.afs.getRandomInt(85, 99));
      clubRep = "giant";
    } else if(i < first + second) {
      rating = this.afs.getRandomInt(77, 84);
      clubRep = "championsLeague";
    } else if (i < first + second + third) {
      rating = this.afs.getRandomInt(70, 76);
      clubRep = "europaLeague";
    } else if (i < first + second + third + fourth) {
      rating = this.afs.getRandomInt(62, 69);
      clubRep = "europaConferenceLeague"
    } else if (i < first + second + third + fourth + fifth) {
      rating = this.afs.getRandomInt(55, 61);
      clubRep = "eflChampionship";
    }

    return {
      rating, 
      clubRep
    };
  }

  getClub(clubRep: string) {
    let clubArr =  this.clubs[clubRep];
    console.log(clubArr);
    let index = this.afs.getRandomInt(0, clubArr.length - 1);
    let clubName = clubArr[index].club;
    let clubLogoUrl = clubArr[index].logo;
    // console.log(clubLogoUrl);
    return {
      clubName,
      clubLogoUrl
    };
  }

  getAge(rating: number) {
    // Average ages are based on this website https://football-observatory.com/IMG/sites/mr/mr49/en/
    let ageIndex: number;
    if (rating > 84) {
      ageIndex = Math.max(this.afs.getRandomInt(0, 1000), this.afs.getRandomInt(0, 1000), this.afs.getRandomInt(0, 1000));
    } else if (rating > 76) {
      ageIndex = Math.max(this.afs.getRandomInt(0, 1000), this.afs.getRandomInt(0, 1000));
    } else {
      ageIndex = this.afs.getRandomInt(0, 1000);
    }

    if (ageIndex < 1) {
      return 16
    } else if (ageIndex >= 1 && ageIndex <= 8) {
      return 17
    } else if (ageIndex >= 9 && ageIndex <= 30) {
      return 18
    } else if (ageIndex >= 31 && ageIndex <= 74) {
      return 19
    } else if (ageIndex >= 75 && ageIndex <= 133) {
      return 20
    } else if (ageIndex >= 134 && ageIndex <= 207) {
      return 21
    } else if (ageIndex >= 208 && ageIndex <= 286) {
      return 22
    } else if (ageIndex >= 287 && ageIndex <= 365) {
      return 23
    } else if (ageIndex >= 365 && ageIndex <= 447) {
      return 24
    } else if (ageIndex >= 448 && ageIndex <= 524) {
      return 25
    } else if (ageIndex >= 525 && ageIndex <= 599) {
      return 26
    } else if (ageIndex >= 600 && ageIndex <= 669) {
      return 27
    } else if (ageIndex >= 670 && ageIndex <= 735) {
      return 28
    } else if (ageIndex >= 736 && ageIndex <= 794) {
      return 29
    } else if (ageIndex >= 795 && ageIndex <= 843) {
      return 30
    } else if (ageIndex >= 844 && ageIndex <= 890) {
      return 31
    } else if (ageIndex >= 891 && ageIndex <= 925) {
      return 32
    } else if (ageIndex >= 926 && ageIndex <= 952) {
      return 33
    } else if (ageIndex >= 953 && ageIndex <= 970) {
      return 34
    } else if (ageIndex >= 971 && ageIndex <= 983) {
      return 35
    } else if (ageIndex >= 984 && ageIndex <= 991) {
      return 36
    } else if (ageIndex >= 992 && ageIndex <= 996) {
      return 37
    } else {
      return 38
    }
  }

  savePlayers(saveLocation: string) {
    if (saveLocation === 'firestore') {
      if (window.confirm("Are you sure you want to save?")) {
        this.afs.saveRoster(this.players, this.pitchPlayers);
      } else {
        return false
      }
    } else if (saveLocation === 'localStorage') {
      if (localStorage.length > 0) {
        if (window.confirm("Are you sure you want to overwrite your current roster saved in Local Storage?")) {
          localStorage.clear();
        } else {
          return false
        }
      }
      for (let i = 0; i < 60; i++) {
        localStorage.setItem(`TEAMGEN - Player #${i}`, JSON.stringify(this.players[i]));
      }
      for (const player of this.pitchPlayers) {
        localStorage.setItem(`TEAMGEN - Starting ${player.pitchPosition}`, JSON.stringify(player));
      }
      // console.log(localStorage);
    } else {
      throw new Error("Problem with saving!");
    }
    
  }

  saveDataOverlay(loadMore?: string) {
    this.overlayOpen = true;
    if (loadMore !== 'check'){
      return false
    }
    this.afs.getRosterId().subscribe((obj) => {
      console.log("Checking firestore for save data...\n")
      for (const roster of obj) {
        let id = roster.payload.doc.id;
        let duplicateId = false;
        for (let i = 0; i < this.savedData.length; i++) {
          if (this.savedData[i].id === id) {
            duplicateId = true;
          }
        }
        if (!duplicateId) {
          this.savedData.push({id: id});
        }
      }
    });
  }

  closeSaveDataOverlay() {
    this.overlayOpen = false;
  }

  loadPlayers(saveLocation: string) {
    console.log("Save Data\n", saveLocation);
    this.overlayOpen = false;
    if (saveLocation === 'loadLocalStorage') {
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
        console.log("Successfully loaded", this.players);
      } else {
        throw new Error("Local Storage Data not found");
      }
    } else {
        this.afs.getRoster(saveLocation).subscribe((obj) => {
          console.log(obj);
          if (obj !== undefined) {      
            this.players = obj.benchReserves;
            this.sortedData = obj.benchReserves;
            console.log("GOT PLAYERS: \n", this.players);
            this.pitchPlayers = obj.starters;
            console.log("Got STARTERS:\n", this.pitchPlayers);
          } else {
            console.log("Problem loading data from firestore");
          }
          for (const player of this.players) {      
            for (const pos of this.positions) {
              if (player.position === pos.position) {
                pos.amount++;
                break;
              }
            }
          }
        });
    }
  }
  
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
