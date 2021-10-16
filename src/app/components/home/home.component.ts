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
  sortedPitchPlayers: Player[];
  savedData: any[];

  shirtIcon = '../../../assets/img/shirt-icon.jpg';
  blankCrest = '../../../assets/img/blank-crest.jpg';
  blankPlayerPic = '../../../assets/img/player-profile.png';

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
  instructionsOpen = false;
  isLoggedIn: boolean = false;
  nationName = "";
  nationSelectValue = "s tier"
  realisticNationalities = true;
  startersTotalRating = 0;
  squadTotalRating = 0;
  formation = "";
  squadRules = [
    {
      text: '1 starting goalkeeper', 
      check: '❌'
    },
    {
      text: '3 goalkeepers in squad', 
      check: '❌'
    },
    {
      text: '3-5 starting defenders', 
      check: '❌'
    },
    {
      text: 'min. 6 defenders in squad', 
      check: '❌'
    },
    {
      text: '2-6 starting midfielders', 
      check: '❌'
    },
    {
      text: 'min. 5 midfielders in squad', 
      check: '❌'
    },
    {
      text: 'Backup player in each position', 
      check: '❌'
    },
    {
      text: '', 
      check: '→'
    }
  ]

  positionBoxes = positionBoxes;

  


  constructor(private afs: FirestoreService, private auth: AuthService) {
    this.players = [];
    this.pitchPlayers = [];
    this.sortedData = this.pitchPlayers.concat(this.players);
    this.sortedPitchPlayers = [];
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
    
  }

  loginOverlay() {
    if (!this.loginOverlayOpen) {
      this.loginOverlayOpen = true;
    } else {
      this.loginOverlayOpen = false;
    }
  }

  infoOverlay() {
    if (!this.instructionsOpen) {
      this.instructionsOpen = true;
    } else {
      this.instructionsOpen = false;
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

  resetStarters(bypass?: boolean) {

    if (bypass === true) {
      for (const player of this.pitchPlayers) {
        player.pitchPosition = undefined;
        player.pitchPositionIndex = undefined;
      }
      this.players = this.pitchPlayers.concat(this.players);
      this.pitchPlayers = [];
      this.sortedPitchPlayers = [];
      for (const rule of this.squadRules) {
        rule.check = '❌';
      }
      this.squadRules[7].check = '→';
      for (const box of this.positionBoxes) {
        box.playerClass = 'inactive player-box';
        box.posBoxClass = 'active pos-box';
        box.pitchPlayer = undefined;
      }
    } else if (window.confirm("Remove starting players?")) {
      this.resetStarters(true);
    }
  }

  checkFormation() {
    let squad = this.pitchPlayers.concat(this.players.slice(0, 12));
    let gkCount = 0;
    let defCount = 0;
    let midCount = 0;
    let fwCount = 0;
    let startMidCount = 0;
    let startDefCount = 0;
    let startGkCount = 0;
    let startFwCount = 0;
    let midFormCount = 0;
    let attMidFormCount = 0;

    for (const player of this.pitchPlayers) {
      if (player.pitchPosition?.slice(0, 1) !== "A" && player.pitchPosition?.includes("M")) {
        midFormCount++;
        startMidCount++;
      } else if (player.pitchPosition?.includes("D") || player.pitchPosition?.includes("W")) {
        startDefCount++;
      } else if (player.pitchPosition?.includes("AM")) {
        attMidFormCount++;
        startMidCount++;
      } else if (player.pitchPosition?.includes("STC")) {
        startFwCount++;
      } else {
        startGkCount++;
      }
    }
    for (const player of squad) {
      if (player.position === "GK") {
        gkCount++;
      } else if (player.position.includes("B")) {
        defCount++;
      } else if (player.position.includes("M")) {
        midCount++;
      } else {
        fwCount++;
      }
    } 
    // Formation
    if (attMidFormCount === 0 && startFwCount > 0) {
      this.formation = `${startDefCount}-${midFormCount}-${startFwCount}`;
    } else if (startFwCount === 0) {
      this.formation = `${startDefCount}-${midFormCount}-${attMidFormCount}`;
    } else {
      this.formation = `${startDefCount}-${midFormCount}-${attMidFormCount}-${startFwCount}`;
    } 
    
    // rules for squadRating/submission
    let count = [gkCount, defCount, midCount, fwCount, startGkCount, startDefCount, startMidCount, startFwCount];
    return this.checkSquadRules(count);
  }

  checkSquadRules(countArr: number[]): boolean {

    if (countArr[4] > 0) {
      this.squadRules[0].check = '✅';
    }
    if (countArr[0] === 3) {
      this.squadRules[1].check = '✅';
    }
    if (countArr[5] > 2 && countArr[5] < 6) {
      this.squadRules[2].check = '✅';
    }
    if (countArr[1] > 5) {
      this.squadRules[3].check = '✅';
    }
    if (countArr[6] > 1 && countArr[6] < 7) {
      this.squadRules[4].check = '✅';
    }
    if (countArr[2] > 4) {
      this.squadRules[5].check = '✅';
    }

    for (const rule of this.squadRules) {
      if (rule.check === '❌') {
        return false
      }
    }
    return true
  }

  getBackupPositions() {
    let startingPositions: string[] = [];
    for (const player of this.pitchPlayers) {
      for (const pos of this.pitchPositions) {
        if (player.pitchPosition === pos.position) {
          startingPositions.push(pos.playerPosition);
        }
      }
    }
    // console.log(startingPositions, this.players.slice(0, 12));
    let playersLeft = this.players.slice(0, 12);
    for (let j = 0; j < this.players.slice(0, 12).length; j++) { // for each player on the bench
    
      let used = false;
      let duplicates: string[] = [];

      for (let i = 0; i < startingPositions.length; i++) { // for each position in the starting lineup
        if (!duplicates.includes(startingPositions[i]) && startingPositions[i] !== '') { // if position hasn't already been used by same player
          if (startingPositions[i] === playersLeft[j].position) { // if main pos mathces
            // console.log("loop#:", j, "mainPos", playersLeft[j]);
            used = true;
            duplicates.push(startingPositions[i]);
            startingPositions[i] = '';
            continue;
          }
          for (const altPos of playersLeft[j].altPositions) {
            if (startingPositions[i] === altPos) { // if altPos matches
              // console.log("loop#", j, "altPos", playersLeft[j]);
              used = true;
              duplicates.push(startingPositions[i]);
              startingPositions[i] = '';
              break;
            }
          }
        }
      }
      if (used) {
        playersLeft.splice(j, 1, {} as Player);
      }
    }

    this.squadRules[7].text = '';
    for (let i = 0; i < startingPositions.length; i++) {
      if (startingPositions[i] !== '') {
        this.squadRules[7].text += ` ${startingPositions[i]}`;
      }
    }
    if (this.squadRules[7].text === '') {
      this.squadRules[6].check = '✅';
    } else {
      this.squadRules[6].check = '❌';
    }
  }

  getPositionBoxes(box: PositionBox) {
    return box.class
  }

  getPlayerClass(box: PositionBox) {  
    let pos = parseInt(box.class.slice(-2));
    // if posBox is a playable position
    if (!isNaN(pos)) {
      for (const player of this.pitchPlayers) {
        for (const pos of this.pitchPositions) {
          if (pos.position === player.pitchPosition) {
            // if main position (natural ~ lightest green ~ 0 change)
            if (player.position === pos.playerPosition) {
              player.pitchRating = player.rating;
            } 
            // else if alt position (accomplished ~ darker green)
            else if (player.altPositions.includes(pos.playerPosition)) {
              player.pitchRating = player.rating - 3;
            }
            // add another section for playable positions (new property: competent ~ dark yellow-green ~ -6 change)
            else if (player.competentPositions.includes(pos.playerPosition)) {
              player.pitchRating = player.rating - 6;
            }
            // add another section for playable positions (new property: unconvincing ~ dark yellow ~ -12 change)
            else if (player.unconvincingPositions.includes(pos.playerPosition)) {
              player.pitchRating = player.rating - 12;
            }
            // else if gk position but not gk or else if outfield position but gk (ineffectual ~ red)
            else if ((pos.playerPosition === "GK" && player.position !== "GK") || (pos.playerPosition !== "GK" && player.position === "GK")) {
              player.pitchRating = 20;
            }
            // any other position (awkward ~ dark orange ~ -25 change)
            else {
              player.pitchRating = player.rating - 25;
            }
          }
        }
        if (player.pitchPositionIndex === pos && player.pitchRating !== undefined) {
          box.playerClass = 'active player-box';
          if (player.pitchRating > 81) {
            box.playerClass += ' diamond';
          } else if (player.pitchRating > 75) {
            box.playerClass += ' platinum';
          } else if (player.pitchRating > 69) {
            box.playerClass += ' gold';
          } else if (player.pitchRating > 61) {
            box.playerClass += ' silver';
          } else if (player.pitchRating > 54) {
            box.playerClass += ' bronze';
          } else {
            box.playerClass += ' brown';
          }

          box.pitchPlayer = player;
          return box.playerClass
        }
      }
      box.playerClass = 'inactive player-box';
      box.pitchPlayer = undefined;
      return box.playerClass
    } 
    
  }

  getPosBoxClass(box: PositionBox) {
    let pos = parseInt(box.class.slice(-2));
    // if posBox is a playable position
    if (!isNaN(pos)) {
      // for each of the current pitch players
      for (const player of this.pitchPlayers) {
        // if the current player is located in this positionBox
        if (player.pitchPositionIndex === pos) {
          box.posBoxClass = 'inactive pos-box';
        }
      }
    }
    return box.posBoxClass
  }

  sortData(sort: Sort) {
    const data = this.pitchPlayers.concat(this.players);
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
        case 'roleDuty': return compare(a.preferredRole, b.preferredRole, isAsc);
        default: return 0;
      }
    });
  }

  drop(event: CdkDragDrop<Player[]>) {
    let newPlayerIndex = event.previousIndex;
    let newPlayer = event.previousContainer.data[newPlayerIndex];
    let positionIndex = parseInt(event.container.element.nativeElement.classList[1]);

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // console.log('moving within array');
    } 
    else if (event.previousContainer.id === "bench-players") {
      // Check for 11 players in starting lineup and no player swap
      if (this.pitchPlayers.length === 11 && event.container.element.nativeElement.innerText === "") {
        alert("You can only have 11 players starting.");
        console.log("Only 11 pitchPlayers are allowed");
        return false
      }
      newPlayer.pitchPositionIndex = positionIndex;
      switch (positionIndex) {
        case 0:
          newPlayer.pitchPosition = "GK";
          break;
        case 1:
          newPlayer.pitchPosition = "DR";
          break;
        case 2:
          newPlayer.pitchPosition = "DCR";
          break;
        case 3:
          newPlayer.pitchPosition = "DC";
          break;
        case 4:
          newPlayer.pitchPosition = "DCL";
        break;
        case 5:
          newPlayer.pitchPosition = "DL";
          break;
        case 6:
          newPlayer.pitchPosition = "WBR";
          break;
        case 7:
          newPlayer.pitchPosition = "DMR";
          break;
        case 8:
          newPlayer.pitchPosition = "DMC";
          break;
        case 9:
          newPlayer.pitchPosition = "DML";
          break;
        case 10:
          newPlayer.pitchPosition = "WBL";
          break;
        case 11:
          newPlayer.pitchPosition = "MR";
          break;
        case 12:
          newPlayer.pitchPosition = "MCR";
          break;
        case 13:
          newPlayer.pitchPosition = "MC";
          break;
        case 14:
          newPlayer.pitchPosition = "MCL";
          break;
        case 15:
          newPlayer.pitchPosition = "ML";
          break;
        case 16:
          newPlayer.pitchPosition = "AMR";
          break;
        case 17:
          newPlayer.pitchPosition = "AMCR";
          break;
        case 18:
          newPlayer.pitchPosition = "AMC";
          break;
        case 19:
          newPlayer.pitchPosition = "AMCL";
          break;
        case 20:
          newPlayer.pitchPosition = "AML";
          break;
        case 21:
          newPlayer.pitchPosition = "STCR";
          break;
        case 22:
          newPlayer.pitchPosition = "STC";
          break;
        case 23:
          newPlayer.pitchPosition = "STCL";
          break;
        default:
          console.log("Error: Check line 165 in home.component.ts");
          break;
      }  

      // if swapping a player
      if (event.container.element.nativeElement.innerText !== "") {
        for (let i = 0; i < this.pitchPlayers.length; i++) {
          if (this.pitchPlayers[i].pitchPosition === newPlayer.pitchPosition) { 
            let oldPlayer = this.pitchPlayers[i];
            oldPlayer.pitchPosition = "";
            oldPlayer.pitchPositionIndex = NaN;
            this.pitchPlayers.splice(i, 1);
            this.players.splice(newPlayerIndex, 1, oldPlayer);
            // console.log(this.positionBoxes);
          }
        }
      } else {  
        this.players.splice(newPlayerIndex, 1);
      }
      this.pitchPlayers.push(newPlayer);
      let el = event.container.element.nativeElement;
      // el.children[0].className = "active player-box";
      el.children[1].className = "inactive pos-box";
    }
    // Else if the player is moved to the bench
    else if (event.container.id === "bench-players"){
      let el = event.previousContainer.element.nativeElement;

      for (let i = 0; i < this.pitchPlayers.length; i++) {
        if (parseInt(el.classList[1]) === this.pitchPlayers[i].pitchPositionIndex) {
          let prevIndex = i;
          transferArrayItem(event.previousContainer.data,
            event.container.data,
            prevIndex,
            event.currentIndex);
            let movingPlayer: Player = event.container.data[event.currentIndex];
            movingPlayer.pitchPosition = undefined;
            movingPlayer.pitchPositionIndex = undefined;
        }
      }
      el.children[0].className = 'inactive player-box';
      el.children[1].className = 'active pos-box';
    } 
    // Else if the player is moved to another pitch position
    else if (event.previousContainer.id !== "bench-players" && event.container.id !== "bench-players") {
      newPlayer = event.item.data.pitchPlayer;
      let el = event.container.element.nativeElement;
      let prevEl = event.previousContainer.element.nativeElement;
      // if swapping a player
      if (event.container.element.nativeElement.innerText !== "") {
        for (let i = 0; i < this.pitchPlayers.length; i++) {
          if (this.pitchPlayers[i].pitchPositionIndex === parseInt(event.container.element.nativeElement.classList[1])) { 
            
            let oldPlayer = this.pitchPlayers[i];
            oldPlayer.pitchPosition = newPlayer.pitchPosition;
            oldPlayer.pitchPositionIndex = newPlayer.pitchPositionIndex;
          }
        }
      } else {  
        prevEl.children[1].className = "active pos-box";
      }
      newPlayer.pitchPositionIndex = positionIndex;
      el.children[1].className = "inactive pos-box";
      switch (positionIndex) {
        case 0:
          newPlayer.pitchPosition = "GK";
          break;
        case 1:
          newPlayer.pitchPosition = "DR";
          break;
        case 2:
          newPlayer.pitchPosition = "DCR";
          break;
        case 3:
          newPlayer.pitchPosition = "DC";
          break;
        case 4:
          newPlayer.pitchPosition = "DCL";
        break;
        case 5:
          newPlayer.pitchPosition = "DL";
          break;
        case 6:
          newPlayer.pitchPosition = "WBR";
          break;
        case 7:
          newPlayer.pitchPosition = "DMR";
          break;
        case 8:
          newPlayer.pitchPosition = "DMC";
          break;
        case 9:
          newPlayer.pitchPosition = "DML";
          break;
        case 10:
          newPlayer.pitchPosition = "WBL";
          break;
        case 11:
          newPlayer.pitchPosition = "MR";
          break;
        case 12:
          newPlayer.pitchPosition = "MCR";
          break;
        case 13:
          newPlayer.pitchPosition = "MC";
          break;
        case 14:
          newPlayer.pitchPosition = "MCL";
          break;
        case 15:
          newPlayer.pitchPosition = "ML";
          break;
        case 16:
          newPlayer.pitchPosition = "AMR";
          break;
        case 17:
          newPlayer.pitchPosition = "AMCR";
          break;
        case 18:
          newPlayer.pitchPosition = "AMC";
          break;
        case 19:
          newPlayer.pitchPosition = "AMCL";
          break;
        case 20:
          newPlayer.pitchPosition = "AML";
          break;
        case 21:
          newPlayer.pitchPosition = "STCR";
          break;
        case 22:
          newPlayer.pitchPosition = "STC";
          break;
        case 23:
          newPlayer.pitchPosition = "STCL";
          break;
        default:
          console.log("Error: Check line 165 in home.component.ts");
          break;
      }
    }
    window.setTimeout(() => {
      // starter/squad rating calculation
      this.startersTotalRating = 0;
      let ratingArr = [];
      for (const player of this.pitchPlayers) {
        if (player.pitchRating !== undefined) {
          ratingArr.push(player.pitchRating);
        } else {
          console.log("error");
        }
      }
      let sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0); 
      let avg = sum / ratingArr.length;
      this.startersTotalRating = Math.round(avg * 10) / 10;
      // console.log(sum, this.startersTotalRating);

      this.squadTotalRating = 0;
      for (let i = 0; i < 12; i++) {
        ratingArr.push(this.players[i].rating);
      }
      sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0);
      avg = sum / ratingArr.length;
      this.squadTotalRating = Math.round(avg * 10) / 10;
      // console.log(sum, this.squadTotalRating);

      // sortedData
      this.sortedData = this.pitchPlayers.concat(this.players);
      if (this.pitchPlayers.length > 1) {
        this.sortedPitchPlayers = this.pitchPlayers.sort((a,b) => {
          if (a.pitchPositionIndex !== undefined && b.pitchPositionIndex !== undefined) {
            if (a.pitchPositionIndex < b.pitchPositionIndex) {
              return -1
            }
            if (a.pitchPositionIndex > b.pitchPositionIndex) {
              return 1
            }
          }
          return 0
        });
      } else if (this.pitchPlayers.length > 0) {
        this.sortedPitchPlayers = this.pitchPlayers;
      }

      // backupPositionChecker
      if (this.pitchPlayers.length === 11) {
        this.getBackupPositions();
      } else {
        this.squadRules[6].check = '❌';
      }
      
      

    }, 250);
  }

  getPositionOutline(event: CdkDragStart) {
    let player: Player = event.source.data.pitchPlayer || event.source.data;
    // Add a placeholder element in origin

    // Get the displayName for the current player
    if (player.lastName.length < 8) {
      player.displayName = player.lastName;
    } else {
      player.displayName = player.firstName;
    }
    
    // // Grab the current positions for the dragged player
    
    let mainPos = player.position;
    let altPosArr = player.altPositions;
    let compPosArr = player.competentPositions;
    let unPosArr = player.unconvincingPositions;
    let limeArr = [];
    let darkGreenArr = [];
    let yellowGreenArr = [];
    let orangeArr = [];

    for (let i = 0; i < this.pitchPositions.length; i++) {
      // if the player's main position matches the playerPosition
      if (mainPos === this.pitchPositions[i].playerPosition) {
        // push that position to the array
        limeArr.push(this.pitchPositions[i].position);
      } else if (altPosArr.includes(this.pitchPositions[i].playerPosition)){
        // For each alt position
        for (let j = 0; j < altPosArr.length; j++) {
          // if the player's alt position matches the playerPosition
          if (altPosArr[j] === this.pitchPositions[i].playerPosition) {
            // push that position to the array
            darkGreenArr.push(this.pitchPositions[i].position);
          }
        }
      } else if (compPosArr.includes(this.pitchPositions[i].playerPosition)) {
        // for each competent position
        for (let j = 0; j < compPosArr.length; j++) {
          // if the player's alt position matches the playerPosition
          if (compPosArr[j] === this.pitchPositions[i].playerPosition) {
            // push that position to the array
            yellowGreenArr.push(this.pitchPositions[i].position);
          }
        }
      } else if (unPosArr.includes(this.pitchPositions[i].playerPosition)) {
        // for each unconvincing position
        for (let j = 0; j < unPosArr.length; j++) {
          // if the player's alt position matches the playerPosition
          if (unPosArr[j] === this.pitchPositions[i].playerPosition) {
            // push that position to the array
            orangeArr.push(this.pitchPositions[i].position);
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
            if (limeArr.includes(this.pitchPositions[i].position)) {
              this.positionBoxes[j].class += " natural-placeholder";
            } 
            // Else if this position correlates with the yellow array
            else if (darkGreenArr.includes(this.pitchPositions[i].position)) {
              this.positionBoxes[j].class += " accomplished-placeholder";
            }
            else if (yellowGreenArr.includes(this.pitchPositions[i].position)) {
              this.positionBoxes[j].class += " competent-placeholder";
            }
            else if (orangeArr.includes(this.pitchPositions[i].position)) {
              this.positionBoxes[j].class += " unconvincing-placeholder";
            }
            else if ((mainPos === 'GK' && this.pitchPositions[i].position !== 'GK') || mainPos !== 'GK' && this.pitchPositions[i].position === 'GK') {
              this.positionBoxes[j].class += " ineffectual-placeholder";
            }
            // Else the position is red
            else {
              this.positionBoxes[j].class += " awkward-placeholder";
            }
          }
        }
      }
    }

  }

  removeOutlineDrop(event: CdkDragDrop<Player>) {
    // console.log("outlinedrop", event);
    for (const box of this.positionBoxes) {
      let classArr = box.class.split(' ');
      if (classArr[2] === "natural-placeholder") {
        box.class = box.class.slice(0, -20);
      } else if (classArr[2] === "accomplished-placeholder") {
        box.class = box.class.slice(0, -25);
      } else if (classArr[2] === "competent-placeholder") {
        box.class = box.class.slice(0, -22);
      } else if (classArr[2] === "unconvincing-placeholder") {
        box.class = box.class.slice(0, -25);
      } else if (classArr[2] === "awkward-placeholder") {
        box.class = box.class.slice(0, -20);
      } else if (classArr[2] === "ineffectual-placeholder") {
        box.class = box.class.slice(0, -24);
      }
    }
    
  }

  removeOutlineRelease(event: CdkDragRelease) {
    // console.log("Release", event);
    for (const box of this.positionBoxes) {
      let classArr = box.class.split(' ');
      if (classArr[2] === "natural-placeholder") {
        box.class = box.class.slice(0, -20);
      } else if (classArr[2] === "accomplished-placeholder") {
        box.class = box.class.slice(0, -25);
      } else if (classArr[2] === "competent-placeholder") {
        box.class = box.class.slice(0, -22);
      } else if (classArr[2] === "unconvincing-placeholder") {
        box.class = box.class.slice(0, -25);
      } else if (classArr[2] === "awkward-placeholder") {
        box.class = box.class.slice(0, -20);
      } else if (classArr[2] === "ineffectual-placeholder") {
        box.class = box.class.slice(0, -24);
      }
      
    }
  }
  
  

  getPlayers() {
    if (!this.isLoggedIn) {
      alert("You must login to generate a team.");
      return false
    }
    if (this.nationSelectValue === "") {
      alert("You must select a nation or random nationalities before generating a team");
      return false
    }
    if (this.players.length > 0) {
      if (window.confirm("Are you sure? Any unsaved data will be deleted.")) {
        this.resetStarters(true);
      } else {
        return false
      }
    }
    // RESETS
    console.log("New set of players!")
    this.playerCount = 0;
    this.players = [];
    this.sortedData = [];
    this.sortedPitchPlayers = [];
    this.pitchPlayers = [];
    this.nationName = this.nationSelectValue;
    for (let index in this.positions) {
      this.positions[index].amount = 0;
    }
    for (const rule of this.squadRules) {
      if (rule.check === '✅') {
        rule.check = '❌';
      }
      this.squadRules[7].text = '';
    }

    let tier = this.getNation("tier").tier || '';
    let numArray: number[] = this.getRatingBreakdown(tier);

    let first = getRandomInt(numArray[0], numArray[1]);
    let second = getRandomInt(numArray[2], numArray[3]);
    let third = getRandomInt(numArray[4], numArray[5]);
    let fourth = getRandomInt(numArray[6], numArray[7]);
    let fifth = getRandomInt(numArray[8], numArray[9]);
    let sixth = getRandomInt(numArray[10], numArray[11]);

    
    // Loops 60 times for 60 players
    while (this.playerCount < 60) {
      let player: Player = {
        firstName: '',
        lastName: '',
        position: '',
        altPositions: [],
        competentPositions: [],
        unconvincingPositions: [],
        rating: 0,
        preferredRole: '',
        preferredDuty: '',
        foot: '',
        nationality: '',
        nationalityLogo: '',
        age: 0,
        club: '',
        clubLogo: this.blankCrest,
        playerFace: this.blankPlayerPic
      };
      
      player.position = this.getPosition();

      player.foot = this.getFoot(player.position);
      let positionsObj = this.getAltPositions(player.position, player.foot);
      player.altPositions = positionsObj.altPos;
      player.competentPositions = positionsObj.compPos;
      player.unconvincingPositions = positionsObj.unconvincingPos;

      let roleObj = this.getPositionRole(player.position, player.altPositions, player.foot);
      player.preferredRole = roleObj.role;
      player.preferredDuty = roleObj.duty;

      let ratingObj = this.getRatingAndClubRep(this.playerCount, first, second, third, fourth, fifth, sixth);
      player.rating = ratingObj.rating;

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
        if (firstNameArr[0] !== undefined) {
          let firstNameObj: any = firstNameArr[0];
          player.firstName = firstNameObj.name;
          player.firstInitial = player.firstName.charAt(0);
          if (player.firstInitial === "'") {
            player.firstInitial = player.firstName.charAt(1);
          }
        } 
        else {
          firstNameRetry.subscribe((firstNameArr) => { 
            let firstNameObj: any = firstNameArr[0];
            player.firstName = firstNameObj.name;
            player.firstInitial = player.firstName.charAt(0);
            if (player.firstInitial === "'") {
              player.firstInitial = player.firstName.charAt(1);
            }
            console.log("First Name Retry working");
          });
        }
        // add nickname based on nationality
        // About 90% chance: Mozambique
        // About 50% chance: Brazil, Spain, Portugal, Angola, Equatorial Guinea, Guinea-Bissau
      });

      let lastNameReq = this.afs.getLastName(player.nationality)?.request$;
      let lastNameRetry = this.afs.getLastName(player.nationality)?.retryRequest$;

      lastNameReq.subscribe((lastNameArr) => {
        if (lastNameArr[0] !== undefined) {
          let lastNameObj: any = lastNameArr[0];
          player.lastName = lastNameObj.name;
        } 
        else {
          lastNameRetry.subscribe((lastNameArr) => { 
            let lastNameObj: any = lastNameArr[0];
            player.lastName = lastNameObj.name;
            console.log("Last Name Retry working");
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
              let i = getRandomInt(0, nationList.length - 1);
              nationality = nationList[i];
            }
          }
        } else {
          // realistic nationalities turned off
          let randomNum = getRandomInt(0, this.nationsList.length - 1);
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
    let randomPos = getRandomInt(0, 13);
    // trying to lessen the amount of natural wing backs/wing players
    if (randomPos !== 0 && randomPos !== 3 && randomPos !== 6 && randomPos !== 6 && randomPos !== 12 && randomPos !== 13) {
      randomPos = getRandomInt(0, 13);
    }
    if (this.playerCount > 50 && (this.positions[0].amount < 3 || this.positions[3].amount < 3 || this.positions[13].amount < 2 || this.positions[7].amount < 3)) { 
      if (this.positions[0].amount < 3) {
        randomPos = 0;
      } else if (this.positions[3].amount < 3) {
        randomPos = 3;
      } else if (this.positions[13].amount < 2) {
        randomPos = 13;
      } else {
        randomPos = 7;
      }
    }
    // If there are 7 players in a certain position, choose a different position that doesn't have 7
    else if (this.positions[randomPos].amount > 6) {
        // Prioritize 4 GKs
        if (this.positions[0].amount < 4) {
            randomPos = 0;
        }
        // Then prioritize 4 CBs
        else if (this.positions[3].amount < 4) {
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
                    randomPos = getRandomInt(0, 13);
                }
            }
        }
        
    }
    this.positions[randomPos].amount++
    return this.positions[randomPos].position;
  }

  getPositionRole(pos: string, altPosArr: string[], foot: string) {
    let num1, num2, role, duty;
    let roles: string[];
    let duties: string[];
    let arr = [];
    switch (pos) {
      case 'GK':
        num1 = getRandomInt(0, 1);
        num2 = getRandomInt(0, 1);
        roles = ['GK', 'SK'];
        duties = ['Su', 'At'];
        if (num1 === 0) {
          duties = ['De'];
          num2 = 0;
        }    
        break;
      case 'RB':
      case 'LB':
        arr = [getRandomInt(0, 4), getRandomInt(1, 2), getRandomInt(1, 2)];
        num1 = arr[getRandomInt(0, 2)];
        num2 = getRandomInt(0, 2);
        if ((pos === 'RB' && foot === 'left') || (pos === 'LB' && foot === 'right')) {
          num1 = 0;
        } else if (!altPosArr.includes('CB')) {
          arr = [getRandomInt(0, 3), getRandomInt(1, 2), getRandomInt(1, 2)];
          num1 = arr[getRandomInt(0, 2)];
        } else if (altPosArr.includes('ML') || altPosArr.includes('MR') || altPosArr.includes('MC')) {
          arr = [getRandomInt(0, 3), getRandomInt(1, 2), getRandomInt(1, 2)];
          num1 = arr[getRandomInt(0, 2)];
          num2 = getRandomInt(1, 2);
        }
        roles = ['IWB', 'WB', 'FB', 'CWB', 'DFB'];
        duties = ['De', 'Su', 'At'];
        if (num1 === 3) {
          duties = ['Su', 'At'];
          num2 = getRandomInt(0, 1);
        } else if (num1 === 4) {
          duties = ['De'];
          num2 = 0;
        }
        
        
        break;
      case 'RWB':
      case 'LWB':
        arr = [getRandomInt(0, 2), 1];
        num1 = arr[getRandomInt(0, 1)];
        num2 = getRandomInt(0, 2);
        if ((pos === 'RWB' && foot === 'left') || (pos === 'LWB' && foot === 'right')) {
          num1 = 0;
        }
        if (altPosArr.includes('AML') || altPosArr.includes('AMR')) {
          num2 = 2
        } else if (altPosArr.includes('ML') || altPosArr.includes('MR') || altPosArr.includes('MC')) {
          num2 = getRandomInt(1, 2);
        }
        
        roles = ['IWB', 'WB', 'CWB'];
        duties = ['De', 'Su', 'At'];
        if (num1 === 2) {
          duties = ['Su', 'At'];
          num2 = getRandomInt(0, 1);
        }
        break;
      case 'CB':
        num1 = getRandomInt(0, 3);
        if (altPosArr.includes('DM')) {
          num1 = getRandomInt(1, 3);
        }
        num2 = getRandomInt(0, 2);
        roles = ['DCB', 'BPD', 'CD', 'WCB'];
        duties = ['De', 'Co', 'St'];
        if (num1 > 2) {
          duties = ['De', 'Su', 'At'];
        }
        
        break;
      case 'DM':
        arr = [getRandomInt(0, 7), getRandomInt(2, 4)];
        num1 = arr[getRandomInt(0, 1)];
        num2 = getRandomInt(0, 1);
        if (altPosArr.includes('CB')) {
          num1 = getRandomInt(0, 2);
        } 
        if (altPosArr.includes('AMC')) {
          num1 = getRandomInt(4, 7);
        }
        roles = ['A', 'HB', 'DM', 'BWM', 'DLP', 'RGA', 'RPM', 'VOL'];
        duties = ['De', 'Su'];
        if (num1 < 2) {
          duties = ['De'];
          num2 = 0;
        } else if (num1 > 6) {
          duties = ['Su', 'At'];
          num2 = getRandomInt(0, 1);
        } else if (num1 > 4) {
          duties = ['Su'];
          num2 = 0;
        }
        break;
      case 'MC':
        num1 = getRandomInt(0, 7);
        num2 = 0;
        if (altPosArr.includes('DM')) {
          num1 = getRandomInt(0, 5);
        }
        if (altPosArr.includes('AMC')) {
          num1 = getRandomInt(6, 7);
        } else if (altPosArr.includes('MR') || altPosArr.includes('ML')) {
          num1 = getRandomInt(2, 7);
        }
        roles = ['DLP', 'BWM', 'RPM', 'CM', 'CAR', 'BBM', 'MEZ', 'AP'];
        duties = ['Su'];
        if (num1 < 2) {
          duties = ['De', 'Su'];
          num2 = getRandomInt(0, 1);
        } else if (num1 === 3) {
          duties = ['De', 'Su', 'At'];
          num2 = getRandomInt(0, 2);
        } else if (num1 > 5) {
          duties = ['Su', 'At'];
          num2 = getRandomInt(0, 1);
        }
        break;
      case 'AMC':
        num1 = getRandomInt(0, 4);
        num2 = getRandomInt(0, 1);
        if (altPosArr.includes('ST')) {
          num1 = getRandomInt(3, 4);
          num2 = 1;
        } else if (altPosArr.includes('DM')) {
          num1 = getRandomInt(0, 2);
          num2 = 0;
        }
        
        roles = ['AP', 'AM', 'EG', 'T', 'SS'];
        duties = ['Su', 'At'];
        if (num1 > 1) {
          duties = ['At'];
          num2 = 0;
        }
        break;
      case 'MR':
      case 'ML':
        num1 = getRandomInt(0, 4);
        num2 = getRandomInt(0, 1);
        if (altPosArr.includes('MC')) {
          num1 = getRandomInt(2, 3);
        } else if ((foot === 'right' && pos === 'ML') || (foot === 'left' && pos === 'MR')) {
          num1 = getRandomInt(1, 2);
        } else if (altPosArr.includes('LB') || altPosArr.includes('RB')) {
          num1 = getRandomInt(3, 4);
        } else {
          num1 = 0;
        }
        roles = ['W', 'IW', 'WP', 'WM', 'DW'];
        duties = ['Su', 'At'];
        if (num1 > 3) {
          duties = ['De', 'Su'];
        } else if (num1 > 2) {
          duties = ['De', 'Su', 'At'];
          num2 = getRandomInt(0, 2);
        }
        break;
      case 'AMR':
      case 'AML':
        arr = [getRandomInt(0, 6), getRandomInt(0, 3)];
        num1 = arr[getRandomInt(0, 1)];
        num2 = getRandomInt(0, 1);
        if (altPosArr.includes('ST')) {
          num1 = Math.min(getRandomInt(3, 6), getRandomInt(3, 6));
        } else if ((pos === 'AMR' && foot === 'left') || (pos === 'AML' && foot === 'right')) {
          num1 = getRandomInt(1, 3);
        } else if (altPosArr.includes('LWB') || altPosArr.includes('RWB')) {
          num1 = getRandomInt(0, 2);
          num2 = 0;
        }
        roles = ['W', 'AP', 'IW', 'IF', 'T', 'WTM', 'RMD'];
        duties = ['Su', 'At'];
        if (num1 > 4) {
          duties = ["At"];
          num2 = 0;
        }
        break;
      case 'ST':
        arr = [0, getRandomInt(1, 7)];
        num1 = arr[getRandomInt(0, 1)];
        num2 = getRandomInt(0, 1);
        if (altPosArr.includes('AML') || altPosArr.includes('AMR')) {
          let arr = [getRandomInt(2, 3), getRandomInt(6, 7)];
          num1 = arr[getRandomInt(0, 1)];
        } else if (altPosArr.includes('MC')) {
          num2 = 0;
        }
        roles = ['AF', 'P', 'T', 'CF', 'TM', 'DLF', 'F9', 'PF'];
        duties = ['Su', 'At'];
        if (num1 < 3) {
          duties = ['At'];
          num2 = 0;
        } else if (num1 > 6) {
          duties = ['De', 'Su', 'At'];
          num2 = getRandomInt(0, 2);
        } else if (num1 > 5) {
          duties = ['Su'];
          num2 = 0;
        }
      
        break;
      default:
        roles = [];
        duties = [];
        num1 = 0;
        num2 = 0;
        break;
    }
    role = roles[num1];
    duty = duties[num2];
    return {
      role,
      duty
    }
  }

  getFoot(mainPos: string) {
    let num = getRandomInt(1, 100);
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
    let altPosCount = Math.min(getRandomInt(1, 3), getRandomInt(1, 3));
    let compPosCount = Math.min(getRandomInt(0, 2), getRandomInt(0, 2));
    let unPosCount = Math.min(getRandomInt(0, 2), getRandomInt(0, 2), getRandomInt(0, 2));

    let altPos: string[] = [];
    let compPos: string[] = [];
    let unconvincingPos: string[] = [];

    let arr: string[];
    let compArr: string[];
    let unArr: string[];

    let num: number;
    let max: number;
    let str: string[];

    if (altPosCount === 0) {
      altPos = ['N/A'];
    } else {
      switch (mainPos) {
        case 'GK':
          altPos = ['N/A'];
          break;
        case 'CB':
          arr = ['DM', 'RB', 'LB'];
          num = getRandomInt(0, 2);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['DM', 'RB', 'LB', 'MC'];
          num = getRandomInt(0, 3);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['DM', 'RB', 'LB', 'MC', 'AMC', 'ST'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'LB':
          arr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC', 'RWB', 'AML'];
          num = getRandomInt(0, 7);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC', 'RWB', 'MR', 'AML', 'AMR', 'AMC'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'RB':
          arr = ['CB', 'MR', 'RWB', 'LB', 'DM', 'MC'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['CB', 'MR', 'RWB', 'LB', 'DM', 'MC', 'AMR', 'LWB'];
          num = getRandomInt(0, 7);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['CB', 'LWB', 'ML', 'LB', 'DM', 'MC', 'RWB', 'MR', 'AML', 'AMR', 'AMC'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'LWB':
          arr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM', 'RB', 'MR'];
          num = getRandomInt(0, 7);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM', 'RB', 'MR', 'CB', 'AMC', 'AMR'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'RWB':
          arr = ['RB', 'MR', 'LWB', 'AMR', 'MC', 'DM'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['LWB', 'MR', 'RB', 'AMR', 'MC', 'DM', 'LB', 'ML'];
          num = getRandomInt(0, 7);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['LWB', 'MR', 'RB', 'AMR', 'MC', 'DM', 'LB', 'ML', 'CB', 'AMC', 'AML'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'MR':
          arr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML', 'LWB', 'DM', 'AMC'];
          num = getRandomInt(0, 8);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML', 'LWB', 'DM', 'AMC', 'LB', 'ST'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'ML':
          arr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR'];
          num = getRandomInt(0, 5);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR', 'RWB', 'DM', 'AMC'];
          num = getRandomInt(0, 8);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR', 'RWB', 'DM', 'AMC', 'RB', 'ST'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
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
          num = getRandomInt(0, max);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['AML', 'AMC', 'ST', 'MR', 'ML', 'RWB', 'LWB', 'MC'];
          num = getRandomInt(0, 7);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['AML', 'AMC', 'ST', 'MR', 'ML', 'RWB', 'LWB', 'MC', 'RB', 'LB', 'DM'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
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
          num = getRandomInt(0, max);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['AMR', 'AMC', 'ST', 'ML', 'MR', 'LWB', 'RWB', 'MC'];
          num = getRandomInt(0, 7);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['AMR', 'AMC', 'ST', 'ML', 'MR', 'LWB', 'RWB', 'MC', 'RB', 'LB', 'DM'];
          num = getRandomInt(0, 10);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
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
          num = getRandomInt(0, max);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['CB', 'MC', 'AMC', 'RB', 'LB', 'LWB', 'RWB', 'MR', 'ML', 'ST'];
          num = getRandomInt(0, 9);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['CB', 'MC', 'AMC', 'RB', 'LB', 'LWB', 'RWB', 'MR', 'ML', 'ST', 'AMR', 'AML'];
          num = getRandomInt(0, 11);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
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
          num = getRandomInt(0, max);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['DM', 'AMC', 'MR', 'ML', 'RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML'];
          num = getRandomInt(0, 11);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['DM', 'AMC', 'MR', 'ML', 'RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML'];
          num = getRandomInt(0, 11);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
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
          num = getRandomInt(0, max);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            
            altPos.push(str[0]);
          }
          compArr = ['DM', 'MC', 'AMR', 'AML', 'ST', 'MR', 'ML'];
          num = getRandomInt(0, 6);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['DM', 'MC', 'AMR', 'AML', 'ST', 'MR', 'ML', 'LWB', 'RWB', 'RB', 'LB', 'CB'];
          num = getRandomInt(0, 11);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        case 'ST':
          arr = ['AMC', 'AMR', 'AML', 'MC']; 
          num = getRandomInt(0, 3);
          for (let i = 0; i < altPosCount; i++) {
            if (num - i < 0) {
              num = arr.length;
            }
            let str = arr[num - i].split(', ');
            altPos.push(str[0]);
          }
          compArr = ['AMC', 'AMR', 'AML', 'MC', 'DM', 'MR', 'ML'];
          num = getRandomInt(0, 6);
          for (let i = 0; i < compPosCount; i++) {
            if (num - i < 0) {
              num = compArr.length;
            }
            str = compArr[num - i].split(', ');

            if (!altPos.includes(str[0])){
              compPos.push(str[0]);
            }
          }
          unArr = ['AMC', 'AMR', 'AML', 'MC', 'DM', 'MR', 'ML', 'RWB', 'LWB', 'CB'];
          num = getRandomInt(0, 9);
          for (let i = 0; i < unPosCount; i++) {
            if (num - i < 0) {
              num = unArr.length;
            }
            str = unArr[num - i].split(', ');

            if (!altPos.includes(str[0]) && !compPos.includes(str[0])){
              unconvincingPos.push(str[0]);
            }
          }
          break;
        default:
            console.log('Error in the function getAltPositions()');
            break;
      }
    }

    
    return {
      altPos,
      compPos,
      unconvincingPos
    }

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
      rating = Math.min(getRandomInt(82,99), getRandomInt(82, 99), getRandomInt(82, 99));
      clubRep = "top50";
    } else if(i < first + second) {
      rating = getRandomInt(76, 81);
      clubRep = "top200";
    } else if (i < first + second + third) {
      rating = getRandomInt(70, 75);
      clubRep = "regularInternational";
    } else if (i < first + second + third + fourth) {
      rating = getRandomInt(62, 69);
      clubRep = "averagePlayer"
    } else if (i < first + second + third + fourth + fifth) {
      rating = getRandomInt(55, 61);
      clubRep = "average2ndDivPlayer";
    } else if (i < first + second + third + fourth + fifth + sixth) {
      rating = getRandomInt(40, 54);
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
      let randIndex = getRandomInt(0, clubArr.length - 1);
      randomIndexArr.push(randIndex);
    }
    // console.log(randomIndexArr, clubArr);

    // About a 60% chance to play for team with same mainNation
    let mainNationChance = getRandomInt(1, 10);
    // About a 40% (45%-5%) chance to play for team with same altNation
    let altNationChance = getRandomInt(1, 20);
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
      let randIndex = getRandomInt(0, randomIndexArr.length - 1);
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
      let randIndex = getRandomInt(0, randomIndexArr.length - 1);
      let club = clubArr[randIndex];
      clubName = club.club;
      clubLogoUrl = club.logo;
      return {
        clubName,
        clubLogoUrl
      };
    } else {
      let randIndex = getRandomInt(0, randomIndexArr.length - 1);
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
      let arr = [getRandomInt(0, 1000), getRandomInt(0, 1000), getRandomInt(0, 1000)];
      ageIndex = median(arr);
    } else if (rating > 76) {
      let sum = getRandomInt(0, 1000) + getRandomInt(0, 1000);
      ageIndex = sum / 2;
    } else {
      ageIndex = getRandomInt(0, 1000);
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
    let randomNum = median([getRandomInt(0, 100), getRandomInt(0, 100)]);
    let half = getRandomInt(0, 1);
    let third = getRandomInt(0, 2);
    let quarter = Math.min(getRandomInt(0, 3), getRandomInt(0, 3));
    let tier = "";
    // console.log("randomNum: ", randomNum);
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
      } else if (randomNum < 98){
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
        let randNum = getRandomInt(1, 10);
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
      let i = Math.min(getRandomInt(0, arr.length - 1), getRandomInt(0, arr.length - 1));
      tier = arr[i];
    }
    // console.log("Rating: ", rating);
    // console.log("Tier: ", tier);
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
        let user = JSON.parse(localStorage.getItem('user') || '');
        this.afs.saveRoster(user.uid, this.players, this.pitchPlayers, this.nationName);
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
      for (let i = 0; i < this.pitchPlayers.length; i++) {
        localStorage.setItem(`TEAMGEN - Starting Player #${i + 1}`, JSON.stringify(this.pitchPlayers[i]));
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
    let user = JSON.parse(localStorage.getItem('user') || '');
    this.afs.getRosterId(user.uid).subscribe((obj) => {
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
          let playerString = localStorage.getItem(`TEAMGEN - Player #${i}`);
          let player: Player;
          if (playerString !== null) {
            player = JSON.parse(playerString);
            this.players.push(player);
            this.sortedData.push(player);
          } 
        }
        for (let i = 0; i < 11; i++) {
          let playerString = localStorage.getItem(`TEAMGEN - Starting Player #${i + 1}`);
          let player: Player;
          if (playerString !== null) {
            player = JSON.parse(playerString);
            this.pitchPlayers.push(player);
            this.sortedData.unshift(player);
          }
        }

        this.startersTotalRating = 0;
        let ratingArr = [];
        for (const player of this.pitchPlayers) {
          if (player.pitchRating !== undefined) {
            ratingArr.push(player.pitchRating);
          } 
          for (let i = 0; i < this.pitchPositions.length; i++) {
            if (player.pitchPositionIndex !== undefined) {
              let boxIndex = this.pitchPositions[player.pitchPositionIndex].boxIndex;
              for (let j = 0; j < this.positionBoxes.length; j++) {
                if (this.positionBoxes[j] === this.positionBoxes[boxIndex]) {
                  this.positionBoxes[j].pitchPlayer = player;
                }
              }
            } else {
              console.log("Error!");
            }
            
          }
        }
        let sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0); 
        let avg = sum / ratingArr.length;
        this.startersTotalRating = Math.round(avg * 10) / 10;

        this.squadTotalRating = 0;
        for (let i = 0; i < 12; i++) {
          ratingArr.push(this.players[i].rating);
        }
        sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0);
        avg = sum / ratingArr.length;
        this.squadTotalRating = Math.round(avg * 10) / 10;



        let combinedPlayers = this.pitchPlayers.concat(this.players);
        for (const player of combinedPlayers) {      
          for (const pos of this.positions) {
            if (player.position === pos.position) {
              pos.amount++;
              break;
            }
          }
        }

        if (this.pitchPlayers.length > 1) {
          this.sortedPitchPlayers = this.pitchPlayers.sort((a,b) => {
            if (a.pitchPositionIndex !== undefined && b.pitchPositionIndex !== undefined) {
              if (a.pitchPositionIndex < b.pitchPositionIndex) {
                return -1
              }
              if (a.pitchPositionIndex > b.pitchPositionIndex) {
                return 1
              }
            }
            return 0
          });
        } else if (this.pitchPlayers.length > 0) {
          this.sortedPitchPlayers = this.pitchPlayers;
        }

        for (const rule of this.squadRules) {
          if (rule.check === '✅') {
            rule.check = '❌';
          }
          this.squadRules[7].text = '';
        }
        if (this.pitchPlayers.length === 11) {
          this.getBackupPositions();
        } else {
          this.squadRules[6].check = '❌';
        }
        console.log("Successfully loaded", this.players, this.pitchPlayers);
      } else {
        throw new Error("Local Storage Data not found");
      }
    } else {
        let user = JSON.parse(localStorage.getItem('user') || '');
        this.afs.getRoster(user.uid, saveLocation).subscribe((obj) => {
          // console.log(obj);
          if (obj !== undefined) {      
            this.players = obj.benchReserves;
            this.sortedData = obj.starters.concat(obj.benchReserves);
            // console.log("GOT PLAYERS: \n", this.players);
            this.pitchPlayers = obj.starters;
            this.nationName = obj.nationOrTier;
            // console.log("Got STARTERS:\n", this.pitchPlayers);
          } else {
            console.log("Problem loading data from firestore");
          }

          this.startersTotalRating = 0;
          let ratingArr = [];
          for (const player of this.pitchPlayers) {
            if (player.pitchRating !== undefined) {
              ratingArr.push(player.pitchRating);
            } 
            for (let i = 0; i < this.pitchPositions.length; i++) {
              if (player.pitchPositionIndex !== undefined) {
                let boxIndex = this.pitchPositions[player.pitchPositionIndex].boxIndex;
                for (let j = 0; j < this.positionBoxes.length; j++) {
                  if (this.positionBoxes[j] === this.positionBoxes[boxIndex]) {
                    this.positionBoxes[j].pitchPlayer = player;
                  }
                }
              } else {
                console.log("Error!");
              }
              
            }
          }
          let sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0); 
          let avg = sum / ratingArr.length;
          this.startersTotalRating = Math.round(avg * 10) / 10;

          this.squadTotalRating = 0;
          for (let i = 0; i < 12; i++) {
            ratingArr.push(this.players[i].rating);
          }
          sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0);
          avg = sum / ratingArr.length;
          this.squadTotalRating = Math.round(avg * 10) / 10;

          let combinedPlayers = this.pitchPlayers.concat(this.players);
          for (const player of combinedPlayers) {      
            for (const pos of this.positions) {
              if (player.position === pos.position) {
                pos.amount++;
                break;
              }
            }
          }

          if (this.pitchPlayers.length > 1) {
            this.sortedPitchPlayers = this.pitchPlayers.sort((a,b) => {
              if (a.pitchPositionIndex !== undefined && b.pitchPositionIndex !== undefined) {
                if (a.pitchPositionIndex < b.pitchPositionIndex) {
                  return -1
                }
                if (a.pitchPositionIndex > b.pitchPositionIndex) {
                  return 1
                }
              }
              return 0
            });
          } else if (this.pitchPlayers.length > 0) {
            this.sortedPitchPlayers = this.pitchPlayers;
          }
          for (const rule of this.squadRules) {
            if (rule.check === '✅') {
              rule.check = '❌';
            }
            this.squadRules[7].text = '';
          }
          if (this.pitchPlayers.length === 11) {
            this.getBackupPositions();
          } else {
            this.squadRules[6].check = '❌';
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

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
}