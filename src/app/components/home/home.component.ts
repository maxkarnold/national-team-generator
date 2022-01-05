import { Component, OnDestroy, OnInit} from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service'

import { Player } from 'src/app/models/player';
import { OutfieldAttributes } from 'src/app/models/outfieldAttributes';
import { GkAttributes } from 'src/app/models/gkAttributes';
import { LastName } from 'src/app/models/last-name';
import { FirstName } from 'src/app/models/first-name';
import { PositionBox } from 'src/app/models/positionBox';
import { positionBoxes } from 'src/app/data/positionBoxes';
import { SubmittedRoster } from 'src/app/models/submittedRoster';

import * as nationsModule from '../../data/nations/nations.json';
import * as clubsModule from '../../data/clubs/clubs.json';
import * as positionsModule from '../../data/positions.json';
import * as pitchPositionsModule from '../../data/pitchPositions.json';

import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import{ CdkDragDrop, CdkDragRelease, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit, OnDestroy {
  
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
  nationsList: any[];
  clubs: any = (clubsModule as any).default;
  
  isLoggedIn = false;
  subscription: Subscription = new Subscription;
  
  saveDataOverlayOpen = false;
  loadDataOverlayOpen = false;
  instructionsOpen = false;
  nationOrTier = "";
  rosterId = "";
  nationSelectValue = "s tier"
  realisticNationalities = true;
  startersTotalRating = 0;
  squadTotalRating = 0;
  formation = "";
  chemistry = 0;
  squadRules = [
    {
      text: '1 starting goalkeeper', 
      check: '❌'
    },
    {
      text: 'EXACTLY 3 goalkeepers in squad', 
      check: '❌'
    },
    {
      text: '3-4 starting defenders', 
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
      text: 'Valid formation',
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
    for (const tierObj of this.nations) {
      for (let i = 0; i < tierObj.nations.length; i++) {
        this.nationsList.push(tierObj.nations[i]);
      }
    }
    this.subscription = this.auth.currentAuthState.subscribe(authState => this.isLoggedIn = authState);
    if (this.isLoggedIn === true && localStorage.getItem("TEAMGEN - Player #0")) {
      this.loadPlayers('loadLocalStorage')
    }
  }
  
  ngOnDestroy (): void {
    this.subscription.unsubscribe();
  }
  
  goToRoster(el: any) {
    if (el === 'topPage') {
      window.scroll(
        {
          top: 0,
          left: 0,
          behavior: 'smooth'
        }
      );
    } else {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }
    
  async submitRoster() {
    for (const rule of this.squadRules) {
      if (rule.check === '❌') {
        alert('Must pass all squad requirements to submit.')
        return false
      }
    }
    let submittedRoster: SubmittedRoster;
    let user$ = this.auth.getUser();
    // let user = await user$.first().toPromise();
    alert("Leaderboards are currently unavailable. Please try again later.");
    // .subscribe((user) => {
    //   if (user && user.email !== null) {
    //     let nationName = '';
    //     let tierName = '';
    //     let id = this.rosterId;
    //     if (this.nationOrTier.includes(' tier')) {
    //       nationName = 'random';
    //       tierName = this.nationOrTier.slice(0, 1);
    //     } else {
    //       nationName = this.nationOrTier;
    //       tierName = this.getNation("tier").tier || '';
    //     }
    //     let sortedRoster = this.pitchPlayers.concat(this.players);
    //     sortedRoster = sortedRoster.sort((a, b) => {
    //       let isAsc = false;
    //       return compare(a.rating, b.rating, isAsc);
    //     });
    //     submittedRoster = {
    //       user: user.email,
    //       id: id,
    //       tier: tierName,
    //       nation: nationName,
    //       startersRating: this.startersTotalRating,
    //       squadRating: this.squadTotalRating,
    //       formation: this.formation,
    //       roster: {
    //         sortedRoster: sortedRoster
    //       }
    //     }
    //     this.afs.getSubmittedRosters().subscribe((data) => {
    //       for (const roster of data) {
    //         if (roster.payload.doc.id === this.rosterId) {
    //           alert("Already submitted roster");
    //           return false
    //         }
    //       }
    //     
    //       alert("Check leaderboards page to see your roster");
    //     });  
    //   } else {
    //     throw new Error("User not signed in - login error");
    //   }
    // });
  }
    
  infoOverlay() {
    if (!this.instructionsOpen) {
      this.instructionsOpen = true;
    } else {
      this.instructionsOpen = false;
    }
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
      this.squadRules[8].check = '→';
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
    let startGkCount = 0;
    
    let DMCount = 0;
    let WBCount = 0;
    let AMCCount = 0;
    let AMRLCount = 0;
    let MCCount = 0;
    let MRLCount = 0;
    let DFCount = 0;
    let STCount = 0;
    
    for (const player of this.pitchPlayers) {
      
      if (player.pitchPosition?.includes("DM")) {
        DMCount++;
        startMidCount++;
      } else if (player.pitchPosition?.slice(0, 1) === "D") {
        DFCount++;
      } else if (player.pitchPosition?.includes("WB")) {
        WBCount++;
      } else if (player.pitchPosition?.includes("AMC")) {
        AMCCount++;
        startMidCount++;
      } else if (player.pitchPosition?.includes("STC")) {
        STCount++;
      } else if (player.pitchPosition?.includes("AM")) {
        AMRLCount++;
      } else if (player.pitchPosition?.includes("MC")) {  
        MCCount++;
      } else if (player.pitchPosition?.includes("M")) {
        MRLCount++;
      } else {
        startGkCount++;
      }
    }
    for (const player of squad) {
      if (player.mainPositions.includes('GK')) {
        gkCount++;
      } else if (player.mainPositions.includes("B")) {
        defCount++;
      } else if (player.mainPositions.includes("M")) {
        midCount++;
      } else {
        fwCount++;
      }
    } 
    // Formation
    
    if (DFCount === 4) {
      if (DMCount === 1) {
        if (MCCount === 1 && MRLCount === 1 && AMCCount === 1 && AMRLCount === 1 && STCount === 1) {
          this.formation = "4-1-4-1 DM Asymmetric AM (R/L)";
        } else if (MCCount === 2) {
          if (AMCCount === 1 && STCount === 2) {
            this.formation = "4-4-2 Diamond Narrow";
          } else if (AMCCount === 2 && STCount === 1) {
            this.formation = "4-1-2-3 DM AM Narrow";
          } else if (AMRLCount === 2 && STCount === 1) {
            this.formation = "4-1-4-1 DM Wide";
          } else if (MRLCount === 2 && STCount === 1) {
            this.formation = "4-1-4-1 DM";
          } else if (STCount === 3) {
            this.formation = "4-1-2-3 DM Narrow";
          } else {
            this.formation = "N/A";
          }
        } else if (MCCount === 3) {
          if (AMCCount === 1 && STCount === 1) {
            this.formation = "4-1-3-1-1 DM AM Narrow";
          } else if (STCount === 2) {
            this.formation = "4-1-3-2 DM Narrow";
          } else {
            this.formation = "N/A";
          }
        } else {
          this.formation = "N/A";
        }
      } else if (DMCount === 2) {
        if (MCCount === 1 && AMRLCount === 2 && STCount === 1) {
          this.formation = "4-2-1-3 DM Wide";
        } else if (MCCount === 1 && MRLCount === 2 && STCount === 1) {
          this.formation = "4-2-3-1 DM MC Wide";
        } else if (MCCount === 3 && STCount === 1) {
          this.formation = "4-2-3-1 DM";
        } else if (MCCount === 2 && AMCCount === 1 && STCount === 1) {
          this.formation = "4-2-2-1-1 DM AM Narrow";
        } else if (MCCount === 2 && STCount === 2) {
          this.formation = "4-2-2-2 DM Narrow";
        } else if (AMCCount === 1 && AMRLCount === 2 && STCount === 1) {
          this.formation = "4-2-3-1 DM AM Wide";
        } else if (AMRLCount === 2 && STCount === 2) {
          this.formation = "4-2-4 DM Wide";
        } else if (AMCCount === 3 && STCount === 1) {
          this.formation = "4-2-3-1 DM AM Narrow";
        } else if (MRLCount === 2 && AMCCount === 1 && STCount === 1) {
          this.formation = "4-4-1-1 2DM";
        } else if (AMCCount === 2 && STCount === 2) {
          this.formation = "4-2-2-2 DM AM Narrow";
        } else if (MRLCount === 2 && STCount === 2) {
          this.formation = "4-2-2-2 DM"; 
        } else {
          this.formation = "N/A";
        }
      } else if (MCCount === 2) {
        if (AMRLCount > 0) {
          if (STCount === 2 && AMRLCount === 2) {
            this.formation = "4-2-4 Wide";
          } else if (AMCCount === 1 && AMRLCount === 2 && STCount === 1) {
            this.formation = "4-2-3-1 Wide";
          } else {
            this.formation = "N/A";
          }
        } else if (AMCCount > 0) {
          if (STCount === 2 && AMCCount === 2) {
            this.formation = "4-2-2-2 Narrow";
          } else if (STCount === 1 && AMCCount === 3) {
            this.formation = "4-2-3-1 Narrow";
          } else {
            this.formation = "N/A";
          }
        } else {
          this.formation = "N/A";
        }
      } else if (MCCount === 3) {
        if (AMRLCount === 2 && STCount === 1) {
          this.formation = "4-3-3 Wide";
        } else if (AMCCount === 1 && STCount === 2) {
          this.formation = "4-3-1-2 Narrow";
        } else if (AMCCount === 2 && STCount === 1) {
          this.formation = "4-3-2-1 Narrow";
        } else if (STCount === 3) {
          this.formation = "4-3-3 Narrow";
        } else {
          this.formation = "N/A";
        }
      } else if (MRLCount === 2) {
        if (MCCount === 3 && STCount === 1) {
          this.formation = "4-5-1";
        } else if (MCCount === 2 && AMCCount === 1) {
          this.formation = "4-4-1-1";
        } else if (MCCount === 2 && STCount === 2) {
          this.formation = "4-4-2";
        } else {
          this.formation = "N/A";
        }
      } else {
        this.formation = "N/A";
      }
    } else if (DFCount === 3) {
      if (WBCount === 2) {
        if (DMCount === 1) {
          if (MCCount === 3 && STCount === 1) {
            this.formation = "5-1-3-1 DM WB";
          } else if (STCount === 2 && MCCount === 2) {
            this.formation = "5-1-2-2 DM WB";
          } else if (MCCount === 2 && AMCCount === 1 && STCount === 1) {
            this.formation = "5-4-1 Diamond WB";
          } else {
            this.formation = "N/A";
          }
        } else if (DMCount === 2) {
          if (MCCount === 2 && STCount === 1) {
            this.formation = "3-4-2-1 DM";
          } else if (AMRLCount === 2 && STCount === 1) {
            this.formation = "3-4-3 DM Wide";
          } else if (AMCCount === 2 && STCount === 1) {
            this.formation = "3-4-2-1 DM AM";
          } else if (MCCount === 1 && STCount === 2) {
            this.formation = "5-2-1-2 DM WB";
          } else if (AMCCount === 1 && STCount === 2) {
            this.formation = "5-2-1-2 DM AM WB";
          } else {
            this.formation = "N/A";
          }
        } else if (MCCount === 2) {
          if (AMRLCount === 2 && STCount === 1) {
            this.formation = "5-4-1 WB Wide";
          } else if (AMCCount === 2 && STCount === 1) {
            this.formation = "5-2-2-1 WB";
          } else if (AMCCount === 1 && STCount === 2) {
            this.formation = "5-2-1-2 WB";
          } else {
            this.formation = "N/A";
          }
        } else if (MCCount === 3) {
          if (STCount === 2) {
            this.formation = "5-3-2 WB";
          } else if (AMCCount === 1 && STCount === 1) {
            this.formation = "5-3-1-1 WB";
          } else {
            this.formation = "N/A";
          }
        } else {
          this.formation = "N/A";
        }
      } else if (MRLCount === 2) {
        if (DMCount === 2 && AMCCount === 2 && STCount === 1) {
          this.formation = "3-4-2-1 DM AM MRL";
        }
      } else {
        this.formation = "N/A";
      }
    } else {
      this.formation = "N/A";
    }
    
    let formObj = {
      def: DFCount,
      dm: DMCount,
      wb: WBCount,
      mc: MCCount,
      mrl: MRLCount,
      amc: AMCCount,
      amrl: AMRLCount,
      st: STCount
    };
    // this.calcChemistry(formObj);
    let count = [gkCount, defCount, midCount, fwCount, startGkCount, DFCount, startMidCount, STCount];
    return this.checkSquadRules(count);
  }
  
  checkSquadRules(countArr: number[]): boolean {
    
    if (countArr[4] > 0) {
      this.squadRules[0].check = '✅';
    } else {
      this.squadRules[0].check = '❌';
    }
    if (countArr[0] === 3) {
      this.squadRules[1].check = '✅';
    } else {
      this.squadRules[1].check = '❌';
    }
    if (countArr[5] > 2 && countArr[5] < 5) {
      this.squadRules[2].check = '✅';
    } else {
      this.squadRules[2].check = '❌';
    }
    if (countArr[1] > 5) {
      this.squadRules[3].check = '✅';
    } else {
      this.squadRules[3].check = '❌';
    }
    if (countArr[6] > 1 && countArr[6] < 7) {
      this.squadRules[4].check = '✅';
    } else {
      this.squadRules[4].check = '❌';
    }
    if (countArr[2] > 4) {
      this.squadRules[5].check = '✅';
    } else {
      this.squadRules[5].check = '❌';
    }
    if (this.formation !== 'N/A') {
      this.squadRules[6].check = '✅'
    } else {
      this.squadRules[6].check = '❌';
    }
    
    
    
    for (const rule of this.squadRules) {
      if (rule.check === '❌') {
        return false
      }
    }
    return true
  }
  
  checkStars(starterRating: number, squadRating: number) {
    document.documentElement.style.setProperty('--starter-rating', `${starterRating}%`);
    document.documentElement.style.setProperty('--squad-rating', `${squadRating}%`);
  }
    
  calcChemistry(obj: any) {
    // chemistry reset
    for (const player of this.pitchPlayers) {
      player.chemistryNum = 0;
    }
    this.chemistry = 0;
      
    let chemArr = [];
    if (this.formation !== 'N/A') {
      if (obj.def === 4) {
        chemArr.push(
          ['GK', 'DCL'],
          ['GK', 'DCR'],
          ['DCR', 'DCL'],
          ['DCL', 'DL'],
          ['DCR', 'DR']
        );
        if (this.formation === "4-1-4-1 DM Asymmetric AM (R/L)") {
          chemArr.push(
            ['STC', 'multi', 'AMC', 'AMCR', 'AMCL'],
            ['DR', 'multi', 'AMR', 'MR'],
            ['DL', 'multi', 'AML', 'ML'],
            ['AMC', 'MC'],
            ['STC', 'AMC'],
            ['MC', 'DMC'],
            ['DMC', 'DCL'],
            ['DMC', 'DCR']
          );
        }
      } else if (obj.def === 3) {
        chemArr.push(
          ['GK', 'DCL'],
          ['GK', 'DCR'],
          ['GK', 'DC'],
          ['DCL', 'DC'],
          ['DCR', 'DC'],
          ['DCR', 'WBR'],
          ['DCL', 'WBL']
        );
      }
    }
    for (const arr of chemArr) {
      let first;
      let second;
      for (const player of this.pitchPlayers) {   
        // check for multiple possible positions for player1
        if (arr[0] === 'multi') {
          for (let i = 1; i < arr.length; i++) {
            if (player.pitchPosition === arr[i]) {
              first = player;
              break;
            }
          }
        }
        // Check for first player in chem pair
        else if (player.pitchPosition === arr[0]) { 
          first = player;
        }
        // check for multiple possible positions for player2
        else if (arr[1] === 'multi') {
          for (let i = 2; i < arr.length; i++) {
            if (player.pitchPosition === arr[i]) {
              second = player;
              break;
            }
          }
        } else if (player.pitchPosition === arr[1]) { // Check for second player in chem pair
          second = player;
        }
        if (first && second && first.chemistryNum && second.chemistryNum) {
          if (first.nationality === second.nationality) {
            this.chemistry++;
            first.chemistryNum++;
            second.chemistryNum++;
          }
          if (first.club === second.club) {
            this.chemistry++;
            first.chemistryNum++;
            second.chemistryNum++;
          }
          break;
        }
      }  
    }
  } 

          
  getChemColor(player: Player) {
    if (player.chemistryNum) {
      if (player.chemistryNum === 1) {
        return '1px dashed yellow'
      } else if (player.chemistryNum === 2) {
        return '1px dashed lime'
      } else if (player.chemistryNum > 2) {
        return '1px dashed pink'
      } else {
        return '1px solid #353535'
      }
    }
    
  }
          
  calcStartersRating() {
    let startersArr: number[] = [];
    for (const player of this.pitchPlayers) {
      if (player.pitchRating !== undefined) {
        switch (player.pitchPosition) {
          case "DR":
          case "DL":
          startersArr.push(player.pitchRating * 0.88);
          break;
          case "WBL":
          case "WBR":
          case "MR":
          case "ML":
          startersArr.push(player.pitchRating * 0.97);
          break;
          case "GK":
          case "DCR":
          case "DCL":
          case "DC":
          case "AMR":
          case "AML":
          startersArr.push(player.pitchRating * 0.99);
          break;
          case "AMCR":
          case "AMC":
          case "AMCL":
          case "DMC":
          case "DMR":
          case "DML":
          startersArr.push(player.pitchRating * 1.01);
          break;
          case "STC":
          case "STCL":
          case "STCR":
          case "MC":
          case "MCR":
          case "MCL":
          startersArr.push(player.pitchRating * 1.03);
          break;
          default:
          console.log("error");
          break;
        }
      } else {
        console.log("Error: check home component");
      }
      
    }
    let sum = startersArr.reduce((partial_sum, a) => partial_sum + a,0); 
    let avg = sum / startersArr.length;
    this.startersTotalRating = Math.round(avg * 10) / 10;
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
    let playersLeft = this.players.slice(0, 12);
    for (let j = 0; j < this.players.slice(0, 12).length; j++) { // for each player on the bench
      
      let used = false;
      let duplicates: string[] = [];
      
      for (let i = 0; i < startingPositions.length; i++) { // for each position in the starting lineup
        if (!duplicates.includes(startingPositions[i]) && startingPositions[i] !== '') { // if position hasn't already been used by same player
          for (const mainPos of playersLeft[j].mainPositions) {
            if (startingPositions[i] === mainPos) { // if main pos mathces
              used = true;
              duplicates.push(startingPositions[i]);
              startingPositions[i] = '';
              break;
            }
          }
          for (const altPos of playersLeft[j].altPositions) {
            if (startingPositions[i] === altPos) { // if altPos matches

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
    
    this.squadRules[8].text = '';
    for (let i = 0; i < startingPositions.length; i++) {
      if (startingPositions[i] !== '') {
        this.squadRules[8].text += ` ${startingPositions[i]}`;
      }
    }
    if (this.squadRules[8].text === '') {
      this.squadRules[7].check = '✅';
    } else {
      this.squadRules[7].check = '❌';
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
            if (player.mainPositions.includes(pos.playerPosition)) {
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
            else if ((pos.playerPosition === "GK" && !player.mainPositions.includes('GK')) || (pos.playerPosition !== "GK" && player.mainPositions.includes('GK'))) {
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
        case 'mainPositions': return compare(a.mainPositions[0], b.mainPositions[0], isAsc);
        case 'altPositions': return compare(a.altPositions[0], b.altPositions[0], isAsc);
        case 'foot': return compare(a.foot, b.foot, isAsc);
        case 'rating': return compare(a.rating, b.rating, isAsc);
        case 'age': return compare(a.age, b.age, isAsc);
        case 'nationality': return compare(a.nationality, b.nationality, isAsc);
        case 'roleDuty': return compare(a.preferredRole, b.preferredRole, isAsc);
        // case 'displayHeight': return compare(a.height, b.height, isAsc);
        // case 'weight': return compare(a.weight, b.weight, isAsc);
        default: return 0;
      }
    });
  }
          
  drop(event: CdkDragDrop<Player[]>) {
    let newPlayerIndex = event.previousIndex;
    let newPlayer = event.previousContainer.data[newPlayerIndex];
    let positionIndex = parseInt(event.container.element.nativeElement.classList[1]);
    
    if (event.previousContainer === event.container) {
      // if moving within same container
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
    else if (event.previousContainer.id === "bench-players") {
      // if moving from bench container and to the pitch
      // Check for 11 players in starting lineup and no player swap
      if (this.pitchPlayers.length === 11 && event.container.element.nativeElement.innerText === "") {
        alert("You can only have 11 players starting.");
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
          console.log('Error in drop() function');
        break;
      }  
      
      // if swapping a player
      if (event.container.element.nativeElement.innerText !== "") {
        for (let i = 0; i < this.pitchPlayers.length; i++) {
          if (this.pitchPlayers[i].pitchPosition === newPlayer.pitchPosition) { 
            let oldPlayer = this.pitchPlayers[i];
            oldPlayer.pitchPosition = undefined;
            oldPlayer.pitchPositionIndex = undefined;
            this.pitchPlayers.splice(i, 1);
            this.players.splice(newPlayerIndex, 1, oldPlayer);
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
        console.log("Error in drop() function");
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
        }
      }
      
      this.calcStartersRating();
      
      this.squadTotalRating = 0;
      for (let i = 0; i < 12; i++) {
        ratingArr.push(this.players[i].rating);
      }
      let sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0);
      let avg = sum / ratingArr.length;
      this.squadTotalRating = Math.round(avg * 10) / 10;
      this.checkStars(this.startersTotalRating, this.squadTotalRating);
      
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
        this.squadRules[7].check = '❌';
      }
      
    }, 250);
  }
            
  getPositionOutline(event: CdkDragStart) {
    let player: Player = event.source.data.pitchPlayer || event.source.data;
    // Add a placeholder element in origin
    
    // Get the displayName for the current player
    
    if (player.singleLastName.length < 8) {
      player.displayName = player.singleLastName;
    } else {
      let firstName = player.firstName.split(" ");
      player.displayName = firstName[0];
    }
    
    // // Grab the current positions for the dragged player
    
    let mainPosArr = player.mainPositions;
    let altPosArr = player.altPositions;
    let compPosArr = player.competentPositions;
    let unPosArr = player.unconvincingPositions;
    let limeArr = [];
    let darkGreenArr = [];
    let yellowGreenArr = [];
    let orangeArr = [];
    
    for (let i = 0; i < this.pitchPositions.length; i++) {
      if (mainPosArr.includes(this.pitchPositions[i].playerPosition)) {
        // For each main position
        for (let j = 0; j < mainPosArr.length; j++) {
          // if the player's main position matches the playerPosition
          if (mainPosArr[j] === this.pitchPositions[i].playerPosition) {
            // push taht position to the array
            limeArr.push(this.pitchPositions[i].position);
          }
        }
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
            else if ((mainPosArr.includes('GK') && this.pitchPositions[i].position !== 'GK') || (!mainPosArr.includes('GK') && this.pitchPositions[i].position === 'GK')) {
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
            
            
            
  async getPlayers() {
    if (!this.isLoggedIn) {
      alert("You must login to generate a team.");
      return false
    }
    if (this.nationSelectValue === "") {
      alert("You must select a nation or random nationalities before generating a team");
      return false
    }
    // *** KEEP THIS COMMENTED FOR DEV BRANCH ***
    // let lastTime: any = localStorage.getItem('Last request time');
    // if (lastTime !== null) {
    //   lastTime = parseInt(lastTime);
    //   let currentTime = new Date().getTime();
    //   if (lastTime + 300000 > currentTime) { // if 5 minutes haven't passed since last request
    //     let timeLeft = (lastTime + 300000) - currentTime;
    //     let min = Math.floor(timeLeft / 60000);
    //     let seconds = Math.round((timeLeft % 60000) / 1000)
    //     let str = seconds == 60 ? (min+1) + ":00" : min + ":" + (seconds < 10 ? "0" : "") + seconds;
        
    //     alert(`Please wait ${str} to generate a new team.`);
    //     return false;
    //   }
    // }
    // *** KEEP THIS COMMENTED FOR DEV BRANCH ***
    if (this.players.length > 0) {
      if (window.confirm("Are you sure? Any unsaved data will be deleted.")) {
        this.resetStarters(true);
      } else {
        return false
      }
    }
    let timestamp = new Date().getTime().toString();
    localStorage.setItem('Last request time', timestamp);
    // RESETS
    this.playerCount = 0;
    this.players = [];
    this.sortedData = [];
    this.sortedPitchPlayers = [];
    this.pitchPlayers = [];
    this.rosterId = "";
    this.nationOrTier = this.nationSelectValue;
    for (let index in this.positions) {
      this.positions[index].amount = 0;
    }
    for (const rule of this.squadRules) {
      if (rule.check === '✅') {
        rule.check = '❌';
      }
      this.squadRules[8].text = '';
    }
    
    let tier = this.getNation("tier").tier || '';
    let numArray: number[] = this.getRatingBreakdown(tier);
    
    let first = getRandomInt(numArray[0], numArray[1]);
    let second = getRandomInt(numArray[2], numArray[3]);
    let third = getRandomInt(numArray[4], numArray[5]);
    let fourth = getRandomInt(numArray[6], numArray[7]);
    let fifth = getRandomInt(numArray[8], numArray[9]);
    let sixth = getRandomInt(numArray[10], numArray[11]);
    let seventh = getRandomInt(numArray[12], numArray[13]);
    let eighth = getRandomInt(numArray[14], numArray[15]);
    
    
    // Loops 60 times for 60 players
    while (this.playerCount < 60) {
      
      let player: Player = {
        firstName: '',
        lastName: '',
        firstInitial: '',
        singleLastName: '',
        firstNameUsage: '',
        lastNameUsage: '',
        mainPositions: [],
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
        height: 0,
        weight: 0,
        chemistryNum: 0,
        attributes: {} as GkAttributes | OutfieldAttributes,
        weakFoot: 0,
        club: '',
        clubLogo: this.blankCrest,
        playerFace: this.blankPlayerPic
      };
      
      let ratingObj = this.getRatingAndClubRep(this.playerCount, first, second, third, fourth, fifth, sixth, seventh, eighth);
      player.rating = ratingObj.rating;

      player.mainPositions = this.getMainPositions(player.rating);
      
      player.foot = this.getFoot(player.mainPositions[0]);
      let positionsObj = this.getAltPositions(player.mainPositions, player.foot);
      player.altPositions = positionsObj.altPos;
      player.competentPositions = positionsObj.compPos;
      player.unconvincingPositions = positionsObj.unconvincingPos;

      player.age = this.getAge(player.rating, player.mainPositions[0]);
      
      let roleObj = this.getPositionRole(player.mainPositions, player.altPositions, player.foot, player.rating, player.age);
      player.preferredRole = roleObj.role;
      player.preferredDuty = roleObj.duty;
      
      let nationObj = this.getNation("nationality", player.rating) || '';
      player.nationality = nationObj.nationality || '';
      player.nationalityLogo = nationObj.logo || '';
      console.log("Player#: ", this.playerCount);
      let clubObj = this.getClub(ratingObj.clubRep, player.nationality);
      player.club = clubObj.clubName;
      player.clubLogo = clubObj.clubLogoUrl;
      
      
      // let attrObj = this.getAttributes(player.position, player.altPositions,player.preferredRole, player.preferredDuty, player.rating, player.age);
      // player.height = attrObj.height;
      // player.displayHeight = `${player.height * 12}' ${player.height % 12}"`;
      // player.weight = attrObj.weight;
      // player.weakFoot = attrObj.weakFoot;
      // player.attributes = attrObj.attributes;
      let randomNum = getRandomInt(1, 100);
      if (randomNum > 25) {
        randomNum = 0;
      } else if (randomNum > 10) {
        randomNum = 1;
      } else if (randomNum > 5) {
        randomNum = 2;
      } else if (randomNum > 2) {
        randomNum = 3;
      } else if (randomNum > 0) {
        randomNum = 4;
      }
      let {request$: firstNameReq, retryRequest$: firstNameRetry, patronym: firstNameUsage, names} = this.afs.getFirstName(player.nationality, randomNum);

      firstNameReq.subscribe((firstNameArr) => {
        if (firstNameArr[0] !== undefined) {
          console.log("First Name Usage within home component: ", firstNameUsage, firstNameArr);
          player.firstNameUsage = firstNameUsage;
          for (let i = 0; i < firstNameArr.length; i++) {
            if (i === 0) {
              player.firstName = firstNameArr[i].name
            } else {
              player.firstName = player.firstName + " " + firstNameArr[i].name;
            }
            
          }
          
          player.firstInitial = player.firstName.charAt(0);
          if (player.firstInitial === "'") {
            player.firstInitial = player.firstName.charAt(1);
          }
          if (names > 1) {
            if (firstNameUsage === 'Russian' || firstNameUsage === 'Kazakh' || firstNameUsage === 'Tajik') { 
              let nameLength = player.firstName.length;
              let vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
              let chance = getRandomInt(0, 2);
              if (chance > 0 && firstNameUsage === 'Kazakh') {
                player.firstName += 'uly';
              } else if (vowels.includes(player.firstName.charAt(nameLength - 1))) {
                player.firstName += 'evich';
              } else {
                player.firstName += 'ovich';
              }
            } else if (firstNameUsage === 'Ukrainian' || (firstNameUsage === 'Belarusian' &&  player.firstName.includes(' '))) {
              player.firstName += 'vych';
            } else if (firstNameUsage === 'Azerbaijani') {
              player.firstName += ' oğlu';
            } else if (firstNameUsage === 'Turkmen') {
              player.firstName += 'owiç';
            }
          }
          
        } 
        else {
          firstNameRetry.subscribe((firstNameArr) => { 
            player.firstNameUsage = firstNameUsage;
            for (let i = 0; i < firstNameArr.length; i++) {
              if (i === 0) {
                player.firstName = firstNameArr[i].name
              } else {
                player.firstName = player.firstName + " " + firstNameArr[i].name;
              }
            }
            player.firstInitial = player.firstName.charAt(0);
            if (player.firstInitial === "'") {
              player.firstInitial = player.firstName.charAt(1);
            }
            if (names > 1) {
              if (firstNameUsage === 'Russian' || firstNameUsage === 'Kazakh' || firstNameUsage === 'Tajik') { 
                let nameLength = player.firstName.length;
                let vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
                let chance = getRandomInt(0, 2);
                if (chance > 0 && firstNameUsage === 'Kazakh') {
                  player.firstName += 'uly';
                } else if (vowels.includes(player.firstName.charAt(nameLength - 1))) {
                  player.firstName += 'evich';
                } else {
                  player.firstName += 'ovich';
                }
              } else if (firstNameUsage === 'Ukrainian' || (firstNameUsage === 'Belarusian' &&  player.firstName.includes(' '))) {
                player.firstName += 'vych';
              } else if (firstNameUsage === 'Azerbaijani') {
                player.firstName += ' oğlu';
              } else if (firstNameUsage === 'Turkmen') {
                player.firstName += 'owiç';
              }
            }
          });
        }
        // add nickname based on nationality
        // About 90% chance: Mozambique
        // About 50% chance: Brazil, Spain, Portugal, Angola, Equatorial Guinea, Guinea-Bissau
      });
      
      let {request$: lastNameReq, retryRequest$: lastNameRetry, patronym: lastNameUsage, names: lastNames} = this.afs.getLastName(player.nationality, randomNum);

      lastNameReq.subscribe((lastNameArr) => {
        if (lastNameArr[0] !== undefined) {
          player.lastNameUsage = lastNameUsage;
          let articleUsed = false;
          for (let i = 0; i < lastNameArr.length; i++) {
            let chance = getRandomInt(1, 4);
            let surname: string = lastNameArr[i].name;
            if (lastNameUsage === 'Portuguese' && chance > 3 && articleUsed === false && lastNameArr[i].name.slice(0) !== 'D') {
              
              let articles = [];
              if (surname.slice(-1) === 's') {
                if (surname.slice(-2) !== 'as') {
                  articles = ['dos', 'de'];
                } else {
                  articles = ['das', 'de'];
                }
              } else if (surname.slice(-1) !== 'o') {
                articles = ['da', 'de'];
              } else {
                articles = ['do', 'de'];
              }
              let chance = getRandomInt(0, 1);
              let chosenArticle = articles[chance];
              surname = chosenArticle + ' ' + surname;
              articleUsed = true;
              
            }
            if (i === 0) {
              player.lastName = surname;
            } else {
              player.lastName = player.lastName + " " + surname;
            }
          }
          
          if (lastNameUsage === 'Icelandic' || lastNameUsage === 'Faroese') {
            player.lastName += 'sson';
          } else if (lastNameUsage === 'Malay') {
            player.lastName = 'bin ' + player.lastName;
          } else if (lastNameUsage === 'Kyrgyz') {
            let chance = getRandomInt(0, 1);
            let patronymArticle = ['uulu', 'tegin'];
            player.lastName = player.lastName + ' ' + patronymArticle[chance];
          } else if (lastNameUsage === 'Azerbaijani') {
            let nameLength = player.lastName.length;
            let vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
            let chance = getRandomInt(0, 2);
            if (chance > 1) {
              player.lastName += 'lı';
            } else if (chance > 0) {
              player.lastName += 'zade';
            } else {
              if (vowels.includes(player.lastName.charAt(nameLength - 1))) {
                let chance = getRandomInt(0, 1);
                let patronymArticle = ['ev', 'yev'];
                player.lastName += patronymArticle[chance];
              } else {
                player.lastName += 'ov';
              }
            }
            
          }
        } 
        else {
          lastNameRetry.subscribe((lastNameArr) => { 
            player.lastNameUsage = lastNameUsage;
            let articleUsed = false;
            for (let i = 0; i < lastNameArr.length; i++) {
              let chance = getRandomInt(1, 4);
              let surname: string = lastNameArr[i].name;
              if (lastNameUsage === 'Portuguese' && chance > 3 && articleUsed === false && lastNameArr[i].name.slice(0) !== 'D') {
                
                let articles = [];
                if (surname.slice(-1) === 's') {
                  if (surname.slice(-2) !== 'as') {
                    articles = ['dos', 'de'];
                  } else {
                    articles = ['das', 'de'];
                  }
                } else if (surname.slice(-1) !== 'o') {
                  articles = ['da', 'de'];
                } else {
                  articles = ['do', 'de'];
                }
                let chance = getRandomInt(0, 1);
                let chosenArticle = articles[chance];
                surname = chosenArticle + ' ' + surname;
                articleUsed = true;
                
              }
              if (i === 0) {
                player.lastName = surname;
              } else {
                player.lastName = player.lastName + " " + surname;
              }
            }
            if (lastNameUsage === 'Icelandic' || lastNameUsage === 'Faroese') {
              player.lastName += 'sson';
            } else if (lastNameUsage === 'Malay') {
              player.lastName = 'bin ' + player.lastName;
            } else if (lastNameUsage === 'Kyrgyz') {
              let chance = getRandomInt(0, 1);
              let patronymArticle = ['uulu', 'tegin'];
              player.lastName = player.lastName + ' ' + patronymArticle[chance];
            } else if (lastNameUsage === 'Azerbaijani') {
              let nameLength = player.lastName.length;
              let vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
              let chance = getRandomInt(0, 2);
              if (chance > 1) {
                player.lastName += 'lı';
              } else if (chance > 0) {
                player.lastName += 'zade';
              } else {
                if (vowels.includes(player.lastName.charAt(nameLength - 1))) {
                  let chance = getRandomInt(0, 1);
                  let patronymArticle = ['ev', 'yev'];
                  player.lastName += patronymArticle[chance];
                } else {
                  player.lastName += 'ov';
                }
              }
              
            }
          });
        }
        // singleLastName
        let arr = player.lastName.split(' ');
        player.singleLastName = arr[0];
      });
      
      // getMiddleName function
      this.players.push(player);
      this.sortedData.push(player);
      this.playerCount++;
    }
    
    window.setTimeout(() => {
      this.players = this.players.sort((a, b) => {
        let isAsc = false;
        return compare(a.rating, b.rating, isAsc);
      });
      this.sortedData = this.players;
      console.log(this.players);
    }, 5000, this.players);
    
  }
            
  getNation(property: string, rating?: number) {
    
    if (property === "tier") {
      let nationality: string = this.nationOrTier;
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
          nationality = this.nationsList[randomNum].name;
        }
        
      }
      for (const tier of this.nations) {
        for (const nation of tier.nations) {     
          if (nationality === nation.name) {
            logo = nation.logo;
          }
        }
      }
      return {
        nationality,
        logo
      }
    }
  }
            
  getMainPositions(rating: number) { // should return an array of positions
    let chance = getRandomInt(1, 100);
    let mainPos: number;
    
    if (chance > 25) { // 75% chance for CB, DM, MC, MR, ML, AMR, AML, ST
      
      let arr = [3, 6, 7, 8, 9, 10, 11, 13];
      shuffle(arr);
      mainPos = arr[getRandomInt(0, 7)];
    } else { // 25% chance for GK, RB, LB, LWB, RWB, AMC
      let arr = [0, 1, 2, 4, 5, 12];
      shuffle(arr);
      mainPos = arr[getRandomInt(0, 5)];
    }
    
    // USE THIS COMMENT IF YOU NEED TO ADD POSITIONS 
    
    // if (this.playerCount > 50 && (this.positions[0].amount < 3 || this.positions[3].amount < 3 || this.positions[13].amount < 2 || this.positions[7].amount < 3)) { 
    //   if (this.positions[0].amount < 3) {
    //     mainPos = 0;
    //   } else if (this.positions[3].amount < 3) {
    //     mainPos = 3;
    //   } else if (this.positions[13].amount < 2) {
    //     mainPos = 13;
    //   } else {
    //     mainPos = 7;
    //   }
    // }
    // If there are 7 players in a certain position, choose a different position that doesn't have 7
    if (this.positions[mainPos].amount > 6) {
      // Prioritize 4 GKs
      if (this.positions[0].amount < 4) {
        mainPos = 0;
      }
      // Then prioritize 4 CBs
      else if (this.positions[3].amount < 4) {
        mainPos = 3;
      }
      // Then prioritize 2 STs
      else if (this.positions[13].amount < 2) {
        mainPos = 13;
      }
      // Then priortize 3 CMs
      else if (this.positions[7].amount < 3) {
        mainPos = 7;
      }
      // Otherwise add to any position
      else { 
        for (let j = 0; j < this.positions.length; j++) {
          if (this.positions[mainPos].amount > 5) {
            mainPos = getRandomInt(0, 13);
          }
        }
      }
    }
    this.positions[mainPos].amount++
    
    let mainPositions = [];
    mainPositions.push(this.positions[mainPos].position);
    
    if (!(mainPos === 0 || mainPos === 3 || mainPos === 13))  {
      // 20-35% chance of two natural positions
      // 2-7% chance of three natural positions
      let highChance = 0;
      let lowChance = 0;
      if (rating > 69) {
        highChance = getRandomInt(1, 100)
      } else {
        lowChance = getRandomInt(1, 100);
      }
      let indexes = 0;
      let posArr: number[] = [];
      if (highChance > 58 || lowChance > 78) {
        indexes = 1;
      } else if (highChance > 93 || lowChance > 98) {
        indexes = 2;
      }
      switch (mainPos) {
        case 1: // RB
          posArr = [2, 3, 5, 6, 7, 9];
          break;
        case 2: // LB
          posArr = [1, 3, 4, 6, 7, 8];
          break;
        case 4: // LWB
          posArr = [2, 5, 6, 7, 8, 11];
          break;
        case 5: // RWB
          posArr = [1, 4, 6, 7, 9, 10];
          break;
        case 6: // DM
          posArr = [1, 2, 3, 7, 12];
          break;
        case 7: // MC
          posArr = [1, 2, 6, 8, 9, 12];
          break;
        case 8: // ML
          posArr = [2, 4, 7, 9, 10, 11];
          break;
        case 9: // MR
          posArr = [1, 5, 7, 8, 10, 11];
          break;
        case 10: // AMR
          posArr = [8, 9, 11, 12, 13];
          break;
        case 11: // AML
          posArr = [8, 9, 10, 12, 13];
          break;
        case 12: // AMC
          posArr = [6, 7, 10, 11, 13];
          break;
        default:
          break;
      }
      shuffle(posArr);
      for (let i = 0; i < indexes; i++) {
        let index = posArr[i];
        mainPositions.push(this.positions[index].position);
      }
      
    }
    return mainPositions
  }
            
  getAltPositions(mainPositions: string[], mainFoot: string) {
    let altPosCount = Math.min(getRandomInt(1, 3), getRandomInt(0, 3));
    let compPosCount = Math.min(getRandomInt(0, 2), getRandomInt(0, 2));
    let unPosCount = Math.min(getRandomInt(0, 2), getRandomInt(0, 2), getRandomInt(0, 2));
    
    let altPos: string[] = [];
    let compPos: string[] = [];
    let unconvincingPos: string[] = [];
    
    let arr: string[];
    
    let num: number;
    let str: string[];
    
    if (altPosCount === 0) {
      altPos = ['N/A'];
    } else {
      switch (mainPositions[0]) {
        case 'GK':
          altPos = ['N/A'];
          break;
        case 'CB':
          arr = ['DM', 'RB', 'LB'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('MC');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('AMC', 'ST');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'LB':
          arr = ['CB', 'LWB', 'ML', 'RB', 'DM', 'MC'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          
          arr.push('RWB', 'AML') ;
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          
          arr.push('MR', 'AMR', 'AMC');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) { 
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'RB':
          arr = ['CB', 'MR', 'RWB', 'LB', 'DM', 'MC'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('AMR', 'LWB');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('ML', 'AML', 'AMC');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'LWB':
          arr = ['RWB', 'ML', 'LB', 'AML', 'MC', 'DM'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('RB', 'MR');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('CB', 'AMC', 'AMR');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'RWB':
          arr = ['RB', 'MR', 'LWB', 'AMR', 'MC', 'DM'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('LB', 'ML');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('CB', 'AMC', 'AML');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'MR':
          arr = ['RB', 'RWB', 'ML', 'MC', 'AMR', 'AML'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('LWB', 'DM', 'AMC');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('LB', 'ST');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'ML':
          arr = ['LB', 'LWB', 'MR', 'MC', 'AML', 'AMR'];
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('RWB', 'DM', 'AMC');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('RB', 'ST');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'AMR':
          arr = ['AML', 'AMC', 'ST'];
          
          if (mainFoot === 'right') {
            arr.push('MR', 'RWB');
          } else if (mainFoot === 'left') {
            arr.push('ML' , 'LWB');
          } else {
            arr.push('MR', 'ML', 'RWB', 'LWB');
          }
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
    
          if (mainFoot === 'right') {
            arr.push('ML', 'LWB', 'MC');
          } else if (mainFoot === 'left') {
            arr.push('MR' , 'RWB', 'MC');
          } else {
            arr.push('MC');
          }
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('RB', 'LB', 'DM');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'AML':
          arr = ['AMR', 'AMC', 'ST'];
          
          if (mainFoot === 'right') {
            arr.push('MR', 'RWB');
          } else if (mainFoot === 'left') {
            arr.push('ML' , 'LWB');
          } else {
            arr.push('MR', 'ML', 'RWB', 'LWB');
          }
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }

          if (mainFoot === 'right') {
            arr.push('ML', 'LWB', 'MC');
          } else if (mainFoot === 'left') {
            arr.push('MR' , 'RWB', 'MC');
          } else {
            arr.push('MC');
          }
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('RB', 'LB', 'DM');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'DM':
          arr = ['CB', 'MC', 'AMC'];
          
          if (mainFoot === 'right') {
            arr.push('RB');
          } else if (mainFoot === 'left') {
            arr.push('LB');
          } else {
            arr.push('RB', 'LB');
          }
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }

          if (mainFoot === 'right') {
            arr.push('LB', 'LWB', 'RWB', 'MR', 'ML', 'ST');
          } else if (mainFoot === 'left') {
            arr.push('RB', 'LWB', 'RWB', 'MR', 'ML', 'ST');
          } else {
            arr.push('LWB', 'RWB', 'MR', 'ML', 'ST');
          }

          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('AMR', 'AML');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'MC':
          arr = ['DM', 'AMC'];
          
          if (mainFoot === 'right') {
            arr.push('MR');
          } else if (mainFoot === 'left') {
            arr.push('ML');
          } else {
            arr.push('MR', 'ML');
          }
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }

          if (mainFoot === 'right') {
            arr.push('ML', 'RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML');
          } else if (mainFoot === 'left') {
            arr.push('MR', 'RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML');
          } else {
            arr.push('RWB', 'LWB', 'CB', 'ST', 'RB', 'LB', 'AMR', 'AML');
          }
        
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'AMC':
          arr = ['DM', 'MC', 'AMR', 'AML', 'ST'];
          
          if (mainFoot === 'right') {
            arr.push('MR');
          } else if (mainFoot === 'left') {
            arr.push('ML');
          } else {
            arr.push('MR', 'ML');
          }
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }

          if (mainFoot === 'right') {
            arr.push('ML');
          } else if (mainFoot === 'left') {
            arr.push('MR');
          } else {

          }

          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('LWB', 'RWB', 'RB', 'LB', 'CB');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
            }
          }
          break;
        case 'ST':
          arr = ['AMC', 'AMR', 'AML', 'MC']; 
          // alternate positions
          for (let i = 1; i < mainPositions.length; i++) {
            let altIndex = arr.indexOf(mainPositions[i]);
            if (altIndex > -1) {
              arr.splice(altIndex, 1);
            }
          }
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < altPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              
              altPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('DM', 'MR', 'ML');
          // competent positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < compPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              compPos.push(arr[num]);
              let index = arr.indexOf(arr[num]);
              if (index > -1) {
                arr.splice(index, 1);
              }
            }
          }
          arr.push('RWB', 'LWB', 'CB');
          // unconvincing positions
          num = getRandomInt(0, arr.length - 1);
          for (let i = 0; i < unPosCount; i++) {
            if (arr.length > 0) {
              if (num - i < 0) {
                num = arr.length;
              }
              // str = arr[num - i].split(', ');
              unconvincingPos.push(arr[num]);
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
            
  getPositionRole(mainPosArr: string[], altPosArr: string[], foot: string, rating: number, age: number) {
    let num1, num2, role, duty;
    let roles: string[];
    let duties: string[];
    let arr = [];
    let pos = mainPosArr[0];
    let chance: number;
    switch (pos) {
      case 'GK': // roles = ['GK', 'SK'];
        chance = getRandomInt(1, 4);
        // better gk is more likely to be sweeper keeper
        if (rating > 69) {
          chance > 1 ? num1 = 1: num1 = 0;
        } else {
          chance > 1 ? num1 = 0: num1 = 1;
        }
        num2 = getRandomInt(0, 2);
        roles = ['GK', 'SK'];
        duties = ['De', 'Su', 'At'];
        if (num1 === 0) {
          num2 = 0;
        }    
        break;
      case 'RB':
      case 'LB': // roles = ['IWB', 'WB', 'FB', 'CWB', 'DFB'];
        roles = ['IWB', 'WB', 'FB', 'CWB', 'DFB'];
        
        if (rating > 64) {
          chance = getRandomInt(1, 4);
          if ((pos === 'RB' && foot === 'left') || (pos === 'LB' && foot === 'right')) {
            num1 = 0;
          } else if (mainPosArr.includes('CB')) {      
            chance > 1 ? num1 = 2: num1 = 1;
          } else {
            chance > 1 ? num1 = getRandomInt(1, 2): num1 = 3;
          }
        } else {
          chance = getRandomInt(1, 4);
          // 75% chance of full back and 25% for no nonsense full back
          chance > 1 ? num1 = 2: num1 = 4;
        }
        
        num2 = getRandomInt(0, 2);
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
      case 'LWB': // roles = ['IWB', 'WB', 'CWB'];
        
        roles = ['IWB', 'WB', 'CWB'];
        if (rating > 64) {
          if ((pos === 'RWB' && foot === 'left') || (pos === 'LWB' && foot === 'right')) {
            num1 = 0;
          } else {
            chance = getRandomInt(1, 4);
            chance > 1 ? num1 = 1: num1 = 2;
          }
        } else {
          if ((pos === 'RWB' && foot === 'left') || (pos === 'LWB' && foot === 'right')) {
            num1 = 0;
          } else {
            num1 = 1;
          }
        }
        
        
        num2 = getRandomInt(0, 2);
        duties = ['De', 'Su', 'At'];
        if (num1 === 2) {
          duties = ['Su', 'At'];
          num2 = getRandomInt(0, 1);
        }
        break;
      case 'CB': // roles = ['NCB', 'BPD', 'CD', 'WCB', 'L'];
        roles = ['NCB', 'BPD', 'CD', 'WCB'];
        chance = getRandomInt(1, 40);
        if (rating > 70) {
          if (chance > 38) {
            num1 = 0;
          } else if (chance > 34) {
            num1 = 1;
          } else {
            num1 = 2;
          }
        } else {
          if (chance > 38) {
            num1 = 1;
          } else if (chance > 34) {
            num1 = 0;
          } else {
            num1 = 2;
          }
        }
        
        num2 = getRandomInt(0, 2);
        duties = ['De', 'Co', 'St'];
        if (num1 > 2) {
          duties = ['De', 'Su', 'At'];
        }
        
        break;
      case 'DM': // roles = ['A', 'HB', 'DM', 'BWM', 'DLP', 'RGA', 'RPM', 'VOL'];
        // A and VOL is 10%
        // DM and DLP are 40%
        // BWM is 50%
        roles = ['VOL', 'A', 'DM', 'DLP', 'BWM'];
        chance = getRandomInt(1, 10);
        if (chance > 9) {
          num1 = getRandomInt(0, 1);
        } else if (chance > 5) {
          num1 = getRandomInt(2, 3);
        } else {
          num1 = 4;
        }

        num2 = getRandomInt(0, 1);
        duties = ['De', 'Su'];
        if (num1 === 1) {
          duties = ['De'];
          num2 = 0;
        } else if (num1 === 0) {
          duties = ['Su', 'At'];
          num2 = getRandomInt(0, 1);
        }
        break;
      case 'MC': // roles = ['DLP', 'BWM', 'RPM', 'CM', 'CAR', 'BBM', 'MEZ', 'AP'];
        roles = ['DLP', 'BWM', 'CM', 'CAR', 'BBM', 'MEZ', 'AP'];
        // DLP and AP are 500 each
        // BWM is 1000
        // CM is 2000
        // BBM 200
        // Mez is 850
        // CAR
        if (rating > 64) {
          chance = getRandomInt(1, 50);
          if (chance > 49) {
            num1 = 3;
          } else if (chance > 45) {
            num1 = 4;
          } else {
            arr = [getRandomInt(0, 2), getRandomInt(5, 6)];
            num1 = arr[getRandomInt(0, 1)];
          }

          if (num1 < 2) {
            duties = ['De', 'Su'];
            num2 = getRandomInt(0, 1);
          } else if (num1 > 4) {
            duties = ['Su', 'At'];
            num2 = getRandomInt(0, 1);
          } else if (num1 === 2) {
            duties = ['De', 'Su', 'At'];
            num2 = getRandomInt(0, 2);
          } else {
            num2 = 0;
            duties = ['Su'];
          }
        } else {
          roles = ['CM', 'BWM', 'DLP', 'AP', 'BBM'];
          //
          chance = getRandomInt(1, 50);
          if (chance > 49) {
            num1 = 4;
          } else if (chance > 35) {
            num1 = getRandomInt(1, 2);
          } else if (chance > 25) {
            num1 = 1;
          } else {
            num1 = 0;
          }

          if (num1 < 1) {
            duties = ['De', 'Su', 'At'];
            num2 = getRandomInt(0, 2);
          } else if (num1 < 3) {
            duties = ['De', 'Su'];
            num2 = getRandomInt(0, 1);
          } else if (num1 < 4) {
            duties = ['Su', 'At'];
            num2 = getRandomInt(0, 1);
          } else {
            duties = ['Su'];
            num2 = 0;
          }
        }
        break;
      case 'AMC': // roles = ['AP', 'AM', 'EG', 'T', 'SS'];
        
        num1 = getRandomInt(0, 4);
        num2 = getRandomInt(0, 1);
        roles = ['AP', 'AM', 'EG', 'SS'];
        if (age > 33) {
          num1 = 2;
        } else {
          chance = getRandomInt(1, 4);
          if (mainPosArr.includes('ST')) {
            num1 = 3;
          } else if (mainPosArr.includes('DM')) {
            num1 = getRandomInt(0, 1);
          } else {
            chance > 1 ? num1 = getRandomInt(0, 1): num1 = 3;
          }
        }

        
        
        if (num1 === 3) {
          duties = ['At'];
          num2 = 0;
        } else if (num1 === 2) {
          duties = ['Su'];
          num2 = 0;
        } else {
          duties = ['Su', 'At'];
        }
        break;
      case 'MR':
      case 'ML': // roles = ['W', 'IW', 'WP', 'WM', 'DW'];
        roles = ['W', 'IW', 'WP', 'WM', 'DW'];
        duties = ['Su', 'At'];
        chance = getRandomInt(1, 10);
        if (rating > 64) {
          num1 = 0;
          if ((foot === 'right' && pos === 'ML') || (foot === 'left' && pos === 'MR')) {
            num1 = 1;
          }
        } else {
          chance > 1 ? num1 = 0: num1 = 4;
          if ((foot === 'right' && pos === 'ML') || (foot === 'left' && pos === 'MR')) {
            num1 = 1;
          }
        }
        num2 = getRandomInt(0, 1);
        
        
        if (num1 > 3) {
          duties = ['De', 'Su'];
        } else if (num1 > 2) {
          duties = ['De', 'Su', 'At'];
          num2 = getRandomInt(0, 2);
        }
        break;
      case 'AMR':
      case 'AML': // roles = ['W', 'IW', 'AP', 'IF', 'WT', 'T', 'RMD'];
        roles = ['W', 'IW', 'AP', 'IF', 'WT', 'T', 'RMD'];
        duties = ['Su', 'At'];
        chance = getRandomInt(1, 20);
        
        if ((pos === 'AMR' && foot === 'left') || (pos === 'AML' && foot === 'right')) {
          chance > 1 ? num1 = 1: num1 = 3;
        } else {
          chance > 1 ? num1 = 0: num1 = 2;
        }
        num2 = getRandomInt(0, 1);
        if (num1 > 4) {
          duties = ["At"];
          num2 = 0;
        }
        break;
      case 'ST': // roles = ['AF', 'P', 'T', 'CF', 'TF', 'DLF', 'F9', 'PF'];
        roles = ['P', 'AF', 'TF', 'PF', 'DLF'];
        duties = ['Su', 'At'];
        chance = getRandomInt(1, 2);
        // 50% chance for Poacher / 50% for all other positions
        chance > 1 ? num1 = 0: num1 = getRandomInt(1, 4);
        num2 = getRandomInt(0, 1);
        
        if (num1 < 2) {
          duties = ['At'];
          num2 = 0;
        } else if (num1 === 3) {
          duties = ['De', 'Su', 'At'];
          num2 = getRandomInt(0, 2);
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
      else {return 'left'}
      case 'AML':
      case 'ML':
      if (num < 50) { return 'left' }
      else { return 'right' }
      case 'LB':
      case 'LWB':
      if (num < 75) {return 'left'}
      else {return 'right'}
      case 'AMR':
      case 'MR':
      if (num < 70) {return 'right'}
      else {return 'left'}
      case 'RB':
      case 'RWB':
      if (num < 98) {return 'right'}
      else {return 'left'}
      
      default:
        console.log('Error in the function getPlayerFoot()');
        return 'Error with getFoot(), check console';
    }
  }
            
            
            
  getRatingBreakdown(tier: string): number[] {
    switch (tier) {
      case "s":
        return [3, 9, 10, 30, 40, 70, 150, 200, 0, 0, 0, 0, 0, 0, 0, 0];
      case "a":
        return [2, 5, 4, 12, 16, 45, 45, 70, 0, 0, 0, 0, 0, 0, 0, 0];
      case "b":
        return [0, 4, 2, 5, 4, 15, 15, 60, 45, 100, 0, 0, 0, 0, 0, 0];
      case "c":
        return [0, 2, 0, 3, 3, 12, 10, 25, 30, 70, 60 , 160, 0, 0, 0, 0];
      case "d":
        return [0, 2, 0, 3, 1, 7, 5, 25, 30, 65, 100 , 200, 0, 0, 0, 0];
      case "e":
        return [0, 1, 0, 3, 0, 6, 6, 18, 12, 40, 38, 75, 10, 10, 0, 0];
      case "f":
        return [0, 1, 0, 2, 0, 4, 0, 8, 8, 22, 30, 100, 25, 25, 0, 0];
      case "g":
        return [0, 1, 0, 1, 0, 4, 0, 6, 8, 18, 25, 45, 30, 30, 0, 0];
      case "h":
        return [0, 0, 0, 1, 0, 2, 0, 5, 2, 10, 12, 35, 25, 115, 25, 25];
      case "i":
        return [0, 0, 0, 1, 0, 1, 0, 4, 1, 7, 2, 18, 20, 90, 40, 40];
      case "j":
        return [0, 0, 0, 1, 0, 1, 0, 4, 0, 5, 1, 12, 4, 50, 55, 55];
      case "k":
        return [0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 4, 5, 25, 60, 60]; 
      case "l":
        return [0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 3, 0, 10, 60, 60];
      default:
        throw new Error("getRatingBreakdown() had an error");
    }
  }
            
  getRatingAndClubRep(i: number, first: number, second: number, third: number, fourth: number, fifth: number, sixth: number, seventh: number, eighth: number) {
    
    let rating: number = 0;
    let clubRep = "";
    let chance = getRandomInt(1, 20);
    if (i < first) {
      if (chance > 1) {
        rating = Math.min(getRandomInt(82, 89),getRandomInt(82, 89));
      } else {
        rating = Math.min(getRandomInt(88, 99),getRandomInt(88, 99), getRandomInt(88, 99));
      }
      clubRep = "top50";
    } else if(i < first + second) {
      rating = getRandomInt(76, 81);
      clubRep = "top200";
    } else if (i < first + second + third) {
      rating = getRandomInt(70, 75);
      clubRep = "regularInternational";
    } else if (i < first + second + third + fourth) {
      rating = getRandomInt(65, 69);
      clubRep = "averagePlayer"
    } else if (i < first + second + third + fourth + fifth) {
      rating = getRandomInt(60, 65);
      clubRep = "championshipPlayer";
    } else if (i < first + second + third + fourth + fifth + sixth) {
      rating = getRandomInt(55, 61);
      clubRep = "leagueOnePlayer";
    } else if (i < first + second + third + fourth + fifth + sixth + seventh) {
      rating = getRandomInt(48, 54);
      clubRep = "leagueTwoPlayer";
    } else if (i < first + second + third + fourth + fifth + sixth + seventh + eighth) {
      rating = getRandomInt(30, 47);
      clubRep = "fillerPlayer";
    }
    
    return {
      rating, 
      clubRep
    };
  }
            
  getAttributes(pos: string, altPos: string[], role: string, duty: string, rating: number, age: number) {
    let height = 0; // in inches
    let weight = 0; // in lbs
    let weakFoot = 0; // 1-4 very weak, 5-8 weak, 8-11 reasonable, 12-14 fairly strong, 15-17 strong, 18-20 very strong
    // very weak and weak is right/left only, reasonable and fairly strong is right/left, and strong and very strong is either footed
    let bmi = median([getRandomInt(19, 29), getRandomInt(19, 29)]);
    
    if (pos === 'GK') {
      height = median([getRandomInt(69, 78), getRandomInt(69, 78)]);
    } else {
      height = median([getRandomInt(62, 78), getRandomInt(62, 78)]);
    }
    
    weight = Math.round((bmi * Math.pow(height, 2)) / 703);
    
    
    // current ability / potential ability
    let currentAbility = rating * 2;
    let potentialAbility;
    let gkAttributes = {} as GkAttributes;
    let outAttributes = {} as OutfieldAttributes;
    let attributes = {};
    
    switch (pos) {
      case "GK":
      
      // 2.5, 1.65, 0.92, 0.6, 0.35, 0.125, 0
      let attr25 = ['handling', 'reflexes']; 
      let attr17 = ['aerialReach', 'commandOfArea', 'communication', 'kicking', 'oneOnOnes', 'bravery', 'concentration', 'decisions', 'positioning', 'agility'];
      let attr09 = ['throwing', 'acceleration', 'strength'];
      let attr06 = ['weakFoot'];
      let attr04 = ['anticipation', 'composure', 'leadership', 'teamwork', 'balance', 'pace'];
      let attr01 = ['firstTouch', 'vision', 'workRate', 'jumpingReach', 'stamina', 'technique'];
      let attr0 = ['eccentricity', 'freeKickTaking', 'penalty taking', 'rushingOutTendency', 'punchingTendency', 'aggression', 'determination', 'flair', 'offTheBall', 'naturalFitness'];
      for (let i = 0; i < attr0.length; i++) {
        gkAttributes[attr0[i]] = getRandomInt(1, 20);
      } 
      let ability = 0;
      while (ability < currentAbility) {
        //green attributes
        gkAttributes.reflexes = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
        gkAttributes.kicking = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
        gkAttributes.commandOfArea = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
        gkAttributes.concentration = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
        gkAttributes.positioning = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
        gkAttributes.agility = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
        // blue attributes
        gkAttributes.throwing = getRandomInt(5, 20);
        gkAttributes.decisions = getRandomInt(5, 20);
        // others
        gkAttributes.eccentricity = getRandomInt(1, 20);
        gkAttributes.punchingTendency = getRandomInt(1, 20);
        if (role === 'GK') {
          // green attributes
          gkAttributes.aerialReach = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          gkAttributes.communication = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          gkAttributes.handling = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          // blue attributes
          gkAttributes.oneOnOnes = getRandomInt(5, 20);
          gkAttributes.anticipation = getRandomInt(5, 20);
          // others
          gkAttributes.firstTouch = getRandomInt(1, 20);
          gkAttributes.passing = getRandomInt(1, 20);
          gkAttributes.rushingOutTendency = getRandomInt(1, 20);
          gkAttributes.composure = getRandomInt(1, 20);
          gkAttributes.vision = getRandomInt(1, 20);
          gkAttributes.acceleration = getRandomInt(1, 20);
        } else if (role === 'SK') {
          // green attributes
          gkAttributes.oneOnOnes = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          gkAttributes.rushingOutTendency = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          gkAttributes.anticipation = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          gkAttributes.composure = Math.max(getRandomInt(5, 20), getRandomInt(5, 20));
          // blue attributes
          gkAttributes.aerialReach = getRandomInt(5, 20);
          gkAttributes.communication = getRandomInt(5, 20);
          gkAttributes.handling = getRandomInt(5, 20);
          gkAttributes.firstTouch = getRandomInt(5, 20);
          gkAttributes.passing = getRandomInt(5, 20);
          gkAttributes.vision = getRandomInt(5, 20);
          gkAttributes.acceleration = getRandomInt(5, 20);
          // others
        }
        
      }
      attributes = gkAttributes;        
      
      break
      case "CB":
      
      break
      case "RB":
      case "LB":
      
      break
      case "RWB":
      case "LWB":
      
      break
      case "DM":
      
      break
      case "MR":
      case "ML":
      
      break
      case "MC":
      
      break
      case "AMR":
      case "AML":
      
      break
      case "AMC":
      
      break
      case "ST":
      
      break
      default:
      attributes = outAttributes;
      break
    }
    
    return {
      height,
      weight,
      weakFoot,
      attributes
    }
  }
            
  getClub(clubRep: string, playerNation: string) {
    let clubArr: any[] =  this.clubs[clubRep];
    let nationObj;
    for (const nation of this.nationsList) {
      if (nation.name === playerNation) {
        nationObj = nation;
      }
    }
    let clubName: string = "";
    let clubLogoUrl: string = "";
    
    shuffle(clubArr);
    // console.log(clubRep, "ClubArr after shuffle: ", clubArr);
    
    // 50% chance for mainLeague
    let main = getRandomInt(1, 2);
    
    if (main < 2) {
      for (let i = 0; i < clubArr.length; i++) {
        if (nationObj.mainLeagues.includes(clubArr[i].league)) {
          clubName = clubArr[i].club;
          clubLogoUrl = clubArr[i].logo;
          return {
            clubName,
            clubLogoUrl
          }
        }
      }
    } 
    // 30% chance for secondLeague
    let secondary = getRandomInt(1, 10);
    
    if (secondary < 4 && clubName === "") {
      for (let i = 0; i < clubArr.length; i++) {
        if (nationObj.secondLeagues.includes(clubArr[i].league)) {
          clubName = clubArr[i].club;
          clubLogoUrl = clubArr[i].logo;
          return {
            clubName,
            clubLogoUrl
          }
        }
      }
    }
    // 15% chance for thirdLeague
    let tertiary = getRandomInt(1, 100);
    
    if (tertiary < 16 && clubName === "") {
      for (let i = 0; i < clubArr.length; i++) {
        if (nationObj.thirdLeagues.includes(clubArr[i].league)) {
          clubName = clubArr[i].club;
          clubLogoUrl = clubArr[i].logo;
          return {
            clubName,
            clubLogoUrl
          }
        }
      }
    }
    
    // 5% chance for thirdLeague
    let rare = getRandomInt(1, 100);
    
    if (rare < 6 && clubName === "") {
      for (let i = 0; i < clubArr.length; i++) {
        if (nationObj.rareLeagues.includes(clubArr[i].league)) {
          clubName = clubArr[i].club;
          clubLogoUrl = clubArr[i].logo;
          return {
            clubName,
            clubLogoUrl
          }
        }
      }
    }
    
    // if still no club, choose a random club
    for (let i = 0; i < clubArr.length; i++) {
      if (!(clubArr[i].league === nationObj.excludeLeagues)) { // check for excluded league
        clubName = clubArr[i].club;
        clubLogoUrl = clubArr[i].logo;
        return {
          clubName,
          clubLogoUrl
        }
      }
    }
    
    return {
      clubName,
      clubLogoUrl
    }
  }
            
  getAge(rating: number, mainPos: string) {
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

    if (mainPos === 'GK') {
      if (ageIndex < 1) {
        return 17
      } else if (ageIndex < 2) {
        return 18
      } else if (ageIndex < 5) {
        return 19
      } else if (ageIndex < 10) {
        return 20
      } else if (ageIndex < 15) {
        return 21
      } else if (ageIndex < 25) {
        return 22
      } else if (ageIndex < 51) {
        return 23
      } else if (ageIndex < 91) {
        return 24
      } else if (ageIndex < 141) {
        return 25
      } else if (ageIndex < 191) {
        return 26
      } else if (ageIndex < 246) {
        return 27
      } else if (ageIndex < 301) {
        return 28
      } else if (ageIndex < 371) {
        return 29
      } else if (ageIndex < 441) {
        return 30
      } else if (ageIndex < 516) {
        return 31
      } else if (ageIndex < 591) {
        return 32
      } else if (ageIndex < 666) {
        return 33
      } else if (ageIndex < 741) {  
        return 34
      } else if (ageIndex < 816) {
        return 35
      } else if (ageIndex < 881) {
        return 36
      } else if (ageIndex < 931) {
        return 37
      } else if (ageIndex < 966) {
        return 38
      } else if (995) {
        return 39
      } else {
        return 40
      }
    } else {
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
    
  }
            
  getRandomNationTier(rating: number) {
    let randomNum = getRandomInt(1, 100);
    let half = getRandomInt(0, 1);
    let third = getRandomInt(0, 2);
    let quarter = Math.min(getRandomInt(0, 3), getRandomInt(0, 3));
    let tier = "";
    if (rating > 75) {
      if (randomNum > 50) {
        if (third < 2) {
          tier = "s";
        } else {
          tier = "a";
        }
      } else if (randomNum > 22) {
        if (half > 0) {
          tier = "b";
        } else {
          tier = "c";
        }
      } else{
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
      }
    } else if (rating > 59) {
      if (randomNum > 50) {
        switch (quarter) {
          case 0:
          tier = "s";
          break;
          case 1:
          tier = "a";
          break;
          case 2:
          tier = "b";
          break;
          case 3:
          tier = "c";
          break;
          default:
          tier = "s";
          break;
        }
      } else if (randomNum > 20) {
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
        switch (quarter) {
          case 0:
          tier = "h";
          break;
          case 1:
          tier = "i";
          break;
          case 2:
          tier = "j";
          break;
          case 3:
          tier = "k";
          break;
          default:
          tier = "h";
          break;
        }
      }
    } else {
      let arr = ["s", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
      let i = Math.min(getRandomInt(0, arr.length - 1), getRandomInt(0, arr.length - 1));
      tier = arr[i];
    }
    tier += " tier";
    return tier
  }
            
  async savePlayers(saveLocation: string, saveName?: string) {
    if (saveLocation == 'localStorage') {
      if (localStorage.length > 1) {
        if (window.confirm("Are you sure you want to overwrite your current roster saved in Local Storage?")) {
          let user = localStorage.getItem('user');
          let rosters = [];
          for (let i = 0; i < 100; i++) {
            let roster = localStorage.getItem(`Roster #${i}`) || null;
            if (roster === null) {
              break;
            }
            rosters.push(roster);
          }
          localStorage.clear();
          if (user !== null) {
            localStorage.setItem('user', user);
          }
          if (rosters.length > 0) {
            for (let i = 0; i < rosters.length; i++) {
              localStorage.setItem(`Roster #${i}`, rosters[i]);
            }
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
      localStorage.setItem(`TEAMGEN - Tier/Nationality`, JSON.stringify(this.nationOrTier));
      localStorage.setItem(`Firestore ID`, JSON.stringify(this.rosterId));
      console.log(this.rosterId);
    }
    else if (saveLocation === 'firestore' && saveName !== undefined) {
      if (!this.isLoggedIn) {
        alert('You must be logged in to save roster to cloud');
        return false
      }
      if (saveName.length < 4) {
        alert('Must be 4-20 characters long.');
        return false
      }
      let user = JSON.parse(localStorage.getItem('user') || '');
      for (let i = 0; i < this.savedData.length; i++) {
        console.log(this.rosterId, saveName)
        // if it's a duplicate roster
        if (this.savedData[i].id === this.rosterId) {
          // duplicateId = true;
          if (window.confirm(`This is already saved, would you like to update the save name and roster`)) {
            this.afs.updateRoster(user.uid, saveName, this.players, this.pitchPlayers, this.rosterId);
            this.saveDataOverlayOpen = false;
          } else {
            return false
          }
        }
        // if it's a duplicate saveName
        else if (this.savedData[i].saveName === saveName) {
          // ask the user if they want to overwrite
          if (window.confirm(`${saveName} is already a roster name. Overwrite?`)) {
            this.afs.saveRoster(user.uid, saveName, this.players, this.pitchPlayers, this.nationOrTier)
            .then((docRef) => {
              this.rosterId = docRef.id;
              console.log("new roster id:\n", this.rosterId);
            });
            this.saveDataOverlayOpen = false;
          } else {
            return false
          }
        }
        
      } 
      if (window.confirm("Are you sure you want to save?")) {
        this.afs.saveRoster(user.uid, saveName, this.players, this.pitchPlayers, this.nationOrTier)
        .then((docRef) => {
          this.rosterId = docRef.id;
          console.log("new roster id:\n", this.rosterId);
        });
        this.saveDataOverlayOpen = false;
      } else {
        return false
      }
      
    }
    else {
      throw new Error("Problem with savePlayers() function");
    } 
    
  }
            
  saveDataOverlay() {
    this.loadDataOverlayOpen = false;
    if (this.saveDataOverlayOpen === false) {
      this.saveDataOverlayOpen = true;
    } else {
      this.saveDataOverlayOpen = false;
    }
    if (this.savedData.length < 1) {
      console.time('label');
      this.loadDataOverlay('save');
    }
  }
            
  loadDataOverlay(loadMore?: string) {
    if (loadMore !== 'save') {
      this.loadDataOverlayOpen = true;
      this.saveDataOverlayOpen = false;
      if (loadMore !== 'check'){
        return false;
      }
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
        let save = roster.payload.doc.data().saveName;
        let duplicateId = false;
        for (let i = 0; i < this.savedData.length; i++) {
          if (this.savedData[i].id === id) {
            duplicateId = true;
          }
        }
        if (!duplicateId) {
          this.savedData.push({id: id, saveName: save});
        }
        
      }
      console.log(this.savedData);
      
    });
    
  }
  
  closeLoadDataOverlay() {
    this.loadDataOverlayOpen = false;
  }
            
  loadPlayers(saveLocation: string) {
    this.loadDataOverlayOpen = false;
    if (saveLocation === 'loadLocalStorage') {
      if (localStorage.length > 1) {
        this.players = [];
        this.sortedData = [];
        this.pitchPlayers = [];
        this.nationOrTier = localStorage.getItem(`TEAMGEN - Tier/Nationality`) || '';
        this.nationOrTier = this.nationOrTier.slice(1, -1);
        this.rosterId = localStorage.getItem(`Firestore ID`) || '';
        this.rosterId = this.rosterId.slice(1, -1);
        for (let index in this.positions) {
          this.positions[index].amount = 0;
        }
        for (const box of this.positionBoxes) {
          box.playerClass = 'inactive player-box';
          box.posBoxClass = 'active pos-box';
          box.pitchPlayer = undefined;
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
            }
            
          }
        }
        
        this.calcStartersRating();
        this.squadTotalRating = 0;
        for (let i = 0; i < 12; i++) {
          ratingArr.push(this.players[i].rating);
        }
        let sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0);
        let avg = sum / ratingArr.length;
        this.squadTotalRating = Math.round(avg * 10) / 10;
        
        this.checkStars(this.startersTotalRating, this.squadTotalRating);
        
        let combinedPlayers = this.pitchPlayers.concat(this.players);
        for (const player of combinedPlayers) {      
          for (const pos of this.positions) {
            if (player.mainPositions[0] === pos.position) {
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
          this.squadRules[8].text = '';
        }
        if (this.pitchPlayers.length === 11) {
          this.getBackupPositions();
        } else {
          this.squadRules[7].check = '❌';
        }
        console.log("Successfully loaded", this.players, this.pitchPlayers);
      } else {
        throw new Error("Local Storage Data not found");
      }
    } else {
      let user = JSON.parse(localStorage.getItem('user') || '');
      for (const box of this.positionBoxes) {
        box.playerClass = 'inactive player-box';
        box.posBoxClass = 'active pos-box';
        box.pitchPlayer = undefined;
      }
      for (let index in this.positions) {
        this.positions[index].amount = 0;
      }
      this.players = [];
      this.sortedData = [];
      this.pitchPlayers = [];
      this.afs.getRoster(user.uid, saveLocation).subscribe((obj) => {
        const data = obj.payload.data();
        if (data !== undefined) {
          
          this.players = data.benchReserves;
          this.sortedData = data.starters.concat(data.benchReserves);
          this.pitchPlayers = data.starters;
          this.nationOrTier = data.nationOrTier;
          this.rosterId = obj.payload.id;
          console.log("Firestore ID", this.rosterId);
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
            }
            
          }
        }
        
        this.calcStartersRating();
        
        this.squadTotalRating = 0;
        for (let i = 0; i < 12; i++) {
          ratingArr.push(this.players[i].rating);
        }
        let sum = ratingArr.reduce((partial_sum, a) => partial_sum + a,0);
        let avg = sum / ratingArr.length;
        this.squadTotalRating = Math.round(avg * 10) / 10;
        
        this.checkStars(this.startersTotalRating, this.squadTotalRating);
        
        let combinedPlayers = this.pitchPlayers.concat(this.players);
        for (const player of combinedPlayers) {      
          for (const pos of this.positions) {
            if (player.mainPositions[0] === pos.position) {
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
          this.squadRules[8].text = '';
        }
        if (this.pitchPlayers.length === 11) {
          this.getBackupPositions();
        } else {
          this.squadRules[7].check = '❌';
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
          
function shuffle(array: any[]) {
  let currentIndex = array.length,  randomIndex;
  
  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  
  return array;
}
          
function getRandomInt(min: number, max: number) {
  // let seed = xmur3("string-seed");
  // let rand = mulberry32(seed());
  min = Math.ceil(min);
  max = Math.floor(max);
  
  return Math.floor(Math.random() * (max - min + 1) + min);
  //The maximum is inclusive and the minimum is inclusive
}
          