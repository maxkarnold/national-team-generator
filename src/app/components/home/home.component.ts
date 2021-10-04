import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service'
import { Player } from '../../models/player';
import { LastName } from 'src/app/models/last-name';
import { FirstName } from 'src/app/models/first-name';
import { PositionBox } from 'src/app/models/positionBox';
import { positionBoxes } from 'src/app/data/positionBoxes';
import * as nationsModule from '../../data/nations/nations.json';
import * as clubsModule from '../../data/clubs/clubs.json';
import * as positionsModule from '../../data/positions.json';
import * as pitchPositionsModule from '../../data/pitchPositions.json';

import { Observable } from 'rxjs';
import { Sort } from '@angular/material/sort';
import{ CdkDragDrop, CdkDragRelease, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Overlay } from '@angular/cdk/overlay';

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

  saveDataOverlayOpen = false;
  loginOverlayOpen = false;
  navToggle = false;
  isLoggedIn: boolean = false;
  nationName = "";
  nationSelectValue = "s tier"
  realisticNationalities = true;

  positionBoxes = positionBoxes;

  


  constructor(private afs: FirestoreService, private auth: AuthService) {
    this.players = [];
    this.sortedData = this.players;
    this.pitchPlayers = [];
    this.savedData = [];
    this.nationsList = [];
  }

  ngOnInit(): void {
    if (localStorage.getItem('user') !== null) {
      console.log('User is logged in.')
      this.isLoggedIn = true;
      this.loadPlayers('loadLocalStorage');
    } else {
      this.isLoggedIn = false;
    }
    for (const tierObj of this.nations) {
      for (let i = 0; i < tierObj.nations.length; i++) {
        this.nationsList.push(tierObj.nations[i].name);
      }
    }
    // console.log("nations list", this.nationsList);
  }

  loginOverlay() {
    
    if (!this.loginOverlayOpen) {
      this.loginOverlayOpen = true;
    } else {
      this.loginOverlayOpen = false;
    }
  }

  async login(email: string, password: string) {
    await this.auth.login(email, password);
    if (this.auth.isLoggedIn) {
      this.isLoggedIn = true;
      this.loginOverlayOpen = false;
    }
    
    console.log('Logged in');
  }

  logout() {
    this.auth.logout();
    console.log('logged out');
    this.isLoggedIn = false;
  }

  consoleLog(value: string) {
    console.log(value);
  }

  getPositionBoxes(box: PositionBox) {
    return box.class
  }

  getPlayerClass(box?: PositionBox) {  
    if (box === undefined) {
      return 'starters-fix'
    }
    let pos = parseInt(box.class.slice(-2));
    if (!isNaN(pos)) {
      for (const player of this.pitchPlayers) {
        if (player.pitchPositionIndex === pos) {
          box.playerClass = 'active player-box';
          // console.log(box.playerClass);
          return box.playerClass
        }
      }
    } 
  }

  getPosBoxClass(box: PositionBox) {
    let pos = parseInt(box.class.slice(-2));
    if (!isNaN(pos)) {
      for (const player of this.pitchPlayers) {
        if (player.pitchPositionIndex === pos) {
          box.posBoxClass = 'inactive pos-box';
        }
      }
    }
    return box.posBoxClass
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
    let playerIndex = event.previousIndex;
    let playerObj = event.previousContainer.data[playerIndex];
    let positionIndex = parseInt(event.container.element.nativeElement.classList[1]);
    // THINGS TO ADD
    // If you hover over a position, the border should be either green, yellow, or red based on position
    // The rating should be changed depending on the match
    // A player should have a new rating/property for secondary positions about 2-3 ratings lower.
    // Property will be called altRating
    // Player should also have a badRating property. This will be 10-15 ratings lower. Not sure how to calculate as of yet.
    // We might need a goalkeeper rating for outfield players and a outfield rating for goalkeepers.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // console.log(event.container.data);
    } 
    else if (event.previousContainer.id === "bench-players") {
      // Check for 11 players in starting lineup
      if (this.pitchPlayers.length === 11) {
        alert("You can only have 11 players starting.");
        console.log("Only 11 pitchPlayers are allowed");
        return false
      }
      playerObj.pitchPositionIndex = positionIndex;
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
      let pitchRating = 0;
      
      for (const pos of this.pitchPositions) {
        if (pos.position === playerObj.pitchPosition) {
          // if main position
          if (playerObj.position === pos.playerPosition) {
            pitchRating = playerObj.rating;
          } 
          // else if alt position
          else if (playerObj.altPositions.includes(pos.playerPosition)) {
            pitchRating = playerObj.yellowRating;
          }
          // else if gk position but not gk
          else if (pos.playerPosition === "GK") {
            pitchRating = playerObj.gkRating;
          }
          // any other position
          else {
            pitchRating = playerObj.redRating;
          }
        }
      }
      this.pitchPlayers.push(playerObj);
      this.players.splice(playerIndex, 1);
      let el = event.container.element.nativeElement;
      el.children[0].innerHTML = `${playerObj.firstInitial}. ${playerObj.lastName} ${pitchRating} <span>${playerObj.pitchPosition}</span>`;
      el.children[0].className = "active player-box";
      el.children[1].className = "inactive pos-box"
      // el.classList.add("player-box");
      // el.children[0].className += "pitch-card-pos";
      // console.log(event.container.data, this.pitchPlayers);
    }
    // Else if the player is moved to the bench
    else if (event.container.id === "bench-players"){
      playerObj.pitchPosition = "";
      playerObj.pitchPositionIndex = NaN;
      let el = event.previousContainer.element.nativeElement;
      el.children[0].innerHTML = "";
      el.children[0].className = 'inactive player-box'
      el.children[1].className = 'active pos-box';
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      // console.log(event.container.data);
    } 
    // Else if the player is moved to another pitch position
    console.log(this.pitchPlayers);
  }

  getPositionOutline(event: CdkDragStart) {
    // // Grab the current positions for the dragged player
    let player: Player = event.source.data;
    let mainPos = player.position;
    let altPosArr = player.altPositions;
    let greenPosArr = [];
    let yellowPosArr = [];

    for (let i = 0; i < this.pitchPositions.length; i++) {
      // if the player's main position matches the playerPosition
      if (mainPos === this.pitchPositions[i].playerPosition) {
        // push that position to the array
        greenPosArr.push(this.pitchPositions[i].position);
      } else if (altPosArr.includes(this.pitchPositions[i].playerPosition)){
        // For each alt position
        for (let j = 0; j < altPosArr.length; j++) {
          // if the player's alt position matches the playerPosition
          if (altPosArr[j] === this.pitchPositions[i].playerPosition) {
            // push that position to the array
            yellowPosArr.push(this.pitchPositions[i].position);
          }
        }
      } 
      
    }

    // For each playing position
    for (let i = 0; i < this.pitchPositions.length; i++) {
      // and for each position box
      for (let j = 0; j < this.positionBoxes.length; j++) {
        // get the number from the position box class if possible
        let boxNum = parseInt(this.positionBoxes[j].class.slice(-2));
        // if there is a number in the class, it must be a playable position
        if (!isNaN(boxNum)) {
          // If the pitchPosition index correlates with the box index, it's the same position
          if (this.pitchPositions[i].boxIndex === j) {
            // If this position correlates with the green array
            if (greenPosArr.includes(this.pitchPositions[i].position)) {
              this.positionBoxes[j].class += " green-placeholder";
            } 
            // Else if this position correlates with the yellow array
            else if (yellowPosArr.includes(this.pitchPositions[i].position)) {
              this.positionBoxes[j].class += " yellow-placeholder";
            }
            // Else the position is red
            else {
              this.positionBoxes[j].class += " red-placeholder";
            }
          }
        }
      }
    }

  }

  removeOutlineDrop(event: CdkDragDrop<Player>) {
    for (const box of this.positionBoxes) {
      let classArr = box.class.split(' ');
      if (classArr[2] === "green-placeholder") {
        box.class = box.class.slice(0, -18);
      } else if (classArr[2] === "yellow-placeholder") {
        box.class = box.class.slice(0, -19);
      } else if (classArr[2] === "red-placeholder") {
        box.class = box.class.slice(0, -16);
      }
    }
  
  }

  removeOutlineRelease(event: CdkDragRelease) {
    for (const box of this.positionBoxes) {
      let classArr = box.class.split(' ');
      if (classArr[2] === "green-placeholder") {
        box.class = box.class.slice(0, -18);
      } else if (classArr[2] === "yellow-placeholder") {
        box.class = box.class.slice(0, -19);
      } else if (classArr[2] === "red-placeholder") {
        box.class = box.class.slice(0, -16);
      }
      
    }
  }
  
  

  getPlayers() {
    if (!this.isLoggedIn) {
      alert("You must login to generate a team.");
      return false
    }
    else if (this.nationSelectValue === "") {
      alert("You must select a nation or random nationalities before generating a team");
      return false
    }
    // RESETS
    console.log("New set of players!")
    this.playerCount = 0;
    this.players = [];
    this.sortedData = [];
    this.pitchPlayers = [];
    this.nationName = this.nationSelectValue;
    for (let index in this.positions) {
      this.positions[index].amount = 0;
    }

    let tier = this.getNation("tier").tier || '';
    let numArray: number[] = this.getRatingBreakdown(tier);

    let first = this.afs.getRandomInt(numArray[0], numArray[1]);
    let second = this.afs.getRandomInt(numArray[2], numArray[3]);
    let third = this.afs.getRandomInt(numArray[4], numArray[5]);
    let fourth = this.afs.getRandomInt(numArray[6], numArray[7]);
    let fifth = this.afs.getRandomInt(numArray[8], numArray[9]);
    let sixth = this.afs.getRandomInt(numArray[10], numArray[11]);

    
    // Loops 60 times for 60 players
    while (this.playerCount < 60) {
      let player: Player = {
        firstName: '',
        lastName: '',
        position: '',
        altPositions: [],
        rating: 0,
        yellowRating: 0,
        redRating: 0,
        gkRating: 0,
        foot: '',
        nationality: '',
        nationalityLogo: '',
        age: 0,
        club: '',
        clubLogo: this.blankCrest
      };
      
      player.position = this.getPosition();
      player.foot = this.getFoot(player.position);
      player.altPositions = this.getAltPositions(player.position, player.foot);

      let ratingObj = this.getRatingAndClubRep(this.playerCount, first, second, third, fourth, fifth, sixth);
      player.rating = ratingObj.rating;
      player.yellowRating = player.rating - 5;
      player.redRating = player.rating - 20;
      if (player.position === "GK") {
        player.gkRating = player.rating;
      } else {
        player.gkRating = 25;
      }

      let nationObj = this.getNation("nationality", player.rating) || '';
      player.nationality = nationObj.nationality || '';
      player.nationalityLogo = nationObj.logo || '';

      let clubObj = this.getClub(ratingObj.clubRep, player.nationality);
      player.club = clubObj.clubName;
      player.clubLogo = clubObj.clubLogoUrl;
      player.age = this.getAge(player.rating);
      let firstNameReq = this.afs.getFirstName(player.nationality)?.request$;
      let firstNameRetry = this.afs.getFirstName(player.nationality)?.retryRequest$;

      firstNameReq.subscribe((firstNameArr) => {
        if (firstNameArr !== undefined) {
          let firstNameObj: any = firstNameArr[0];
          player.firstName = firstNameObj.name;
          player.firstInitial = player.firstName.slice(0, 1);
        } 
        else {
          firstNameRetry.subscribe((firstNameArr) => { 
            let firstNameObj: any = firstNameArr[0];
            player.firstName = firstNameObj.name;
            player.firstInitial = player.firstName.slice(0, 1);
          });
        }
        // add nickname based on nationality
        // About 90% chance: Mozambique
        // About 50% chance: Brazil, Spain, Portugal, Angola, Equatorial Guinea, Guinea-Bissau
      });

      let lastNameReq = this.afs.getLastName(player.nationality)?.request$;
      let lastNameRetry = this.afs.getLastName(player.nationality)?.retryRequest$;

      lastNameReq.subscribe((lastNameArr) => {
        if (lastNameArr !== undefined) {
          let lastNameObj: any = lastNameArr[0];
          player.lastName = lastNameObj.name;
        } 
        else {
          lastNameRetry.subscribe((lastNameArr) => { 
            let lastNameObj: any = lastNameArr[0];
            player.lastName = lastNameObj.name;
          });
        }
      });
      // getMiddleName function

      this.players.push(player);
      this.sortedData.push(player);
      this.playerCount++;

    }
    console.log(this.players);
  }

  getNation(property: string, rating?: number) {
    
    if (property === "tier") {
      let nationality: string = this.nationSelectValue;
      let tier: string = "";
      if (nationality.includes("tier")) {
        tier = nationality.slice(0, 1);
      } else {
        tierLevels:
        for (const tierLevel of this.nations) {
          for (const nation of tierLevel.nations) {
            if (nation.name === nationality) {
              tier = tierLevel.tier.slice(0, 1);
              break tierLevels;
            }
          }
        }
      }
      return {
        tier
      }
    } else {
      let nationality: string = this.nationSelectValue;
      let logo: string = "";
      
      // If random nationalities
      if (nationality.includes("tier")) {
        // realistic nationalities turned on
        if (this.realisticNationalities === true) {
          let tierName = "";
          if (rating !== undefined) {
            tierName = this.getRandomNationTier(rating);
          }
          
          let nationList = [];
          for (const tier of this.nations) {
            if (tier.tier === tierName) {
              for (const nation of tier.nations) {
                nationList.push(nation.name);
              }
              let i = this.afs.getRandomInt(0, nationList.length - 1);
              nationality = nationList[i];
            }
          }
        } else {
          // realistic nationalities turned off
          let randomNum = this.afs.getRandomInt(0, this.nationsList.length - 1);
          nationality = this.nationsList[randomNum];
        }
        
      }
      for (const tier of this.nations) {
        for (const nation of tier.nations) {     
          if (nationality === nation.name) {
            logo = nation.logo;
          }
        }
      }
      // console.log("Nationality:\n", nationality, "Logo:\n", logo);
      return {
        nationality,
        logo
      }
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
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'LB':
        arr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'RB':
        arr = ['CB', 'MR', 'RWB', 'LB', 'DM', 'MC'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'LWB':
        arr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'RWB':
        arr = ['RB', 'MR', 'LWB', 'AMR', 'MC', 'DM'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'MR':
        arr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'ML':
        arr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR'];
        num = this.afs.getRandomInt(0, 5);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
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
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
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
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
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
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
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
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
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
          let str = arr[num - i].split(', ');
          
          altPos.push(str[0]);
        }
        break;
      case 'ST':
        arr = ['AMC', 'AMR', 'AML', 'MC']; 
        num = this.afs.getRandomInt(0, 3);
        for (let i = 0; i < altPosCount; i++) {
          if (num - i < 0) {
            num = arr.length;
          }
          let str = arr[num - i].split(', ');
          altPos.push(str[0]);
        }
        break;
      default:
          console.log('Error in the function getAltPositions()');
          break;
    }
    return altPos;

  }

  getRatingBreakdown(tier: string): number[] {
    switch (tier) {
      case "s":
        return [3, 9, 10, 30, 40, 70, 180, 200, 0, 0, 0, 0];
      case "a":
        return [2, 5, 4, 12, 16, 45, 90, 130, 0, 0, 0, 0];
      case "b":
        return [0, 4, 1, 5, 4, 15, 25, 150, 85, 200, 0, 0];
      case "c":
        return [0, 2, 0, 3, 3, 12, 20, 50, 70, 180, 0 ,0];
      case "d":
        return [0, 1, 0, 3, 1, 7, 15, 45, 70, 160, 0 ,0];
      case "e":
        return [0, 1, 0, 2, 0, 6, 15, 25, 40, 70, 50, 50];
      case "f":
        return [0, 1, 0, 2, 0, 4, 3, 20, 30, 80, 50, 50];
      case "g":
        return [0, 1, 0, 1, 0, 4, 3, 13, 25, 45, 50, 50];
      case "h":
        return [0, 0, 0, 1, 0, 2, 2, 10, 10, 25, 50, 50];
      case "i":
        return [0, 0, 0, 1, 0, 1, 0, 8, 2, 16, 100, 100];
      case "j":
        return [0, 0, 0, 0, 0, 1, 0, 1, 0, 10, 100, 100];
      default:
        throw new Error("getRatingBreakdown() had an error");
    }
  }

  getRatingAndClubRep(i: number, first: number, second: number, third: number, fourth: number, fifth: number, sixth: number) {

    let rating: number = 0;
    let clubRep = "";

    if (i < first) {
      rating = Math.min(this.afs.getRandomInt(82,99), this.afs.getRandomInt(82, 99), this.afs.getRandomInt(82, 99));
      clubRep = "top50";
    } else if(i < first + second) {
      rating = this.afs.getRandomInt(76, 81);
      clubRep = "top200";
    } else if (i < first + second + third) {
      rating = this.afs.getRandomInt(70, 75);
      clubRep = "regularInternational";
    } else if (i < first + second + third + fourth) {
      rating = this.afs.getRandomInt(62, 69);
      clubRep = "averagePlayer"
    } else if (i < first + second + third + fourth + fifth) {
      rating = this.afs.getRandomInt(55, 61);
      clubRep = "average2ndDivPlayer";
    } else if (i < first + second + third + fourth + fifth + sixth) {
      rating = this.afs.getRandomInt(40, 54);
      clubRep = "fillerPlayer";
    }

    return {
      rating, 
      clubRep
    };
  }

  getClub(clubRep: string, playerNation: string) {
    let clubArr: any[] =  this.clubs[clubRep];
    let clubName: string = "";
    let clubLogoUrl: string = "";
    let randomIndexArr = [];

    for (let i = 0; i < clubArr.length; i++) {
      let randIndex = this.afs.getRandomInt(0, clubArr.length - 1);
      randomIndexArr.push(randIndex);
    }
    // console.log(randomIndexArr, clubArr);

    // About a 60% chance to play for team with same mainNation
    let mainNationChance = this.afs.getRandomInt(1, 10);
    // About a 40% (45%-5%) chance to play for team with same altNation
    let altNationChance = this.afs.getRandomInt(1, 20);
    // Maybe should add a third chance `thirdNationChance`. This would be 25%.

    if (mainNationChance < 7) {
      // for each club in the random indexed array
      for (let i = 0; i < randomIndexArr.length; i++) {
        let club = clubArr[randomIndexArr[i]];
        for (let j = 0; j < club.mainNations.length; j++) {
          if (club.mainNations[j] === playerNation) {
            clubName = club.club;
            clubLogoUrl = club.logo;
            return {
              clubName,
              clubLogoUrl
            };
          }
        }
      }
      let randIndex = this.afs.getRandomInt(0, randomIndexArr.length - 1);
      let club = clubArr[randIndex];
      clubName = club.club;
      clubLogoUrl = club.logo;
      return {
        clubName,
        clubLogoUrl
      };
    } else if (altNationChance < 10) {
      // for each club in the random indexed array
      for (let i = 0; i < randomIndexArr.length; i++) {
        let club = clubArr[randomIndexArr[i]];
        for (let j = 0; j < club.altNations.length; j++) {
          if (club.altNations[j] === playerNation) {
            clubName = club.club;
            clubLogoUrl = club.logo;
            return {
              clubName,
              clubLogoUrl
            };
          }
        }
      }
      let randIndex = this.afs.getRandomInt(0, randomIndexArr.length - 1);
      let club = clubArr[randIndex];
      clubName = club.club;
      clubLogoUrl = club.logo;
      return {
        clubName,
        clubLogoUrl
      };
    } else {
      let randIndex = this.afs.getRandomInt(0, randomIndexArr.length - 1);
      let club = clubArr[randIndex];
      clubName = club.club;
      clubLogoUrl = club.logo;
      return {
        clubName,
        clubLogoUrl
      };
    }
  }

  getAge(rating: number) {
    // Average ages are based on this website https://football-observatory.com/IMG/sites/mr/mr49/en/
    let ageIndex: number;
    if (rating > 84) {
      let arr = [this.afs.getRandomInt(0, 1000), this.afs.getRandomInt(0, 1000), this.afs.getRandomInt(0, 1000)];
      ageIndex = median(arr);
    } else if (rating > 76) {
      let sum = this.afs.getRandomInt(0, 1000) + this.afs.getRandomInt(0, 1000);
      ageIndex = sum / 2;
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

  getRandomNationTier(rating: number) {
    let randomNum = this.afs.getRandomInt(0, 100);
    let half = this.afs.getRandomInt(0, 1);
    let third = this.afs.getRandomInt(0, 2);
    let quarter = this.afs.getRandomInt(0, 3);
    let tier = "";

    if (rating > 69) {
      if (randomNum < 70) {
        if (third < 2) {
          tier = "s";
        } else {
          tier = "a";
        }
      } else if (randomNum < 85) {
        if (half > 0) {
          tier = "b";
        } else {
          tier = "c";
        }
      } else if (randomNum < 95){
        switch (quarter) {
          case 0:
            tier = "d";
            break;
          case 1:
            tier = "e";
            break;
          case 2:
            tier = "f";
            break;
          case 3:
            tier = "g";
            break;
          default:
            tier = "d";
            break;
        }
      } else {
        let randNum = this.afs.getRandomInt(1, 10);
        if (randNum < 6) {
          tier = "h";
        } else if (randNum < 9) {
          tier = "i";
        } else {
          tier = "j";
        }
      }
    } else {
      let arr = ["s", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
      let i = this.afs.getRandomInt(0, arr.length - 1);
      tier = arr[i];
    }

    tier += " tier";
    return tier
  }

  savePlayers(saveLocation: string) {
    
    if (saveLocation === 'firestore') {
      if (!this.isLoggedIn) {
        alert('You must be logged in to save roster to cloud');
        return false
      }
      if (window.confirm("Are you sure you want to save?")) {
        this.afs.saveRoster(this.players, this.pitchPlayers, this.nationName);
      } else {
        return false
      }
    } else if (saveLocation === 'localStorage') {
      if (localStorage.length > 1) {
        if (window.confirm("Are you sure you want to overwrite your current roster saved in Local Storage?")) {
          let user = localStorage.getItem('user');
          localStorage.clear();
          if (user !== null) {
            localStorage.setItem('user', user);
          }
        } else {
          return false
        }
      }
      for (let i = 0; i < this.players.length; i++) {
        localStorage.setItem(`TEAMGEN - Player #${i}`, JSON.stringify(this.players[i]));
      }
      for (const player of this.pitchPlayers) {
        localStorage.setItem(`TEAMGEN - Starting ${player.pitchPosition}`, JSON.stringify(player));
      }
      localStorage.setItem(`TEAMGEN - Tier/Nationality`, JSON.stringify(this.nationName));
      // console.log(localStorage);
    } else {
      throw new Error("Problem with saving!");
    }
    
  }

  saveDataOverlay(loadMore?: string) {
    this.saveDataOverlayOpen = true;
    if (loadMore !== 'check'){
      return false;
    }
    if (!this.isLoggedIn) {
      alert('You must be logged in to access cloud saved data');
      return false;
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
    this.saveDataOverlayOpen = false;
  }

  loadPlayers(saveLocation: string) {
    console.log("Save Data is from:\n", saveLocation);
    this.saveDataOverlayOpen = false;
    if (saveLocation === 'loadLocalStorage') {
      if (localStorage.length > 1) {
        this.players = [];
        this.sortedData = [];
        this.pitchPlayers = [];
        this.nationName = localStorage.getItem(`TEAMGEN - Tier/Nationality`) || '';
        this.nationName = this.nationName.slice(1, -1);
        for (let index in this.positions) {
          this.positions[index].amount = 0;
        }

        for (let i = 0; i < 60; i++) {
          let playerString = localStorage.getItem(`TEAMGEN - Player #${i}`) || '';
          let player;
          try {
            player = JSON.parse(playerString) as Player;
            this.players.push(player);
            this.sortedData.push(player);
          } catch(err) {
            // console.log("Error on parsing string", err);
          }
        }
        for (const pos of this.pitchPositions) {
          let playerString = localStorage.getItem(`TEAMGEN - Starting ${pos.position}`) || '';
          let player;
          try {
            player = JSON.parse(playerString) as Player;
            this.pitchPlayers.push(player);
          } catch(err) {
            // console.log("Error on parsing string", err);
          }

        }

        for (const player of this.pitchPlayers) {
          let pitchRating = 0;
          for (let i = 0; i < this.pitchPositions.length; i++) {
            let pos = this.pitchPositions[i];
            if (pos.position === player.pitchPosition) {
              // if main position
              if (player.position === pos.playerPosition) {
                pitchRating = player.rating;
              } 
              // else if alt position
              else if (player.altPositions.includes(pos.playerPosition)) {
                pitchRating = player.yellowRating;
              }
              // else if gk position but not gk
              else if (pos.playerPosition === "GK") {
                pitchRating = player.gkRating;
              }
              // any other position
              else {
                pitchRating = player.redRating;
              }
            }
            let boxIndex = this.pitchPositions[player.pitchPositionIndex || 0].boxIndex;
            for (let j = 0; j < this.positionBoxes.length; j++) {
              if (this.positionBoxes[j] === this.positionBoxes[boxIndex]) {
                this.positionBoxes[j].html = `${player.firstInitial}. ${player.lastName} ${pitchRating} \n${player.pitchPosition}`;

              }
            }
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
          // console.log(obj);
          if (obj !== undefined) {      
            this.players = obj.benchReserves;
            this.sortedData = obj.benchReserves;
            // console.log("GOT PLAYERS: \n", this.players);
            this.pitchPlayers = obj.starters;
            this.nationName = obj.nationOrTier;
            // console.log("Got STARTERS:\n", this.pitchPlayers);
          } else {
            console.log("Problem loading data from firestore");
          }

          for (const player of this.pitchPlayers) {
            let pitchRating = 0;
            for (let i = 0; i < this.pitchPositions.length; i++) {
              let pos = this.pitchPositions[i];
              if (pos.position === player.pitchPosition) {
                // if main position
                if (player.position === pos.playerPosition) {
                  pitchRating = player.rating;
                } 
                // else if alt position
                else if (player.altPositions.includes(pos.playerPosition)) {
                  pitchRating = player.yellowRating;
                }
                // else if gk position but not gk
                else if (pos.playerPosition === "GK") {
                  pitchRating = player.gkRating;
                }
                // any other position
                else {
                  pitchRating = player.redRating;
                }
              }
              let boxIndex = this.pitchPositions[player.pitchPositionIndex || 0].boxIndex;
              for (let j = 0; j < this.positionBoxes.length; j++) {
                if (this.positionBoxes[j] === this.positionBoxes[boxIndex]) {
                  this.positionBoxes[j].html = `${player.firstInitial}. ${player.lastName} ${pitchRating} \n${player.pitchPosition}`;

                }
              }
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
        });
    }
  }
  
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function median(values: number[]){
  if(values.length ===0) throw new Error("No inputs");

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);
  
  if (values.length % 2)
    return values[half];
  
  return (values[half - 1] + values[half]) / 2.0;
}
